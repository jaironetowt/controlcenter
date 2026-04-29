# Pilar 1 — Workspace

## Visão

A tela inicial do Control Center. Pode ser configurada para mostrar uma **visão global** (todos os projetos) ou a **visão de um projeto específico** como default.

## Duas Camadas

### Global View
Visão consolidada de todos os projetos:
- Cards por projeto com **health indicator** (verde / amarelo / vermelho)
- Alertas cross-projeto: risks críticos, itens vencidos, milestones próximos
- Action items do usuário (independente de projeto)
- Shortcuts rápidos para projetos favoritos

### Project View
Dashboard individual por projeto:
- Gadgets configuráveis pelo usuário
- Layout em grid (drag & drop para reposicionar)
- Ativação/desativação de gadgets por projeto
- Configuração individual de cada gadget (ex: quantos dias de histórico, qual métrica mostrar)

## Health Indicator — Dois Níveis

| Tipo | Quem define | Para quem | Como funciona |
|------|------------|-----------|---------------|
| **External Health** | Manual (PM) | Stakeholders | Você seta verde/amarelo/vermelho — controla a narrativa |
| **Internal Health** | Automático | Você | Calculado com base em: risks críticos abertos, action items vencidos, velocity trend, milestones em risco |

Os dois ficam visíveis para você. Stakeholders veem apenas o External.

---

## Gadgets disponíveis

| Gadget | Descrição |
|--------|-----------|
| Risk Summary | Contagem de risks por status e score médio |
| Action Items | Lista de itens abertos com owner e due date |
| Decision Log | Últimas decisões registradas |
| Stakeholder Map | Grid influence × interest |
| Project Health | External + Internal health side by side |
| Quick Notes | Bloco de notas livre por projeto |
| Upcoming | Próximos eventos/milestones do Calendar |
| Metrics | Snapshot de métricas do Jira (velocity, burn, etc.) |
| Team Timecards | Lista de quem ainda não enviou timecard na semana (via Salesforce) |

## Quick Capture *(feature transversal)*

Módulo dentro do Control Center. Acessível de qualquer tela via atalho in-app ou botão fixo.

Campos mínimos: tipo (Risk / Decision / Action Item / Nota) + projeto + texto. Pode enriquecer depois dentro do módulo correspondente.

- Acessível de qualquer tela do Control Center
- Lembra o último projeto usado como default
- Mínimo de campos obrigatórios — enriquecimento posterior

> **Futuro:** evoluir para menubar app com atalho global (`Cmd+Shift+C`) acessível de qualquer app do Mac.

## Funcionalidades de Navegação

- Sidebar com lista de projetos + acesso às seções globais
- Busca global (projetos, decisões, risks, arquivos)
- Breadcrumb de contexto
- Alternância Global ↔ Project como home padrão (configurável)

## Features — Backlog

| ID | Feature | Prioridade |
|----|---------|-----------|
| WS-001 | Sidebar com lista de projetos | Alta |
| WS-002 | Global View — cards de projeto com health | Alta |
| WS-003 | Project View — grid de gadgets | Alta |
| WS-004 | Criar / editar projeto | Alta |
| WS-005 | Ativar/desativar gadgets por projeto | Alta |
| WS-006 | External Health — definição manual por projeto | Alta |
| WS-007 | Internal Health — cálculo automático (risks, vencidos, velocity) | Alta |
| WS-008 | Quick Capture in-app (modal via atalho) | Alta |
| WS-009 | Gadget Team Timecards (Salesforce) | Média |
| WS-010 | Configurar home padrão (global ou projeto) | Média |
| WS-011 | Drag & drop para reposicionar gadgets | Média |
| WS-012 | Busca global | Média |
| WS-013 | Alertas cross-projeto no Global View | Média |
| WS-014 | Quick Capture via menubar app — atalho global Mac *(futuro)* | Muito Baixa |
| WS-015 | Favoritar projetos | Baixa |
| WS-016 | Tema claro/escuro | Baixa |
