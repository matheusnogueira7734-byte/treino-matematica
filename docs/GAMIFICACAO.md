# Liga de Matemática — especificação de gamificação

> Especificação da evolução proposta. Ainda não está ligada ao aplicativo.

## Ciclo do participante

1. Entra com Google e confirma sua matrícula por código de convite.
2. Vê a sala, temporada, missões e exercícios publicados para ela.
3. Resolve uma questão atribuída e envia a tentativa.
4. Uma Cloud Function valida a tentativa e registra o evento.
5. O painel atualiza XP, nível, domínio, conquistas e ranking.

## Componentes

### XP e níveis
- XP é calculado no servidor com base na dificuldade, primeira resolução correta e critérios anti-repetição.
- Tentativas repetidas não podem gerar XP ilimitado.
- Correções e bônus são eventos auditáveis, nunca edição direta do saldo.
- Nível é derivado do XP acumulado por uma tabela de progressão versionada.

### Missões
- Diárias: metas pequenas e renovadas por data local da sala.
- Semanais: metas de consistência, domínio e variedade de tópicos.
- Da sala: criadas pelo guia e vinculadas a uma atribuição.
- Cada missão declara condição, janela, recompensa e limite de conclusão.

### Conquistas
- Primeira questão correta.
- Sequência de dias ativos.
- Domínio de um tópico.
- Conclusão de uma missão.
- Participação em temporada.
- Conquistas não são compráveis nem concedidas pelo cliente.

### Ranking
- Individual por sala, com filtros semanal e temporada.
- Coletivo por sala/equipe, calculado pela soma ou média normalizada para evitar vantagem automática de turmas maiores.
- Empates com critério explícito e estável.
- Exibir nome/apelido e métricas estritamente necessárias.

### Temporadas
- Período configurável pelo guia.
- XP da temporada separado do XP histórico.
- Fechamento gera snapshot imutável dos resultados e recompensas.
- Reiniciar temporada não apaga progresso acadêmico nem XP total.

## UX proposta

- Painel inicial com nível, barra até o próximo nível e missão prioritária.
- Cartões de missões com progresso e prazo.
- Tela de conquistas com bloqueadas/conquistadas e critério transparente.
- Ranking da sala com posição do participante destacada sem expor dados de outras turmas.
- Feedback de conclusão curto, acessível e sem animações excessivas.
- Opções de acessibilidade: reduzir movimento, contraste e navegação por teclado.

## Métricas acadêmicas (não confundir com pontos)

XP mede participação no sistema, não domínio matemático. O painel deve separar:
- questões tentadas;
- questões distintas resolvidas;
- taxa de acerto;
- domínio por tópico;
- evolução ao longo do tempo;
- consistência de estudo.

O guia deve conseguir identificar alunos com baixa taxa de acerto sem que o ranking de XP esconda essa necessidade pedagógica.
