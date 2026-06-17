# BACKLOG — Control Center

_Status: Em desenvolvimento. Última atualização: 2026-06-17_

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
| CC-76 | [POLISH] | Risk Matrix — duas swimlanes (Open / Mitigated) em vez de filtro só por Open | ✅ Feito |
| CC-68 | [FEATURE] | Hot Desk — gadget Upcoming conectado a dados reais (hoje hardcoded) | Pendente |
| CC-69 | [FEATURE] | Hot Desk — GadgetSlot "Add gadget" funcional (hoje é placeholder) | Pendente |
| CC-70 | [FEATURE] | Global Action Items — botão "New item" com seletor de projeto no modal | Pendente |

---

## Fase 2.5 — Persistência (Supabase)

Objetivo: substituir localStorage/Zustand persist por Supabase (Postgres). Auth desde o início para preparar multi-usuário.

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-77 | [INTEGRATION] | Supabase — DDL completo (projects, risks, action_items, decisions, stakeholders, user_settings) + RLS policies + auth email/password | ✅ Feito |
| CC-78 | [INTEGRATION] | Script de migração one-shot — lê localStorage dump JSON e faz INSERT no Supabase via API | ✅ Feito |
| CC-79 | [INTEGRATION] | Substituir useProjectsStore (persist) por Supabase client | ✅ Feito |
| CC-80 | [INTEGRATION] | Substituir useRisksStore (persist) por Supabase client | ✅ Feito |
| CC-81 | [INTEGRATION] | Substituir useActionItemsStore (persist) por Supabase client | ✅ Feito |
| CC-82 | [INTEGRATION] | Substituir useDecisionsStore (persist) por Supabase client | ✅ Feito |
| CC-83 | [INTEGRATION] | Substituir useStakeholdersStore (persist) por Supabase client | ✅ Feito |
| CC-84 | [INTEGRATION] | useFeaturesStore — migrar para user_settings no Supabase | ✅ Feito |
| CC-85 | [INTEGRATION] | Auth — página de login + middleware de proteção de rotas + src/lib/auth.ts | ✅ Feito |
| CC-86 | [INTEGRATION] | StoreInitializer — componente que dispara fetchAll de todos os stores Supabase no mount | ✅ Feito |
| CC-87 | [BUG] | Migrate page — setup check dava falso positivo (PGRST205 ≠ 42P01); corrigido para detectar tabelas inexistentes corretamente; user_settings usava `user_id` não `id` | ✅ Feito |
| CC-88 | [POLISH] | Migrate page — scroll quebrado por `overflow: hidden` no html/body; corrigido com `fixed inset-0 overflow-y-auto`; auto-scroll para resultado; erros visíveis sem rolar | ✅ Feito |
| CC-89 | [BUG] | Feature flags — `internalHealth` defaultava `true`; corrigido para `false` (comingSoon); user_settings resetado via API | ✅ Feito |
| CC-90 | [FEATURE] | Timecards — ordenação por end date ascending, desempate por resource A-Z | ✅ Feito |
| CC-91 | [FEATURE] | Project modal + Project settings — date range substituído por dois date pickers (mês/ano) start e end; abre ao clicar em qualquer parte do campo; compatível com import Salesforce | ✅ Feito |
| CC-92 | [FEATURE] | Slug deduplication — `buildSlugMap` atribui sufixo numérico a projetos com nomes duplicados (project-detox-2); toda navegação e lookup de páginas usa o mapa | ✅ Feito |
| CC-93 | [FEATURE] | Datas originais do SF — exibir aviso "Original Salesforce dates" apenas quando datas foram alteradas manualmente; remover botão "Sync dates"; campo `sf_date_range` persistido no banco | ✅ Feito |
| CC-94 | [FEATURE] | Badge "Linked to Salesforce" com nome original do projeto no SF e link direto para o registro; campo `sf_name` persistido; backfill automático ao abrir modal/settings | ✅ Feito |
| CC-95 | [BUG] | Badge SF — nome do projeto truncado no modal; redesenhado em duas linhas (label + nome completo linkado) | ✅ Feito |
| CC-96 | [FEATURE] | Project Settings — seção Integrations com Salesforce, Jira (expandível com PMToolConfig), Linear e Monday.com (coming soon) | ✅ Feito |
| CC-97 | [FEATURE] | Timecards — paginação 30 itens/página com indicador "1–30 de X" centralizado | ✅ Feito |
| CC-98 | [FEATURE] | Sprint page — aba Jira no sidebar, tela básica com sprint ativo, KPIs (total/done/in-progress/to-do/blocked), tabela de issues com key linkada, tipo, status, prioridade e assignee; cache localStorage 3h + refresh manual | ✅ Feito |

> ⚠️ **Próximo passo obrigatório antes de usar:**
> 1. Criar projeto no [Supabase](https://app.supabase.com)
> 2. Rodar `supabase/migrations/001_initial.sql` no SQL Editor do Supabase
> 3. Criar usuário em Authentication → Users (email/password)
> 4. Copiar `.env.local.example` para `.env.local` e preencher as vars
> 5. Para migrar dados existentes: `npx tsx scripts/migrate-from-localstorage.ts <dump.json>`
>    (usar SERVICE_ROLE key para bypassar RLS durante migração)

> ⚠️ **Decisões fixadas**
> - Auth: email/password desde o início (prepara CC-40 multi-usuário)
> - IDs: manter `crypto.randomUUID()` — compatível com Supabase
> - Dados locais: migrar via script (CC-78) antes de desligar o localStorage
> - Credenciais sensíveis (Jira, Salesforce): permanecem em env vars / localStorage, fora do Supabase

---

## Fase 2.6 — Migração para gizmos.run (all-in)

Objetivo: deploy do Control Center no `control-center.telus.gizmos.run` usando a infra **nativa** da plataforma (D1/KV/R2 + auth org-scoped via SSO), eliminando a dependência externa do Supabase. Decisão tomada em 2026-06-17: **all-in no gizmos**.

> ✅ **Fatos confirmados pelo `/guide` (2026-06-17)** — pendências anteriores resolvidas:
> - **Runtime**: Cloudflare Worker único serve a app a partir de R2. **Não roda servidor Next.js** — só estático/SPA + `worker.ts` opcional. O CLI **não faz bundle**: builda-se local e dá push do output (`./out`/`./dist`).
> - **Banco**: **D1 (SQLite)**. → Drizzle com driver D1. Migrations **forward-only** (rollback de versão restaura código, **não** dado).
> - **Auth**: resolvida pelo loader (SSO da org antes da request). Identidade em **headers**: `x-gizmos-sub` (id estável — usar como user id), `x-gizmos-role` (owner/admin/editor/viewer/organization), `x-gizmos-user`, `x-gizmos-name`. **Sem login page, sem auth do Supabase, sem RLS.**
> - **Backend/bindings**: `worker.ts` + `wrangler.toml` no zip → D1/KV/R2/AI auto-provisionados, zero config.
> - **Deploy**: `npm run build` → `gizmos push --app control-center ./out` (precisa `GIZMOS_API_KEY`). Ou drop de zip na UI. CLI install via `https://gizmos.run/llms.txt`.
> - **Versões**: cada deploy é snapshot imutável; rollback = pointer flip atômico, efetivo na próxima request. Logs: `gizmos logs control-center --since 30m`.

> ✅ **DECISÃO (CC-100, 2026-06-17)**: conversão do runtime = **(A) Next static export** (`output: 'export'` + `generateStaticParams` para rotas dinâmicas). Menor churn, mantém Next App Router + Mantine. `app/api/*` migra pro `worker.ts`. Sem SSR/middleware (auth já é do loader).

| ID | Tipo | Ticket | Status |
|----|------|--------|--------|
| CC-99  | [INFRA] | gizmos CLI — instalar (`gizmos.run/llms.txt` / installer), gerar `GIZMOS_API_KEY`, reservar app name `project-management-center` | ✅ Feito |
| CC-100 | [INFRA] | **Conversão de runtime → Next static export** (`output: 'export'` + `generateStaticParams` p/ rotas dinâmicas); remover dependências de SSR/middleware | ✅ Feito (build verde, 20 rotas) |
| CC-101 | [INFRA] | Backend `worker.ts` + `wrangler.toml` — mover `app/api/*` para o Worker; bindings D1 auto-provisionados | ✅ Feito (worker SQL cru, zero deps) |
| CC-102 | [INFRA] | Schema D1/SQLite como source of truth — `migrations/0001_init.sql`, auto-aplicado no deploy. (Drizzle descartado: SQL cru no worker) | ✅ Feito |
| CC-103 | [INFRA] | Remover Supabase — drop `@supabase/supabase-js`, RLS, login/migrate/setup; também removidos drizzle, better-sqlite3 e `@anthropic-ai/sdk` (sem AI) | ✅ Feito |
| CC-104 | [INFRA] | Auth via headers do loader — `x-gizmos-sub` no worker; removidos login page, proxy e `src/lib/auth.ts`; `user_settings` chaveado por `x-gizmos-sub` | ✅ Feito |
| CC-105 | [INFRA] | Reescrever camada de dados dos 6 stores — supabase client → `fetch('/api/*')` via `src/lib/api.ts` | ✅ Feito |
| CC-106 | [INFRA] | Deploy — `npm run build` → `gizmos push`; migrations D1 auto-aplicadas; key fora do repo | ✅ Feito — live em `project-management-center.telus.gizmos.run` |
| CC-107 | [POLISH] | Fast version reflection — versionar `persist` do Zustand (`version` + `migrate`); build/version stamp na UI; **atenção**: rollback de código não reverte dado D1 (migrations forward-only) | Pendente |
| CC-108 | [INFRA] | Migração de dados — Supabase → D1 (export do estado atual, se acessível, + import via worker/script) | Pendente (DB nova, vazia) |
| CC-109 | [INFRA] | Validar on-platform (sessão SSO no browser): criar projeto → refresh persiste (worker+D1 round-trip); deep-link/refresh em `/projects/<slug>/*` (SPA-fallback do loader); reativar Jira no worker | Pendente |

> 📌 **Resultado do deploy (2026-06-17)**: app no ar em **https://project-management-center.telus.gizmos.run**. Verificado sem sessão: loader serve a app e o gate SSO da org está ativo (302 → `__auth/bounce`) tanto em `/` quanto em `/api/projects`. Falta validação end-to-end com browser logado (CC-109). Warning do push: gizmos ignora `name`/`main`/`compatibility_date`/`database_name` do wrangler (descobre o worker por convenção) — binding D1 respeitado.
| CC-109 | [INFRA] | Roteamento p/ static export (impl. de CC-100) — `generateStaticParams` no segmento `projects/[id]` (shell placeholder `_` + `dynamicParams: true`); root `page.tsx` → client redirect (`useRouter().replace('/global')`); auditoria de APIs de servidor (nenhuma além do redirect) | ✅ Feito |

> ⚠️ **Decisões fixadas (2026-06-17) — atualizadas pós leitura da skill oficial**
> - **All-in no gizmos**: D1 + auth via headers do loader; Supabase externo sai por completo
> - **SQL cru no `worker.ts`** (`env.DB`, API CF/atalhos) em vez de Drizzle — zero deps no worker, bundle garantido; **dropar drizzle + better-sqlite3 + @supabase/supabase-js**
> - **Sem AI**: remover `@anthropic-ai/sdk` e Fase 4 fica fora de escopo na versão gizmos (decisão do Jairo 2026-06-17)
> - **Salesforce desabilitado**: rotas `api/salesforce/*` usam `child_process` + SF CLI local → impossível no Worker; stub "indisponível no gizmos" até CC-60 (OAuth/ECA). Jira (`api/pm/jira/*`, só `fetch`) migra pro worker
> - **Migrations**: `migrations/*.sql` no bundle auto-aplicam no deploy
> - **Caveat aberto**: deep-link/refresh em `/projects/<slug>/*` depende do SPA-fallback do loader — validar on-platform (CC-100)
> - **Deploy**: zip pela UI (sem precisar de `GIZMOS_API_KEY`) ou `gizmos push` com key
> - Modelo normalizado atual é mantido (projects + risks/action_items/decisions/stakeholders + user_settings); remove só o acoplamento ao auth do Supabase
> - Auth: **sem login/RLS** — o loader do gizmos garante SSO; app lê `x-gizmos-*`
> - `architecture.md` precisa ser atualizado para refletir o destino gizmos (hoje descreve "SQLite local-first"; o código foi pra Supabase; destino real = D1 no Cloudflare Worker)

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
