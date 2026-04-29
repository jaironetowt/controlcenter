# BACKLOG — Control Center

_Status: Em descoberta. Última atualização: 2026-04-29_

---

## Fase 1 — Foundation (App Shell + Gadgets Iniciais)

Objetivo: app rodando com navegação, layout completo e os dois primeiros gadgets funcionais.

| ID | Ticket | Spec | Status |
|----|--------|------|--------|
| CC-F01 | App Shell — estrutura base (sidebar + main + right panel) | [spec](docs/specs/CC-F01-app-shell.md) | **Pronto para dev** |
| CC-F02 | Sidebar — navegação com sub-menu colapsável | [spec](docs/specs/CC-F01-app-shell.md#sidebar-cc-f02) | **Pronto para dev** |
| CC-F03 | Right Panel — barra de gadgets (Quick Notes + Upcoming + placeholder) | [spec](docs/specs/CC-F01-app-shell.md#right-panel-cc-f03) | **Pronto para dev** |
| CC-F04 | Project View — header do projeto com External/Internal health | A especificar | Pendente |
| CC-F05 | Global View — cards de projetos com health badge | A especificar | Pendente |
| CC-F06 | Criar / editar / arquivar projeto | A especificar | Pendente |

---

## Fase 2 — Inteligência do Projeto

Objetivo: Risk log, decision log, action items e stakeholder map funcionando.

| ID | Feature | Pilar | Status |
|----|---------|-------|--------|
| PI-001 | CRUD Risk Log | Inteligência | Pendente |
| PI-002 | Matriz de risco | Inteligência | Pendente |
| PI-003 | CRUD Decision Log | Inteligência | Pendente |
| PI-004 | CRUD Action Items | Inteligência | Pendente |
| PI-005 | CRUD Stakeholder Map | Inteligência | Pendente |
| PI-006 | Grid influence × interest | Inteligência | Pendente |
| KN-001 | Repositório de links por projeto | Conhecimento | Pendente |
| KN-002 | CRUD Atas de reunião | Conhecimento | Pendente |

---

## Fase 3 — Integrações

Objetivo: dados reais de Jira e Google Suite.

| ID | Feature | Pilar | Status |
|----|---------|-------|--------|
| CF-001 | CRUD de projetos com config de stack | Integrações | Pendente |
| CF-002 | Configuração da API Anthropic | Integrações | Pendente |
| CF-003 | Google OAuth | Integrações | Pendente |
| CF-004 | Jira API token | Integrações | Pendente |
| CF-005 | Configuração de gadgets por projeto | Integrações | Pendente |
| CF-006 | Integração Salesforce (API token) | Integrações | Pendente |
| CF-007 | Webhook n8n (entrada e saída) | Integrações | Pendente |
| ME-002 | Integração Jira — issues e sprints | Métricas | Pendente |
| ME-003 | Widget velocity | Métricas | Pendente |
| ME-004 | Widget burn-down | Métricas | Pendente |

---

## Fase 4 — IA & Relatórios

Objetivo: geração automática de reports e extração de insights.

| ID | Feature | Pilar | Status |
|----|---------|-------|--------|
| RP-001 | Geração de status report com IA | Relatórios | Pendente |
| RP-002 | Configurar período do relatório | Relatórios | Pendente |
| RP-003 | Preview do relatório | Relatórios | Pendente |
| RP-004 | Exportar para Google Docs | Relatórios | Pendente |
| KN-003 | Extração de action items de ata com IA | Conhecimento | Pendente |
| KN-007 | Sumarização de transcrição com IA | Conhecimento | Pendente |

---

## Fase 5 — Colaboração

Objetivo: dashboards exportáveis e compartilhamento.

| ID | Feature | Pilar | Status |
|----|---------|-------|--------|
| RP-008 | Exportar para Google Slides | Relatórios | Pendente |
| RP-009 | Draft de e-mail no Gmail | Relatórios | Pendente |
| CF-009 | Multi-usuário | Integrações | Pendente |

---

## Descartado / Muito Baixa Prioridade

| ID | Feature | Motivo |
|----|---------|--------|
| PI-011 | Stakeholder Pulse — alerta se não contactado há X dias | Interessante, mas fora do foco no momento |
| WS-014 | Quick Capture via menubar app (atalho global Mac) | Futuro distante |
