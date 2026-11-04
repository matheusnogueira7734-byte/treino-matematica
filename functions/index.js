// IA livre do site. Não testada contra o serviço real: confira o nome do modelo e rode um teste após publicar.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cfg = require("./config.json");
admin.initializeApp();
const KEY = defineSecret("ANTHROPIC_API_KEY");

const SYSTEM = "Você é um assistente de matemática para alunos brasileiros. Responda em português, de forma curta e passo a passo. Não entregue só a resposta final: ajude o aluno a entender.";

exports.ia = onCall({ secrets: [KEY], region: "southamerica-east1", maxInstances: 5 }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Entre com sua conta.");
  const email = String(req.auth.token.email || "").toLowerCase();
  const db = admin.firestore();
  const ok = req.auth.token.email_verified && (cfg.adminEmails.includes(email) || email.endsWith(cfg.domain) ||
    (await db.doc(`allow/${email}`).get()).exists);
  if (!ok) throw new HttpsError("permission-denied", "Conta não autorizada.");

  const day = new Date().toISOString().slice(0, 10);
  const ref = db.doc(`iaUse/${req.auth.uid}_${day}`);
  const n = ((await ref.get()).data() || {}).n || 0;
  if (n >= cfg.dailyLimit) throw new HttpsError("resource-exhausted", "Limite diário de perguntas atingido.");

  const msgs = (req.data.m || []).slice(-12).map(m => ({
    role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 4000) }));
  if (!msgs.length || msgs[0].role !== "user") throw new HttpsError("invalid-argument", "Mensagem inválida.");

  // FUTURO: aqui entra o material didático da escola (busca por trechos) e vai no "system".
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": KEY.value(), "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: cfg.model, max_tokens: 800, system: SYSTEM, messages: msgs })
  });
  if (!r.ok) throw new HttpsError("internal", "A IA não respondeu agora.");
  const j = await r.json();
  await ref.set({ n: n + 1 });
  return { text: (j.content || []).map(b => b.text || "").join("") };
});
