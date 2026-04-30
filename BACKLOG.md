# BACKLOG — Control Center

_Status: Em descoberta. Última atualização: 2026-04-29_

---

## Convenção de IDs

Todos os tickets usam `CC-##` sequencial. O tipo vai como tag na descrição:

`[FEATURE]` `[POLISH]` `[BUG]` `[INTEGRATION]` `[AI]`

---

## Fase 1 — Foundation

Objetivo: app rodando com navegação, layout completo e os dois primeiros gadgets funcionais.

| ID | Tipo | Ticket | Spec | Status |
|----|------|--------|------|--------|
| CC-01 | [FEATURE] | App Shell — estrutura base (sidebar + main + right panel) | [spec](docs/specs/CC-F01-app-shell.md) | ✅ Feito |
| CC-02 | [FEATURE] | Sidebar — navegação com sub-menu colapsável | [spec](docs/specs/CC-F01-app-shell.md) | ✅ Feito |
| CC-03 | [FEATURE] | Right Panel — Quick Notes, Upcoming, placeholder | [spec](docs/specs/CC-F01-app-shell.md) | ✅ Feito |
| CC-04 | [FEATURE] | Painéis colapsáveis (sidebar 56px + right panel 28px) | [spec](docs/specs/CC-F04-collapsible-panels.md) | ✅ Feito |
| CC-05 | [FEATURE] | Project View — header com External/Internal health | [spec](docs/specs/CC-F05-project-view-header.md) | ✅ Feito |
| CC-06 | [FEATURE] | Global View — cards de projetos com health badge | [spec](docs/specs/CC-F06-global-view.md) | **Pronto para dev** |
| CC-07 | [FEATURE] | Criar / editar / arquivar projeto | A especificar | Pendente |
| CC-08 | [POLISH] | Tipografia — padronização da escala de fontes | — | ✅ Feito |
| CC-09 | [POLISH] | Animação painéis — hydration guard + transições suaves | — | ✅ Feito |
| CC-10 | [BUG] | QuickNotes — expansion no reload (Mantine autosize) | — | ✅ Feito |
| CC-11 | [BUG] | Mantine hydration — suppressHydrationWarning + defaultColorScheme | — | ✅ Feito |
| CC-12 | [POLISH] | Right panel — sempre aberta, borda invisível no strip colapsado | — | ✅ Feito |
| CC-13 | [POLISH] | Sidebar — sempre aberta, espaçamento com conteúdo principal | — | ✅ Feito |

---

## Fase 2 — Inteligência do Projeto

Objetivo: Risk log, decision log, action items e stakeholder map funcionando.

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-14 | [FEATURE] | CRUD Risk Log | Pendente |
| CC-15 | [FEATURE] | Matriz de risco (severity × probability) | Pendente |
| CC-16 | [FEATURE] | CRUD Decision Log | Pendente |
| CC-17 | [FEATURE] | CRUD Action Items | Pendente |
| CC-18 | [FEATURE] | CRUD Stakeholder Map | Pendente |
| CC-19 | [FEATURE] | Grid influence × interest | Pendente |
| CC-20 | [FEATURE] | Repositório de links por projeto | Pendente |
| CC-21 | [FEATURE] | CRUD Atas de reunião | Pendente |

---

## Fase 3 — Integrações

Objetivo: camada agnóstica de PM Tool + conectores + Google Suite + Salesforce.

### PM Tool — Camada agnóstica (A especificar)

O sistema define uma interface abstrata (`PMToolConnector`) que qualquer ferramenta implementa. Cada projeto configura qual conector está ativo. A UI nunca fala diretamente com Jira, Linear etc — sempre via interface.

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-25 | [INTEGRATION] | PM Tool — interface abstrata + config por projeto | Pendente |
| CC-29 | [INTEGRATION] | PM Tool — pull de issues, sprints e epics (via conector) | Pendente |
| CC-43 | [INTEGRATION] | Conector Jira | Pendente |
| CC-44 | [INTEGRATION] | Conector Linear | Pendente |
| CC-45 | [INTEGRATION] | Conector Monday.com | Pendente |
| CC-46 | [INTEGRATION] | Conector Azure DevOps | Pendente |

### Outras integrações

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-22 | [FEATURE] | Configuração de stack por projeto (qual PM tool, Salesforce, etc.) | Pendente |
| CC-23 | [FEATURE] | Configuração da API Anthropic | Pendente |
| CC-24 | [INTEGRATION] | Google OAuth | Pendente |
| CC-26 | [FEATURE] | Configuração de gadgets por projeto | Pendente |
| CC-27 | [INTEGRATION] | Salesforce API token | Pendente |
| CC-28 | [INTEGRATION] | Webhook n8n (entrada e saída) | Pendente |
| CC-30 | [FEATURE] | Widget velocity | Pendente |
| CC-31 | [FEATURE] | Widget burn-down | Pendente |

---

## Fase 4 — IA & Relatórios

Objetivo: geração automática de reports e extração de insights.

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-32 | [AI] | Geração de status report com IA | Pendente |
| CC-33 | [FEATURE] | Configurar período do relatório | Pendente |
| CC-34 | [FEATURE] | Preview do relatório | Pendente |
| CC-35 | [INTEGRATION] | Exportar para Google Docs | Pendente |
| CC-36 | [AI] | Extração de action items de ata com IA | Pendente |
| CC-37 | [AI] | Sumarização de transcrição com IA | Pendente |

---

## Fase 5 — Colaboração

Objetivo: dashboards exportáveis e compartilhamento.

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-38 | [INTEGRATION] | Exportar para Google Slides | Pendente |
| CC-39 | [INTEGRATION] | Draft de e-mail no Gmail | Pendente |
| CC-40 | [FEATURE] | Multi-usuário | Pendente |

---

## Descartado / Muito Baixa Prioridade

| ID | Tipo | Ticket | Motivo |
|----|------|--------|--------|
| CC-41 | [FEATURE] | Stakeholder Pulse — alerta se não contactado há X dias | Interessante, mas fora do foco no momento |
| CC-42 | [FEATURE] | Quick Capture via menubar app (atalho global Mac) | Futuro distante |
