// Funções de sala e publicação de exercícios com isolamento por matrícula.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const cfg = require("./config.json");
admin.initializeApp();
const KEY = defineSecret("ANTHROPIC_API_KEY");
const db = admin.firestore();

async function requireMember(req) {
  if (!req.auth) throw new HttpsError("unauthenticated", "Entre com sua conta.");
  const email = String(req.auth.token.email || "").toLowerCase();
  const allowDoc = await db.doc(`allow/${email}`).get();
  const allowed = req.auth.token.email_verified && (
    cfg.adminEmails.map(x => String(x).toLowerCase()).includes(email) ||
    email.endsWith(cfg.domain) || allowDoc.exists
  );
  if (!allowed) throw new HttpsError("permission-denied", "Conta não autorizada.");
  return { uid: req.auth.uid, email };
}

exports.joinRoom = onCall({ region: "southamerica-east1", maxInstances: 10 }, async (req) => {
  const user = await requireMember(req);
  const code = String((req.data || {}).code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(code)) throw new HttpsError("invalid-argument", "Código inválido.");
  const roomRef = db.doc(`rooms/${code}`);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) throw new HttpsError("not-found", "Sala não encontrada.");
  let room = {};
  try { room = JSON.parse(roomSnap.get("j") || "{}"); } catch (_) { room = {}; }
  const role = room.o === user.uid ? "guide" : "student";
  const memberRef = roomRef.collection("members").doc(user.uid);
  const memberSnap = await memberRef.get();
  const memberData = { uid: user.uid, email: user.email, role, status: "active" };
  if (!memberSnap.exists) memberData.joinedAt = admin.firestore.FieldValue.serverTimestamp();
  await memberRef.set(memberData, { merge: true });
  return { code, name: String(room.n || "Sala").slice(0, 60), role };
});

exports.publishRoomBank = onCall({ region: "southamerica-east1", maxInstances: 5 }, async (req) => {
  const user = await requireMember(req);
  const code = String((req.data || {}).code || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(code)) throw new HttpsError("invalid-argument", "Sala inválida.");
  const roomRef = db.doc(`rooms/${code}`);
  const roomSnap = await roomRef.get();
  if (!roomSnap.exists) throw new HttpsError("not-found", "Sala não encontrada.");
  let room = {};
  try { room = JSON.parse(roomSnap.get("j") || "{}"); } catch (_) { room = {}; }
  if (room.o !== user.uid) throw new HttpsError("permission-denied", "Somente o guia responsável pode publicar nesta sala.");
  const source = await db.doc("bank/main").get();
  if (!source.exists || !source.get("j")) throw new HttpsError("failed-precondition", "O guia ainda não publicou o banco principal.");
  let bank;
  try { bank = JSON.parse(source.get("j")); } catch (_) { throw new HttpsError("internal", "O banco principal está inválido."); }
  if (!bank || !Array.isArray(bank.qs) || !Array.isArray(bank.subj)) throw new HttpsError("failed-precondition", "Estrutura do banco inválida.");
  const scopedBank = { ...bank, qs: bank.qs.filter(q => !q.r || q.r === code) };
  const payload = JSON.stringify(scopedBank);
  if (payload.length > 240000) throw new HttpsError("resource-exhausted", "Banco excede o limite permitido.");
  await roomRef.collection("bank").doc("current").set({ j: payload, t: Date.now(), v: Number(bank.v || 1), publishedBy: user.uid });
  return { code, version: Number(bank.v || 1), questions: scopedBank.qs.length };
});
const SYSTEM = "Você é um assistente de matemática para alunos brasileiros. Responda em português, de forma curta e passo a passo. Não entregue só a resposta final: ajude o aluno a entender.";

exports.ia = onCall({ secrets: [KEY], region: "southamerica-east1", maxInstances: 5 }, async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Entre com sua conta.");
  const email = String(req.auth.token.email || "").toLowerCase();
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
