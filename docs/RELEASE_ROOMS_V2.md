# Release checklist — salas v2

- [ ] Exportar/backup do Firestore.
- [ ] Conferir `functions/config.json` (e-mails e domínio).
- [ ] Confirmar projeto correto com `firebase use`.
- [ ] Publicar cliente, Cloud Functions e regras como um único release.
- [ ] Republicar o banco para cada sala já existente.
- [ ] Solicitar que alunos reentrem com o código para criar/renovar matrícula.
- [ ] Testar leitura da sala própria e `permission-denied` para sala alheia.
- [ ] Testar `permission-denied` para aluno sem matrícula.
- [ ] Testar que aluno não lê `bank/main` nem escreve em `members`.
- [ ] Testar que guia só publica na sala de que é responsável.
- [ ] Conferir painel/progresso legado e guardar backup para rollback.
