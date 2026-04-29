# Spec — CC-F04: Painéis Colapsáveis

## Sidebar esquerda — colapso parcial

Quando colapsada, a sidebar **não desaparece** — fica em modo estreito mostrando apenas ícones.

| Estado | Largura | O que mostra |
|--------|---------|-------------|
| Expandida | 240px | Ícone + label + sub-menu |
| Colapsada | 56px | Apenas ícones, sem texto, sem sub-menu |

**Comportamento:**
- Botão de toggle no topo da sidebar (ex: `IconLayoutSidebarLeftCollapse` / `IconLayoutSidebarLeftExpand`)
- Estado persiste via `localStorage` (ou Zustand com persist) — ao reabrir o app, lembra o estado
- Em modo colapsado: ícones centralizados, sem label, sem sub-menu. Hover mostra tooltip com o nome do item
- Logo: em modo colapsado mostra só o ícone quadrado azul, sem o texto "Control Center"

**Itens com ícone mapeado:**

| Item | Ícone |
|------|-------|
| All Projects | IconLayoutDashboard |
| Action Items | IconChecklist |
| Alerts | IconBell |
| Dashboard (módulo) | IconLayoutDashboard |
| Risks | IconAlertTriangle |
| Decisions | IconNotes |
| Action Items (módulo) | IconChecklist |
| Stakeholders | IconUsers |
| Metrics | IconChartBar |
| Knowledge | IconBook |
| Reports | IconFileText |

---

## Right Panel — colapso total com trigger

Quando colapsado, o right panel **desaparece completamente**, deixando apenas um botão estreito na borda direita da tela para reabrir.

| Estado | Largura | O que mostra |
|--------|---------|-------------|
| Expandido | 280px | Gadgets normais |
| Colapsado | 28px | Só um ícone de toggle centralizado verticalmente |

**Comportamento:**
- Botão de toggle: `IconLayoutSidebarRightCollapse` / `IconLayoutSidebarRightExpand`, posicionado no topo do painel ou fixo na borda
- Quando colapsado: strip de 28px com fundo #F4F4F5, borda-l, ícone centralizado
- Estado persiste via `localStorage`

---

## Critérios de aceite

- [ ] Sidebar colapsa para 56px mantendo ícones visíveis e funcionais
- [ ] Sidebar expandida volta aos 240px com labels e sub-menu
- [ ] Tooltip aparece nos ícones da sidebar colapsada
- [ ] Right panel some completamente e deixa strip de 28px com ícone de toggle
- [ ] Right panel reabre ao clicar no ícone
- [ ] Ambos os estados são persistidos (localStorage ou Zustand persist)
- [ ] Layout se ajusta fluidamente — main content ocupa o espaço liberado
- [ ] Sem quebra de layout em nenhum dos estados
