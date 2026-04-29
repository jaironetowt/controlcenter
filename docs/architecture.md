# Control Center — Arquitetura Técnica

## Stack

| Camada | Tecnologia | Versão | Motivo |
|--------|-----------|--------|--------|
| Framework | Next.js (App Router) | 16.2.4 | SSR + API routes no mesmo repo |
| UI | Mantine | 9.1.1 | Componentes ricos prontos para uso |
| CSS | Tailwind | 4 | Utilidades para layout e customização |
| Ícones | Tabler Icons | 3.x | Consistente com Mantine |
| Estado global | Zustand | 5.x | Leve, sem Provider, persiste no localStorage |
| Banco de dados | SQLite via Drizzle ORM | 0.45.x | Local-first, sem infra, fácil backup |
| IA | Anthropic SDK (`@anthropic-ai/sdk`) | 0.91.x | Geração de relatórios, sumarização |
| Automação | n8n (externo) | — | Webhooks de integrações |
| Linguagem | TypeScript strict | 5.x | Type safety em toda a stack |

## Estrutura de Pastas

```
Control Center/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (MantineProvider, Zustand hydration)
│   ├── page.tsx                  # Redirect → /workspace
│   ├── (global)/                 # Rotas da visão global (sem projectId)
│   │   ├── workspace/            # Global View — cards de todos os projetos
│   │   └── action-items/         # Action items agregados cross-projeto
│   ├── projects/
│   │   └── [projectId]/          # Rotas de projeto individual
│   │       ├── dashboard/        # Project View — grid de gadgets
│   │       ├── risks/            # Risk log
│   │       ├── decisions/        # Decision log
│   │       ├── stakeholders/     # Stakeholder map
│   │       ├── action-items/     # Action items do projeto
│   │       ├── metrics/          # Métricas (Jira, etc.)
│   │       ├── knowledge/        # Links, atas de reunião
│   │       └── reports/          # Geração de relatórios
│   └── api/                      # Route Handlers (API-first: toda escrita passa aqui)
│       ├── projects/
│       ├── risks/
│       ├── decisions/
│       ├── stakeholders/
│       ├── action-items/
│       ├── gadgets/
│       ├── reports/
│       └── integrations/
│           ├── jira/
│           ├── google/
│           └── salesforce/
│
├── components/
│   ├── workspace/                # Global View
│   │   ├── ProjectCard.tsx       # Card com health indicator
│   │   └── AlertsFeed.tsx        # Feed de alertas cross-projeto
│   ├── project/                  # Project View
│   │   ├── GadgetGrid.tsx        # CSS Grid com layout salvo no DB
│   │   └── GadgetContainer.tsx   # Wrapper de gadget (título, config, loading)
│   ├── gadgets/                  # Gadgets plugáveis (um componente por tipo)
│   │   ├── RiskSummaryGadget.tsx
│   │   ├── ActionItemsGadget.tsx
│   │   ├── TeamTimecardsGadget.tsx
│   │   └── MetricsGadget.tsx
│   ├── quick-capture/            # Modal global de captura rápida
│   │   ├── QuickCaptureModal.tsx
│   │   └── forms/                # Um form por tipo (Risk, Decision, ActionItem, Nota)
│   ├── shared/                   # Layout e navegação
│   │   ├── AppShell.tsx          # Mantine AppShell (sidebar + header)
│   │   ├── ProjectSidebar.tsx    # Lista de projetos + seções
│   │   └── Breadcrumb.tsx
│   └── ui/                       # Primitivos customizados sobre Mantine/Tailwind
│
├── modules/                      # Lógica de domínio pura (sem React, sem HTTP)
│   ├── risk-log/
│   │   └── health.ts             # Cálculo do health score por projeto
│   ├── decision-log/
│   ├── stakeholder-map/
│   ├── action-items/
│   └── reporting/
│
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema (source of truth dos modelos)
│   │   ├── client.ts             # Singleton SQLite connection
│   │   └── migrations/
│   ├── integrations/
│   │   ├── jira.ts
│   │   ├── salesforce.ts         # API token + instância; usado pelo Timecards gadget
│   │   ├── google/
│   │   │   ├── oauth.ts
│   │   │   ├── drive.ts
│   │   │   └── calendar.ts
│   │   └── n8n.ts
│   └── ai/
│       ├── client.ts             # @anthropic-ai/sdk singleton (claude-sonnet-4-6)
│       └── prompts/
│
├── store/                        # Zustand stores
│   ├── navigation.ts             # Projeto ativo, rota atual
│   └── quick-capture.ts          # Estado do modal de captura rápida
│
├── data/                         # Seeds e fixtures locais
├── scripts/                      # Scripts de manutenção (migrate, seed)
├── docs/
│   ├── vision.md
│   ├── architecture.md           # Este arquivo
│   └── pillars/
└── public/
```

## Modelo de Dados

Definido em `lib/db/schema.ts` via Drizzle ORM. Abaixo a visão conceitual.

```
Project
  id, name, description, status, color
  stack          JSON  — { jiraKey, confluenceSpace, figmaFile, ... }
  gadgetLayout   JSON  — [{ gadgetId, type, row, col, w, h, config }]
  createdAt, updatedAt

Risk
  id, projectId
  title, description
  probability    1–5
  impact         1–5
  score          calculado (probability × impact)
  status         Open | Mitigated | Closed
  owner, mitigation, dueDate
  createdAt, updatedAt

Decision
  id, projectId
  title, context, decision, rationale, alternatives
  decisionMaker
  stakeholders   JSON  — string[]
  status         Proposed | Approved | Rejected | Superseded
  decidedAt, createdAt

ActionItem
  id, projectId
  title, description
  owner, dueDate
  status         Open | InProgress | Done | Cancelled
  priority       Low | Medium | High | Critical
  createdAt, updatedAt

Stakeholder
  id, projectId
  name, role, organization
  influence      1–5
  interest       1–5
  engagementLevel  Unaware | Resistant | Neutral | Supportive | Champion
  contactInfo, notes
  createdAt

Note
  id, projectId
  title, body    Markdown
  tags           JSON  — string[]
  createdAt, updatedAt

IntegrationConfig
  id, projectId (null = global)
  provider       jira | google | salesforce | n8n | anthropic
  config         JSON  — credenciais e settings (armazenado criptografado)
  createdAt, updatedAt
```

## Decisões Arquiteturais

### Estado global com Zustand
`store/navigation.ts` guarda o projeto ativo e sincroniza com a URL. Sem Context Provider — os stores são importados diretamente nos componentes. Estado de UI efêmero (modais abertos, etc.) vive em `store/quick-capture.ts` e similares.

### Gadget system — CSS Grid + layout em JSON
O layout de gadgets é salvo em `Project.gadgetLayout` como JSON. Cada gadget tem `{ type, row, col, w, h, config }`. O `GadgetGrid` renderiza via CSS Grid sem dependência de bibliotecas de drag & drop. Drag & drop pode ser adicionado na frente sem mudar o modelo de dados.

### Health Score
Calculado em `modules/risk-log/health.ts` como função pura, server-side. Retorna `healthy | at-risk | critical` baseado em:
- Risks abertos com score ≥ 12 → `critical`
- Risks abertos com score ≥ 8 ou action items overdue → `at-risk`
- Demais → `healthy`
Lógica configurável por projeto no futuro (CF-008).

### Quick Capture
Modal global montado no root layout, controlado por `store/quick-capture.ts`. Acessível via botão na sidebar e atalho de teclado (`C`). Sabe qual projeto está ativo via `store/navigation.ts`.

### Integração Salesforce (Team Timecards)
`lib/integrations/salesforce.ts` consome a API REST do Salesforce com API token + URL da instância. O gadget `TeamTimecardsGadget` chama `/api/integrations/salesforce/timecards` que retorna a lista de membros com timecard pendente na semana corrente. Credenciais salvas em `IntegrationConfig` (criptografadas).

### API-first
Toda escrita no banco passa pelos Route Handlers em `app/api/`. Componentes de UI nunca importam `lib/db` diretamente — sempre via fetch ou Server Actions que delegam para a API.

## Princípios

1. **Local-first** — tudo funciona offline; integrações são camada opcional
2. **Modular** — cada gadget é independente, sem acoplamento entre si
3. **API-first** — toda escrita passa pela API, nunca direto no banco
4. **Agnóstico** — integrações são plugins, não core do sistema
5. **IA como acelerador** — nunca como bloqueio; sempre com fallback manual
