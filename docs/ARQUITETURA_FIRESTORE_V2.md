# Arquitetura Firestore v2 — isolamento por sala

**Status:** implementação funcional em branch/PR; ainda não implantada no Firebase.

## Modelo ativo nesta etapa

- `bank/main`: banco-fonte do guia; somente guias podem ler/escrever.
- `rooms/{roomId}/members/{uid}`: matrícula ativa, criada exclusivamente pela callable `joinRoom`.
- `rooms/{roomId}/bank/current`: banco de questões publicado para aquela sala.
- `publishRoomBank`: verifica o responsável pela sala e filtra questões antes de publicar.
- Questões com `r` vazio são compartilhadas com todas as salas; questões com `r` definido só são copiadas para a sala correspondente.
- Participante sem matrícula não acessa a área de exercícios.
- O cliente assina somente o banco da sala atual; não assina `bank/main`.

## Migração de salas existentes

1. Fazer backup do Firestore.
2. Publicar cliente, Cloud Functions e regras em conjunto.
3. O guia clica em **Publicar alterações** para gerar os bancos de cada sala.
4. Cada aluno entra novamente com o código para criar/renovar a matrícula.
5. Testar acesso cruzado entre duas contas e duas salas.

## Limitações remanescentes

- Desafios e chat continuam em coleções globais legadas.
- Diretório global de usuários e relatórios ainda precisam de projeções por sala.
- XP, conquistas e missões ainda dependem do estado do navegador; não são resistentes a adulteração.
- A experiência de gamificação já existente (XP, níveis, missões, conquistas e ranking) ainda precisa de autoridade no servidor.

## Critérios de aceite

- Aluno A lê o banco da sala A.
- Aluno A recebe `permission-denied` ao tentar ler o banco da sala B.
- Aluno sem matrícula não lê banco algum.
- Participante não lê `bank/main`.
- Participante não cria/edita/apaga matrículas.
- Guia responsável só publica na própria sala.
- Questões atribuídas à sala A não aparecem no banco da sala B.
