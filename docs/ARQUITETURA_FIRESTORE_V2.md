# Arquitetura Firestore v2 — salas isoladas

> **Status: etapa 1 implementada em branch/PR; ainda não implantada no Firebase.** O cliente e as Cloud Functions já usam `rooms/{roomId}/bank/current` para isolar o banco de exercícios e `members/{uid}` para validar matrícula. Mensagens, desafios, roster, relatórios e pontuação continuam no modelo legado.

## Objetivos

1. Um participante só lê conteúdo, desafios, mensagens e ranking da sala em que está matriculado.
2. O guia administra salas, publica conjuntos de exercícios e acompanha resultados.
3. XP, conquistas e placares são calculados no servidor, não confiados ao navegador.
4. Progresso e relatórios históricos são preservados durante a migração.
5. O modelo suporta mais de uma turma, ciclos/temporadas e atribuições diferentes por sala.

## Modelo de dados proposto

```text
users/{uid}
  perfil mínimo: displayName, photoURL, createdAt, status

rooms/{roomId}
  name, joinCodeHash, ownerUid, status, createdAt

rooms/{roomId}/members/{uid}
  uid, displayName, role: "student"|"guide", status, joinedAt

rooms/{roomId}/questionSets/{setId}
  title, version, status: "draft"|"published", createdAt, publishedAt

rooms/{roomId}/questionSets/{setId}/questions/{questionId}
  topic, difficulty, statement, choices, answer, explanation, order

rooms/{roomId}/assignments/{assignmentId}
  questionSetId, questionIds[], opensAt, closesAt, status, createdBy

rooms/{roomId}/challenges/{challengeId}
  title, description, criteria, rewardXp, startsAt, endsAt, status

rooms/{roomId}/attempts/{attemptId}
  uid, questionId, assignmentId, isCorrect, submittedAt, durationMs

rooms/{roomId}/leaderboard/{uid}
  xpSeason, xpTotal, level, accuracy, solvedCount, updatedAt

rooms/{roomId}/seasons/{seasonId}
  title, startsAt, endsAt, status

rooms/{roomId}/messages/{messageId}
  uid, text, createdAt

users/{uid}/progress/{questionId}
  attempts, correctAttempts, lastAttemptAt, mastery

users/{uid}/gamificationEvents/{eventId}
  type, xpDelta, sourceId, createdAt
```

### Regras de modelagem

- O conteúdo de exercícios fica em `rooms/{roomId}/questionSets`, não em um banco global legível por todos.
- Uma atribuição aponta para um conjunto e uma lista de IDs. Isso permite que a mesma sala tenha trilhas diferentes sem duplicar todo o banco.
- Os documentos de perfil não devem guardar dados sensíveis nem o progresso completo.
- O placar é uma projeção materializada atualizada por Cloud Functions; participantes têm leitura, nunca escrita.
- Tentativas são eventos imutáveis. Uma função valida matrícula, atribuição ativa, questão pertencente à sala e limites de XP antes de atualizar progresso e placar.
- O código de entrada não deve ser armazenado em texto puro. A validação e a matrícula devem acontecer em uma callable Cloud Function, com limitação de tentativas.

## Matriz de acesso

| Recurso | Participante da sala | Guia da sala | Não membro |
|---|---|---|---|
| Metadados da sala | leitura | leitura/escrita | sem acesso |
| Lista de membros | leitura limitada | leitura/escrita | sem acesso |
| Exercícios publicados | leitura | leitura/escrita | sem acesso |
| Rascunhos de exercícios | sem acesso | leitura/escrita | sem acesso |
| Atribuições e desafios | leitura | leitura/escrita | sem acesso |
| Enviar tentativa | callable validada | conforme necessidade | sem acesso |
| Progresso individual | próprio | leitura dos alunos da sala | sem acesso |
| Ranking da sala | leitura | leitura | sem acesso |
| Atualizar XP/ranking | nunca diretamente | nunca diretamente | sem acesso |
| Chat | leitura/escrita validada | moderação | sem acesso |

## Regras Firestore: invariantes obrigatórias

A futura versão de `firestore.rules` deve aplicar, no mínimo:

- `isSignedIn()`: sessão Firebase válida e e-mail verificado quando exigido pela escola.
- `isRoomMember(roomId)`: existe `rooms/{roomId}/members/{request.auth.uid}` com status ativo.
- `isRoomGuide(roomId)`: membro ativo com papel `guide` e vínculo autorizado ao guia da sala.
- Leitura de conteúdo e desafios condicionada a `isRoomMember(roomId)`.
- Escrita de conteúdo, atribuições e temporadas condicionada a `isRoomGuide(roomId)`.
- Escrita direta bloqueada em `leaderboard`, `gamificationEvents` e resultados calculados.
- Tentativas submetidas por Cloud Function; regras negam escrita direta.
- Perfil: usuário lê/edita apenas campos permitidos do próprio documento; papel, XP e sala não podem ser alterados pelo cliente.
- Coleções legadas fechadas após a migração e validação dos dados.

**Importante:** Firestore Rules não filtram resultados depois da consulta. A consulta do cliente deve sempre incluir o escopo da sala e as regras precisam conseguir provar que todos os documentos retornados são acessíveis.

## Migração sem perda de dados

1. **Backup:** exportar Firestore e guardar snapshot da versão atual do banco de questões, usuários, salas, desafios, relatórios, mensagens e progresso.
2. **Inventário:** validar os formatos reais de documentos legados (`j`/ `t`), IDs, salas, duplicidades e usuários sem sala.
3. **Provisionamento:** criar estrutura v2 em paralelo; não apagar nem renomear coleções antigas.
4. **Matrículas:** migrar o campo de sala atual para `rooms/{roomId}/members/{uid}`; casos ambíguos vão para revisão do guia.
5. **Conteúdo:** copiar o banco atual para conjuntos de cada sala, publicando apenas questões que o guia atribuir àquela turma.
6. **Gamificação:** importar XP histórico como saldo inicial auditável; a partir da virada, novos eventos são calculados no servidor.
7. **Aplicação:** trocar leitura/escrita do cliente para caminhos v2 e Cloud Functions.
8. **Testes no Emulator Suite:** validar participante A, participante B, guia, usuário não matriculado e usuário desativado.
9. **Corte:** publicar regras que negam acesso às coleções legadas aos alunos, monitorar erros e manter plano de rollback.
10. **Limpeza:** arquivar dados antigos somente após conferência de contagens e aceite do responsável.

## Critérios de aceite

- Um aluno da sala A não consegue ler documento de exercícios, desafios, chat ou ranking da sala B nem conhecendo o ID.
- Um aluno não consegue alterar XP, nível, conquistas, papel, sala ou resultado de tentativa pelo console do navegador.
- Um guia só administra as salas sob sua responsabilidade.
- Um aluno removido perde acesso imediatamente.
- Atribuição publicada aparece apenas para a sala correta.
- Ranking semanal e geral concordam com os eventos registrados.
- O total de relatórios e progresso migrados confere com o backup.
- Testes automatizados de regras passam no Firebase Emulator Suite.

## Situação da implementação atual

A versão atual usa `bank/main` global, coleções globais `challenges` e `msgs`, snapshots amplos de `users` e pontuação calculada no navegador. Portanto, **não é seguro apenas endurecer as regras atuais**: isso quebraria telas existentes. A migração precisa atualizar cliente, funções e regras como uma única entrega coordenada.


## Implementação entregue na etapa 1

- Callable `joinRoom`: valida a conta e o código; cria a matrícula ativa em `rooms/{roomId}/members/{uid}`.
- Callable `publishRoomBank`: só o dono da sala copia o banco-fonte para `rooms/{roomId}/bank/current`.
- O cliente do guia publica o banco para as salas existentes e para salas recém-criadas.
- O cliente do aluno renova a matrícula local e assina somente o banco da sala atual.
- As regras negam leitura de `bank/main` para participantes e permitem leitura do banco por membros ativos.
- Participantes logados sem matrícula ficam bloqueados na aba de exercícios.

### Limitações ainda abertas

- O banco publicado é uma cópia do banco-fonte completo para cada sala; ainda não há atribuição de subconjuntos de questões.
- Desafios e chat ainda usam coleções globais legadas.
- A lista global de usuários e relatórios ainda precisa ser substituída por projeções por sala.
- XP, conquistas e missões ainda dependem do estado do navegador; não são resistentes a adulteração.
