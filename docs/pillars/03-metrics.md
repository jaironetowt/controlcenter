# Pilar 3 — Métricas & Execução

## Visão

Dados de execução vindos das ferramentas do projeto (Jira, Linear, GitHub, etc.) apresentados de forma consolidada, sem precisar abrir cada ferramenta.

## Métricas por tipo de projeto

### Projetos com Jira
- Velocity por sprint / por time
- Burn-down / burn-up da sprint atual
- Bug ratio (bugs / total issues)
- Completion rate (Done / Total planejado)
- Itens em cada status
- Blockers e itens parados há X dias

### Projetos genéricos (sem ferramenta de PM)
- Action items: abertos / concluídos / vencidos
- Milestones: status e % de conclusão
- Health score calculado manualmente

## Integrações previstas

| Ferramenta | O que puxa | Fase |
|-----------|-----------|------|
| Jira | Issues, sprints, velocidade | Fase 3 |
| Linear | Issues, cycles | Fase 3 |
| GitHub | PRs, issues | Fase 4 |
| Google Calendar | Reuniões, milestones | Fase 3 |

## Features — Backlog

| ID | Feature | Prioridade |
|----|---------|-----------|
| ME-001 | Snapshot manual de métricas (sem integração) | Alta |
| ME-002 | Integração Jira — buscar issues e sprints | Alta |
| ME-003 | Widget de velocity | Média |
| ME-004 | Widget de burn-down | Média |
| ME-005 | Widget de bug ratio | Média |
| ME-006 | Health score automático por projeto | Média |
| ME-007 | Histórico de métricas (trend) | Média |
| ME-008 | Alertas de anomalia (velocity caiu, bugs subiram) | Baixa |
