# Gamificação — estado atual e próxima etapa

## O que já existe no aplicativo

A versão atual já contém uma base de gamificação:
- XP e níveis.
- Ligas e ranking.
- Missões diárias e semanais.
- Desafios criados pelo guia.
- Conquistas e sequências de atividade.
- Painel de progresso e métricas de acerto.

Esta entrega preserva esses recursos. A melhoria principal desta etapa é fazer com que o participante só receba as questões publicadas para sua sala.

## O que ainda precisa melhorar

Hoje o navegador calcula XP, missões e conclusão de desafios. Isso torna a experiência divertida, mas os pontos podem ser alterados por alguém que manipule o estado local ou as chamadas do cliente. O ranking deve ser tratado como motivacional, não como registro inviolável.

## Próxima evolução técnica

1. Registrar cada tentativa em uma subcoleção da sala por Cloud Function.
2. A função consulta a questão publicada no banco daquela sala e valida a resposta no servidor.
3. Calcular XP no servidor, com regra explícita por dificuldade e bônus limitados.
4. Impedir que o cliente escreva diretamente no saldo, nível, conquistas ou ranking.
5. Derivar missões e desafios de eventos de tentativa validados.
6. Manter o progresso acadêmico separado de XP: taxa de acerto, domínio por tema e evolução não devem ser substituídos por pontos.
7. Gerar ranking individual e coletivo somente com eventos validados.

## Princípio de design

A gamificação deve incentivar consistência, curiosidade e domínio matemático — não apenas volume de cliques. XP não é sinônimo de aprendizagem. O painel precisa mostrar os dois separadamente.
