# Treino diário de matemática (GitHub + Firebase)

Mesmo site que roda no claude.ai, agora no GitHub Pages. O banco de dados e o login vêm do Firebase (Google). Sem o Firebase configurado, o site abre em **modo local** (treina, mas sem sala, chat e relatórios).

> Aviso honesto: eu testei o código com uma simulação do Firebase, não com um projeto real. Faça o teste final do Passo 7 antes de passar o link aos alunos.

## O que você precisa
Uma conta Google, um repositório no GitHub e cerca de 30 minutos. Sala, chat, ranking, relatórios e gráficos usam o plano gratuito (Spark). Só a **IA livre** exige o plano Blaze (pago por uso) e uma chave de API da Anthropic. Ela é opcional.

## Passo a passo

**1. Publicar no GitHub Pages**
Crie um repositório, envie todos os arquivos desta pasta para a raiz, vá em *Settings > Pages > Deploy from a branch > main / (root)*. O endereço será `https://SEU-USUARIO.github.io/NOME-DO-REPO/`.

**2. Criar o projeto no Firebase**
Em console.firebase.google.com: *Adicionar projeto*. Depois:
- *Build > Authentication > Começar > Google > Ativar*.
- Em *Authentication > Configurações > Domínios autorizados*, adicione `SEU-USUARIO.github.io`.
- *Build > Firestore Database > Criar banco de dados* (modo produção, região `southamerica-east1`).

**3. Ligar o site ao projeto**
*Configurações do projeto > Seus apps > Web (`</>`)*, registre o app e copie o `firebaseConfig`. Cole os valores em `config.js` (apiKey, authDomain, projectId, appId) e troque `adminEmails` pelos e-mails dos guias.

**4. Regras de segurança (obrigatório)**
Abra `firestore.rules`, troque o e-mail do guia e o domínio da escola (`@suaescola[.]com[.]br`). Cole o arquivo em *Firestore > Regras > Publicar*.
Quem pode entrar: guias, e-mails do domínio da escola, ou e-mails listados na coleção `allow` (crie no console um documento por aluno, com o e-mail como ID). Alunos com Gmail pessoal precisam estar em `allow`. Sem esse passo, qualquer pessoa com Google poderia ler os dados.

**5. Enviar as alterações ao GitHub** (`config.js` com seus valores). A `apiKey` do Firebase é pública por desenho; quem protege os dados são as regras do Passo 4.

**6. IA livre (opcional)**
Precisa do Node 20 e da Firebase CLI (`npm i -g firebase-tools`). Na pasta do projeto: `firebase login`, `firebase use SEU-PROJETO`, ative o plano Blaze, depois `firebase functions:secrets:set ANTHROPIC_API_KEY` e `firebase deploy --only functions`. Ajuste `functions/config.json` (domínio, e-mails, limite diário por aluno, modelo). Por fim, troque `iaFunction` para `true` em `config.js` e, no site, o guia liga a IA em *Painel do guia > Sala > Opções* e clica em *Publicar alterações*.
A função não foi testada contra o serviço real. Confira o nome do modelo na documentação da Anthropic.

**7. Teste final (faça antes de divulgar)**
1. Abra o site com a conta do guia: deve aparecer a aba *Painel do guia*.
2. Em *Painel do guia > Sala*, crie uma sala e um desafio.
3. Com uma conta de aluno (outro navegador), entre com Google, digite o código em *Sala* e resolva uma questão.
4. No guia, o relatório e os gráficos devem aparecer sozinhos. Mande uma mensagem no chat e veja se chega.

## Treinar a IA com o material da escola (depois)
O ponto de entrada está marcado em `functions/index.js` (comentário FUTURO). O caminho recomendado é buscar trechos do material e enviá-los junto da pergunta, em vez de treinar um modelo do zero.

## Limites conhecidos
- XP, missões e desafios são calculados no navegador do aluno e podem ser adulterados por quem tiver conhecimento técnico.
- O banco de questões embutido tem só 5 questões; o guia acrescenta mais no painel e publica.
- O guia não apaga mensagens do chat.
- Arquivos: `index.html` (site), `config.js`, `firestore.rules`, `firebase.json`, `functions/` (IA), `.nojekyll`.
