# Spec — CC-F01: App Shell

## Repositório

**https://github.com/jaironetowt/controlcenter**

Antes de qualquer implementação, inicializar o git e fazer o primeiro push:
```bash
cd "/Users/jaironeto/Documents/Dev/Projects/Control Center"
git init
git add .
git commit -m "chore: initial commit"
git remote add origin https://github.com/jaironetowt/controlcenter.git
git push -u origin main
```

---

## Referências visuais (Figma)

Wireframes em: **https://www.figma.com/design/7NR8tkSdeVzV9Ci8NhmlWe**

| Page | O que mostra |
|------|-------------|
| 01 — Global View | Layout geral, sidebar, cards de projeto com health badge top-right, seção de alertas |
| 02 — Project View | Header do projeto, sidebar com sub-menu colapsável, grid de gadgets, right panel (estrutura) |
| 03 — Quick Capture | Modal de captura rápida (referência futura — não implementar nesta fase) |

> O Figma tem prioridade visual. Onde houver conflito entre wireframe e spec escrita, consultar o Jairo antes de decidir.

---

## O que é
Estrutura base do Control Center: sidebar esquerda + área de conteúdo principal + painel direito de gadgets. É o esqueleto de todas as telas do app.

## Stack técnica
- Next.js 16, App Router, diretório `src/`
- Alias `@/*` → `./src/*`
- Mantine 9 + Tailwind 4 + TypeScript strict
- Tabler Icons (`@tabler/icons-react`)
- Zustand 5 para estado global

## Layout

```
┌──────────────────────────────────────────────────────────┐
│ Sidebar (240px)  │  Main content (flex-1) │ Right (280px)│
│ bg: #1F1F24      │  bg: #F4F4F5           │ bg: #F4F4F5  │
│ fixed, full-h    │  overflow-y: auto       │ fixed, full-h│
└──────────────────────────────────────────────────────────┘
```

O container raiz é `flex h-screen overflow-hidden`.

---

## Sidebar (CC-F02)

**Estrutura de cima pra baixo:**

1. **Logo** — ícone quadrado azul (IconStack2, 16px) + texto "Control Center" 13px semibold branco
2. **Separador**
3. **Global nav** — All Projects, Action Items, Alerts (ícones pequenos, texto 13px, cor textSide #C7C7CC, hover bg white/8)
4. **Separador + label "PROJECTS"** — 10px uppercase semibold #C7C7CC/60
5. **Lista de projetos** — dot colorido + nome do projeto
   - Projeto ativo: bg white/10, texto branco, font medium
   - **Sub-menu colapsável** aparece imediatamente abaixo do projeto ativo, indentado com borda-l branca/10
   - Sub-menu itens: Dashboard, Risks, Decisions, Action Items, Stakeholders, Metrics, Knowledge, Reports
   - Item ativo do sub-menu: bg white/8, branco, font medium. Demais: #C7C7CC/70, 12px
6. **Footer** (mt-auto) — nome e email do usuário, separador acima

**Dados hardcoded por ora:**
```ts
const projects = [
  { id: 'mosaic',   name: 'Mosaic',       color: '#3E77FC' },
  { id: 'whr',      name: 'WHR Redesign', color: '#8B56FC' },
  { id: 'client-x', name: 'Client X',    color: '#F59E0B' },
]
const activeProject = 'mosaic'
const activeModule  = 'Dashboard'
```

---

## Right Panel (CC-F03)

Painel fixo de 280px na direita. Scroll próprio. Contém gadgets empilhados verticalmente.

**Estrutura:**
- `aside` com `w-[280px] h-full overflow-y-auto bg-[#F4F4F5] border-l border-zinc-200`
- Padding interno: `p-4`, gap entre gadgets: `gap-3`
- Cada gadget: card branco, `rounded-xl border border-zinc-200 p-4`

**Gadgets desta fase (nesta ordem):**

### Slot 1 — Quick Notes
- Header: ícone `IconNotes` (15px, zinc-400) + label "Quick Notes" 12px semibold zinc-700
- Corpo: `<textarea>` via Mantine `<Textarea>` — placeholder "Type anything here…", autosize, minRows 5, fundo #F9F9FA, borda zinc-200, radius 8px, fontSize 12px
- Botão "Clear" aparece abaixo à direita quando há texto (11px, zinc-400, hover zinc-600)
- Estado local com `useState` — sem persistência por ora

### Slot 2 — Upcoming
- Header: ícone `IconCalendar` (15px, zinc-400) + label "Upcoming" 12px semibold zinc-700
- Lista de eventos hardcoded por ora:
  ```ts
  [
    { date: 'Apr 30', label: 'Sprint demo',         urgent: true  },
    { date: 'May 5',  label: 'Stakeholder review',  urgent: false },
    { date: 'May 15', label: 'Q2 Milestone',        urgent: false },
    { date: 'May 20', label: 'Kickoff — Client X',  urgent: false },
  ]
  ```
- Cada item: data (11px, w-12, urgent → red-500, normal → zinc-400) + label (12px, zinc-700)

### Slot 3 — GadgetSlot (placeholder)
- Botão com borda dashed zinc-200, radius xl, padding vertical py-6
- Ícone `IconPlus` (18px) centralizado + texto "Add gadget" abaixo (12px)
- Hover: borda blue-300, texto blue-400
- Sem funcionalidade por ora

---

## Página inicial

Rota `/` renderiza o Project View hardcoded (projeto Mosaic).

**Header:**
- Barra vertical esquerda 4px azul + nome do projeto "Mosaic" 20px bold zinc-900
- Subtítulo: "WillowTree Internal · Development · Jan – Jun 2026" 13px zinc-500

**Main content:** área vazia por enquanto — gadget grid vem em ticket futuro.

---

## Critérios de aceite

- [ ] Layout não quebra ao redimensionar (sidebar e right panel ficam fixos, main faz scroll)
- [ ] Sub-menu aparece apenas abaixo do projeto ativo
- [ ] Quick Notes: digitar e limpar funciona
- [ ] Upcoming: lista renderiza corretamente com data urgent em vermelho
- [ ] GadgetSlot: hover muda cor de borda e texto
- [ ] Nenhum erro de TypeScript (`strict: true`)
- [ ] Nenhum erro de console no browser
