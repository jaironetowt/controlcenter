# Spec — CC-F06: Global View

## O que é

Tela inicial do Control Center (rota `/global` ou tab "All Projects" na global nav). Mostra todos os projetos do usuário em formato de cards, com health badge visível no canto superior direito de cada card.

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  All Projects                                             │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │           ● ● │  │           ● ● │  │        ● ● │  │
│  │ ■ Mosaic       │  │ ■ WHR Redesign │  │ ■ Client X  │  │
│  │ WillowTree Int │  │ WillowTree Int │  │ Poatek      │  │
│  │ Development    │  │ Design         │  │ Discovery   │  │
│  │ Jan–Jun 2026   │  │ Mar–Jul 2026   │  │ Apr–May 26  │  │
│  └────────────────┘  └────────────────┘  └────────────┘  │
└──────────────────────────────────────────────────────────┘
```

- Container da página: `p-6 overflow-y-auto h-full`
- Título: `text-xl font-bold text-zinc-900 mb-4`
- Grid de cards: `grid grid-cols-3 gap-4` (responsivo: `sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)

---

## Project Card

```
┌──────────────────────────────────┐
│                            [●][●] │   ← health badges (top-right)
│  ■  Mosaic                        │   ← dot colorido + nome
│     WillowTree Internal           │   ← client
│     Development                   │   ← phase
│     Jan – Jun 2026                │   ← date range
└──────────────────────────────────┘
```

- Container: `bg-white rounded-xl border border-zinc-200 p-4 hover:shadow-sm transition-shadow cursor-pointer relative`
- **Health badges** (canto superior direito, absoluto): `absolute top-3 right-3 flex items-center gap-1.5`
  - Mesmos componentes `<ExternalHealthBadge>` e `<InternalHealthBadge>` do CC-F05
- **Dot + Nome**: `flex items-center gap-2 mt-1`
  - Dot: `w-2.5 h-2.5 rounded-full flex-shrink-0` com `backgroundColor: project.color`
  - Nome: `text-[15px] font-semibold text-zinc-900`
- **Metadados**: `mt-2 flex flex-col gap-0.5`
  - Client, phase, date range: `text-[12px] text-zinc-500`

---

## Dados hardcoded (fase 1)

```ts
const projects = [
  {
    id: 'mosaic',
    name: 'Mosaic',
    color: '#3E77FC',
    client: 'WillowTree Internal',
    phase: 'Development',
    dateRange: 'Jan – Jun 2026',
  },
  {
    id: 'whr',
    name: 'WHR Redesign',
    color: '#8B56FC',
    client: 'WillowTree Internal',
    phase: 'Design',
    dateRange: 'Mar – Jul 2026',
  },
  {
    id: 'client-x',
    name: 'Client X',
    color: '#F59E0B',
    client: 'Poatek',
    phase: 'Discovery',
    dateRange: 'Apr – May 2026',
  },
]
```

---

## Rota e navegação

- Rota: `/` (redirecionar para `/projects/mosaic` quando usuário clica em um card — por ora ambas podem ser stubs)
- O item "All Projects" da global nav da Sidebar deve linkar para `/`
- Clicar em um project card navega para `/projects/{id}` (rota ainda não existe — criar stub vazia com o Project View Header do CC-F05)

---

## Critérios de aceite

- [ ] Grid renderiza os 3 cards com dados corretos
- [ ] Health badges aparecem no canto superior direito de cada card
- [ ] Badge External clicável por card (estado independente por projeto via Zustand)
- [ ] Badge Internal em verde (calculado), read-only
- [ ] Hover no card mostra shadow sutil
- [ ] Rota `/` renderiza Global View em vez do Project View atual
- [ ] Nenhum erro de TypeScript (strict: true)
