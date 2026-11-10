# Release checklist — salas v2

- [ ] Exportar/backup do Firestore.
- [ ] Conferir `functions/config.json` (e-mails e domínio).
- [ ] Confirmar projeto correto com `firebase use`.
- [ ] Publicar cliente, Cloud Functions e regras como um único release.
- [ ] Clicar em **Publicar alterações** como guia para gerar bancos por sala.
- [ ] Solicitar que alunos reentrem com o código para criar/renovar matrícula.
- [ ] Testar que aluno A lê o banco A e recebe `permission-denied` no banco B.
- [ ] Testar que aluno sem matrícula não lê banco algum.
- [ ] Testar que aluno não lê `bank/main` nem escreve em `members`.
- [ ] Testar que questão atribuída à sala A não é copiada para o banco B.
- [ ] Testar que guia só publica banco na sala de que é responsável.
- [ ] Conferir painel/progresso legado e guardar backup para rollback.
