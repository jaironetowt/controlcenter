# Pilar 2 — Inteligência do Projeto

## Visão

Logs estruturados e rastreáveis para as informações críticas de gestão que normalmente ficam espalhadas em e-mails, Confluence, Sheets e reuniões.

## Módulos

### Risk Log
Registro e acompanhamento de riscos do projeto.

**Campos:** título, descrição, probabilidade (1–5), impacto (1–5), score (P×I), status, owner, plano de mitigação, data limite, histórico de mudanças.

**Visualizações:** lista filtrada por status/score, matriz de risco (2×2 ou 5×5).

### Decision Log
Registro de decisões tomadas no projeto — o "porquê" das escolhas.

**Campos:** título, contexto, decisão, racional, alternativas consideradas, quem decidiu, stakeholders envolvidos, status, data.

**Status:** Proposed → Approved / Rejected / Superseded.

### Action Items
Tarefas de gestão e follow-up (diferente de tickets de desenvolvimento).

**Campos:** título, descrição, owner, due date, prioridade, status, projeto, fonte (reunião, risk, etc.).

**Visualizações:** lista por projeto, visão global todos os projetos, filtros por owner/due date/status.

### Stakeholder Map
Mapa de stakeholders com análise de influência e interesse.

**Campos:** nome, papel, organização, influência (1–5), interesse (1–5), nível de engajamento, contato, notas.

**Visualizações:** grid influence × interest (bubble chart), lista filtrada.

## Features — Backlog

| ID | Feature | Prioridade |
|----|---------|-----------|
| PI-001 | CRUD Risk Log | Alta |
| PI-002 | Matriz de risco | Alta |
| PI-003 | CRUD Decision Log | Alta |
| PI-004 | CRUD Action Items | Alta |
| PI-005 | CRUD Stakeholder Map | Alta |
| PI-006 | Grid influence × interest | Média |
| PI-007 | Histórico de mudanças em risks | Média |
| PI-008 | Vincular action item a um risk/decision | Média |
| PI-009 | Exportar logs para Google Docs/Sheets | Média |
| PI-010 | Notificação de action items vencidos | Baixa |
| PI-011 | Stakeholder Pulse — alerta se não contactado há X dias | Muito Baixa |
