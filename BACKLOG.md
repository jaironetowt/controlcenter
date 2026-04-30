# BACKLOG — Control Center

_Status: Em desenvolvimento. Última atualização: 2026-04-30_

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
| CC-06 | [FEATURE] | Global View — cards de projetos com health badge | [spec](docs/specs/CC-F06-global-view.md) | ✅ Feito |
| CC-07 | [FEATURE] | Criar / editar / arquivar projeto | [spec](docs/specs/CC-07-project-crud.md) | ✅ Feito |
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
| CC-14 | [FEATURE] | CRUD Risk Log | ✅ Feito |
| CC-15 | [FEATURE] | Matriz de risco (severity × probability) | ✅ Feito |
| CC-16 | [FEATURE] | CRUD Decision Log | ✅ Feito |
| CC-17 | [FEATURE] | CRUD Action Items | ✅ Feito |
| CC-18 | [FEATURE] | CRUD Stakeholder Map | ✅ Feito |
| CC-19 | [FEATURE] | Grid influence × interest | ✅ Feito |
| CC-20 | [FEATURE] | Repositório de links por projeto | Pendente |
| CC-21 | [FEATURE] | CRUD Atas de reunião | Pendente |
| CC-47 | [FEATURE] | Feature flags — gerenciar features habilitadas no sistema (Settings > Features) | ✅ Feito |
| CC-48 | [FEATURE] | Dashboard do projeto — visão geral com stat cards (open risks, decisions, action items, stakeholders) | ✅ Feito |
| CC-49 | [BUG] | Sidebar animation — cada página instanciava `<Sidebar>` separado, remontava a cada nav; corrigido com `projects/layout.tsx` compartilhado + `flushSync` + `rAF` | ✅ Feito |
| CC-50 | [POLISH] | Feature flags — internal health marcado como "Coming soon" (disabled no final da lista); external health removido das settings (feature nativa) | ✅ Feito |
| CC-51 | [BUG] | Archive projeto — 404 ao arquivar estando na página do projeto; corrigido com redirect para `/global` + toast de confirmação | ✅ Feito |
| CC-52 | [FEATURE] | Projetos arquivados — seção colapsável "Archived" na global view; cards clicáveis com opacidade reduzida; badge "Archived" no header; campo `archivedAt` no modelo | ✅ Feito |
| CC-53 | [POLISH] | ProjectHeader unificado — todas as páginas de projeto usam o mesmo componente; removido hero custom do dashboard; label "STATUS" adicionado ao lado dos health badges | ✅ Feito |
| CC-54 | [POLISH] | Project cards — label "STATUS" antes dos health badges; popover de cor do badge corrigido para fechar ao clicar fora (`onChange` em vez de `onClose`) | ✅ Feito |
| CC-55 | [FEATURE] | Project settings — seção "Project Info" para editar nome, cor, cliente, fase e date range direto na página de settings do projeto | ✅ Feito |
| CC-56 | [BUG] | Module card hrefs — cards no dashboard do projeto apontavam para `/risks` etc. em vez de `/projects/${id}/risks` | ✅ Feito |
| CC-57 | [BUG] | Toast — Mantine Notifications empurrava layout; substituído por implementação custom com `createPortal(content, document.body)` | ✅ Feito |
| CC-58 | [POLISH] | Logo "Control Center" na sidebar — clicável, redireciona para `/global` | ✅ Feito |
| CC-59 | [INTEGRATION] | Salesforce — importar projeto por URL (nome + datas) via SF CLI local | ✅ Feito |

---

> ⚠️ **CC-59 — Limitação conhecida (documentada intencionalmente)**
>
> A integração Salesforce atual usa o **Salesforce CLI** instalado localmente. Funciona apenas para quem tem o SF CLI instalado e autenticado (`sf org login web --set-default`). Essa foi uma decisão consciente para desbloquear o uso local enquanto a solução multi-usuário não está disponível.
>
> **Para distribuir o app para outros usuários da empresa:**
> Um admin Salesforce precisa criar um **External Client App (ECA)** na org. Isso habilita OAuth in-app (botão "Connect Salesforce" → browser → login → retorna ao app), sem dependência de CLI. Ver: https://developer.salesforce.com/docs/platform/external-client-apps
>
> Ticket de revisão: **CC-60**

| CC-60 | [INTEGRATION] | Salesforce — substituir SF CLI por OAuth in-app via External Client App (ECA) para distribuição multi-usuário | Pendente (requer admin SF) |
| CC-61 | [FEATURE] | Hot Desk — painel direito com título, flame icon, estado colapsado, tooltip no hover | ✅ Feito |
| CC-62 | [FEATURE] | Hot Desk — gadgets drag-to-reorder com ordem persistida em localStorage | ✅ Feito |
| CC-63 | [FEATURE] | Hot Desk — gadget Urgent Actions (filtro por due date configurável, links para project/actions) | ✅ Feito |
| CC-64 | [FEATURE] | Global Action Items — página consolidada com swimlanes por projeto e filtro por status | ✅ Feito |
| CC-65 | [BUG] | Scroll independente por coluna — overflow hidden no html/body | ✅ Feito |
| CC-66 | [BUG] | Hot Desk scroll — flex-1 min-h-0 no container + flex-shrink-0 nos cards para ativar overflow-y-auto corretamente | ✅ Feito |
| CC-67 | [POLISH] | Global Action Items — colunas consistentes entre swimlanes via table-fixed + colgroup | ✅ Feito |
| CC-71 | [POLISH] | Urgent Actions — exibir nome do projeto e priority em cada item | ✅ Feito |
| CC-72 | [FEATURE] | Sidebar — item Milestones inativo em cada projeto | ✅ Feito |
| CC-73 | [FEATURE] | Quick Actions gadget — Add Risk (título + descrição + probability/impact), Add Action Item (priority), Reminder placeholder; OwnerChip com portal; selecionar projeto com último usado | ✅ Feito |
| CC-74 | [FEATURE] | Quick Actions FAB — ícone de raio flutuante (bottom-right relativo ao right panel); pulso animado; expande painel flutuante com QuickActions; fecha ao clicar fora da zona de sombra; removido do Hot Desk | ✅ Feito |
| CC-75 | [BUG] | Sidebar — projeto ficava destacado em /global e /actions por fallback incorreto para projects[0] quando URL não contém /projects/:id | ✅ Feito |
| CC-68 | [FEATURE] | Hot Desk — gadget Upcoming conectado a dados reais (hoje hardcoded) | Pendente |
| CC-69 | [FEATURE] | Hot Desk — GadgetSlot "Add gadget" funcional (hoje é placeholder) | Pendente |
| CC-70 | [FEATURE] | Global Action Items — botão "New item" com seletor de projeto no modal | Pendente |

---

## Fase 3 — Integrações

Objetivo: camada agnóstica de PM Tool + conectores + Google Suite + Salesforce.

### PM Tool — Camada agnóstica

O sistema define uma interface abstrata (`PMToolConnector`) que qualquer ferramenta implementa. Cada projeto configura qual conector está ativo. A UI nunca fala diretamente com Jira, Linear etc — sempre via interface.

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-25 | [INTEGRATION] | PM Tool — interface abstrata + config por projeto (`/settings`) | ✅ Feito |
| CC-29 | [INTEGRATION] | PM Tool — pull de issues, sprints e epics (via conector Jira) | ✅ Feito |
| CC-43 | [INTEGRATION] | Conector Jira | ✅ Feito |
| CC-44 | [INTEGRATION] | Conector Linear | ⬇️ Baixíssima prioridade |
| CC-45 | [INTEGRATION] | Conector Monday.com | ⬇️ Baixíssima prioridade |
| CC-46 | [INTEGRATION] | Conector Azure DevOps | ⬇️ Baixíssima prioridade |

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
