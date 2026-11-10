# Treino diário de matemática: passo a passo para publicar

Você já fez: criou o projeto `treino-de-matematica` no Firebase e registrou o app web. O arquivo `config.js` já está preenchido com os dados dele.
Você NÃO precisa usar o Firebase Hosting. O site fica no GitHub Pages; o Firebase só cuida do login (Google) e do banco de dados.
Os nomes de botões dos sites do Google e do GitHub mudam de vez em quando; se algum nome for diferente, procure o parecido.

Faltam 3 coisas que só você sabe: **o e-mail do guia**, **quem pode entrar** (domínio da escola ou lista de e-mails) e **o seu usuário do GitHub**.

---
## PARTE 1. Descobrir seu endereço (2 min)
Seu endereço final será `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
Anote o `SEU-USUARIO` (é o nome da sua conta do GitHub) e escolha o nome do repositório, por exemplo `treino-matematica`.

## PARTE 2. Ligar o login Google no Firebase (3 min)
Abra https://console.firebase.google.com e entre no projeto **treino-de-matematica**.
1. Menu da esquerda: **Build > Authentication**. Clique em **Começar** (ou *Get started*).
2. Na aba **Sign-in method**, clique em **Google**, ative a chave **Ativar** e escolha seu e-mail em "E-mail de suporte do projeto". Clique em **Salvar**.
3. Ainda em Authentication, abra **Settings (Configurações) > Domínios autorizados**. Clique em **Adicionar domínio** e digite só `SEU-USUARIO.github.io` (sem `https://` e sem barra). Salve.
   Se esquecer isto, o botão "Entrar com Google" falha com erro `unauthorized-domain`.

## PARTE 3. Criar o banco de dados (2 min)
1. Menu: **Build > Firestore Database > Criar banco de dados**.
2. Escolha **modo de produção** e a região **southamerica-east1 (São Paulo)**. Clique em **Ativar**.
3. Não crie coleções agora, o site cria sozinho.

## PARTE 4. Editar 2 arquivos (5 min)
Edite no Bloco de Notas (ou outro editor de texto simples).

**4.1 `config.js`**: na linha `adminEmails`, troque `professor@exemplo.com` pelo e-mail Google do guia, em minúsculas. Para mais de um: `["a@gmail.com", "b@escola.com.br"]`.

**4.2 `firestore.rules`** (é o que decide quem entra):
- Na função `admin()`, troque `professor@exemplo.com` pelo mesmo e-mail.
- Na função `member()`, escolha como os alunos entram:
  - **Alunos com e-mail da escola** (ex.: `@colegio.com.br`): troque `@suaescola[.]com[.]br` por `@colegio[.]com[.]br` (mantenha os colchetes em volta dos pontos).
  - **Alunos com Gmail pessoal**: apague a linha do `matches(...)` e cadastre cada aluno na Parte 5.

## PARTE 5. Publicar as regras e cadastrar alunos (3 min)
1. No Firebase: **Firestore Database > aba Regras**. Apague tudo, cole o conteúdo do `firestore.rules` já editado e clique em **Publicar**.
2. Só se os alunos usam Gmail pessoal (ou para liberar exceções): em **Firestore > Dados > Iniciar coleção**, nome da coleção `allow`. Em "ID do documento" digite o e-mail do aluno em minúsculas (ex.: `joao@gmail.com`). Crie um campo qualquer (nome `ok`, tipo boolean, valor `true`) e salve. Repita para cada aluno ("Adicionar documento").
   Sem estar nesta lista (ou no domínio da escola), o aluno entra no site mas não grava nada: aparece o aviso `permission-denied`.

## PARTE 6. Colocar o site no GitHub (5 min)
1. Entre em https://github.com, clique em **New** (novo repositório). Nome: o que escolheu na Parte 1. Marque **Public** (o Pages gratuito exige repositório público). Clique em **Create repository**.
2. Na página do repositório, clique em **uploading an existing file** (ou **Add file > Upload files**).
3. Extraia o zip no seu computador e arraste **o conteúdo da pasta** (não o zip): `index.html`, `config.js`, `firestore.rules`, `firebase.json`, `README.md`, a pasta `functions` e o `.nojekyll` se aparecer. O arquivo principal precisa ficar na raiz, com o nome exato `index.html`.
4. Clique em **Commit changes**.
5. Vá em **Settings > Pages**. Em **Build and deployment > Source**, escolha **Deploy from a branch**. Em **Branch**, escolha `main` e a pasta `/ (root)`. Clique em **Save**.
6. Espere 1 a 3 minutos e atualize a página de Settings > Pages: aparece "Your site is live at ...". Esse é o endereço para dar aos alunos.
Se mudar algum arquivo depois, repita o upload (ele substitui) e aguarde o Pages atualizar. No navegador, use Ctrl+F5 para limpar o cache.

## PARTE 7. Primeiro acesso do guia (2 min)
1. Abra o endereço do site. No topo deve aparecer **Entrar com Google**.
2. Entre com a conta do guia (a do `adminEmails`). A página recarrega e aparece a aba **Painel do guia**.
3. Em **Painel do guia > Sala**: crie uma sala (anote o código de 5 letras) e um desafio.

## PARTE 8. Teste final (faça antes de divulgar)
1. Em outro navegador (ou janela anônima), abra o site e entre com uma conta de aluno (do domínio ou da lista `allow`).
2. Aba **Sala**: digite o código e entre. Veja se o desafio aparece.
3. Resolva uma questão. Em até uns 5 segundos, volte ao guia: o aluno deve aparecer em **Painel do guia** com gráficos e o ranking.
4. Mande uma mensagem no chat da sala e veja se chega na outra conta.
Se os 4 passos funcionarem, está pronto.

---
## Se algo der errado
| O que aparece | Causa e solução |
|---|---|
| Faixa "Modo local" | O `config.js` não foi enviado ou ainda tem valores de exemplo. Confira se está na raiz, ao lado do `index.html`. |
| Erro `unauthorized-domain` ao entrar | Faltou a Parte 2, item 3. |
| Entra, mas a aba do guia não aparece | O e-mail não é igual ao de `adminEmails` (maiúsculas, erro de digitação) ou não está em `admin()` nas regras. |
| Aviso `permission-denied` | As regras não foram publicadas, ou o aluno não está no domínio da escola nem na coleção `allow`. |
| Janela de login não abre | O navegador bloqueou o pop-up. Permita pop-ups para o site. |
| Site não abre / 404 | Aguarde alguns minutos e confira Settings > Pages; o arquivo precisa se chamar `index.html`. |

## IA livre (opcional, deixe para depois)
Não é necessária para o resto funcionar. Exige plano pago por uso do Firebase e uma chave da API da Anthropic. Os arquivos estão em `functions/`; para ativar: Firebase CLI (`npm i -g firebase-tools`), `firebase login`, `firebase use treino-de-matematica`, `firebase functions:secrets:set ANTHROPIC_API_KEY`, `firebase deploy --only functions`. Depois, `iaFunction: true` no `config.js` e, no site, ligue a IA em Painel do guia > Sala > Opções e clique em Publicar alterações. Esta parte não foi testada contra o serviço real.

## Salas isoladas: versão v2

O banco-fonte `bank/main` é privado para o guia. Ao publicar, a Cloud Function cria uma cópia por sala em `rooms/{codigo}/bank/current`. O participante só consegue ler esse documento se tiver matrícula ativa em `rooms/{codigo}/members/{uid}`.

O guia pode definir a sala de cada exercício no editor de questões:
- **Todas as salas**: questão incluída em cada banco publicado.
- **Uma sala específica**: questão publicada somente para aquela sala.

A filtragem acontece também na Cloud Function antes de gravar a cópia da sala; não é apenas um filtro visual no navegador.

### Implantação
1. Faça backup/exportação do Firestore.
2. Confira `functions/config.json` (e-mails dos guias e domínio escolar).
3. Instale dependências: `cd functions && npm install`.
4. Na raiz do projeto, publique funções e regras juntas: `firebase deploy --only functions,firestore:rules`.
5. Entre com a conta do guia e clique em **Publicar alterações**. Isso cria/atualiza o banco por sala.
6. Peça aos alunos para entrar novamente com o código; a callable `joinRoom` registra a matrícula.
7. Teste com duas contas em salas diferentes: uma conta não deve conseguir ler o banco da outra sala.

**Não publique apenas as regras isoladamente.** Cliente, Cloud Functions e regras precisam ser publicados como o mesmo release.

### Limites desta etapa
O banco de exercícios está isolado por sala. Chat, desafios, diretório de usuários e relatórios ainda usam coleções legadas. XP, conquistas e missões continuam calculados no navegador e podem ser adulterados. A próxima etapa deve migrar esses recursos para dados de sala e validação no servidor.

A descrição do sistema de XP, missões, conquistas, ranking e das próximas melhorias está em [`docs/GAMIFICACAO.md`](docs/GAMIFICACAO.md).\n\n## Limites conhecidos
XP, missões e desafios são calculados no navegador e podem ser adulterados por quem tiver conhecimento técnico. O banco de questões embutido tem só 5 questões (o guia acrescenta no painel). O guia não apaga mensagens do chat. Testei o código com uma simulação do Firebase, não com o seu projeto real: por isso a Parte 8.
