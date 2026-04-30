# Spec — CC-07: Criar / Editar / Arquivar Projeto

## O que é

Gestão completa de projetos: criar, editar dados e arquivar. Substitui os dados hardcoded por um store persistido. Desbloqueador da Fase 2 inteira.

---

## Modelo de dados

```ts
interface Project {
  id: string;          // nanoid (ex: "abc123")
  name: string;
  color: string;       // hex (ex: "#3E77FC")
  client: string;
  phase: string;
  dateRange: string;   // ex: "Jan – Jun 2026"
  archived: boolean;
  createdAt: number;   // Date.now()
}
```

---

## Store — `useProjectsStore`

Zustand com `persist` (localStorage key `cc-projects`).

```ts
interface ProjectsStore {
  projects: Project[];
  addProject: (data: Omit<Project, 'id' | 'archived' | 'createdAt'>) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  archiveProject: (id: string) => void;
}
```

**Seed inicial** — pré-popular com os 3 projetos hardcoded para não quebrar nada:
```ts
const SEED: Project[] = [
  { id: 'mosaic',   name: 'Mosaic',       color: '#3E77FC', client: 'WillowTree Internal', phase: 'Development', dateRange: 'Jan – Jun 2026', archived: false, createdAt: 0 },
  { id: 'whr',      name: 'WHR Redesign', color: '#8B56FC', client: 'WillowTree Internal', phase: 'Design',       dateRange: 'Mar – Jul 2026', archived: false, createdAt: 1 },
  { id: 'client-x', name: 'Client X',    color: '#F59E0B', client: 'Poatek',              phase: 'Discovery',    dateRange: 'Apr – May 2026', archived: false, createdAt: 2 },
]
```

Inicializar o store com os seeds apenas se `projects` estiver vazio (primeira execução).

---

## UI — Modal de criar/editar

**Trigger de criação:** botão `+ New Project` no rodapé da lista de projetos na Sidebar (abaixo do último projeto, antes do footer de usuário). Texto `text-[12px] text-[#C7C7CC]/60 hover:text-[#C7C7CC]`, com `IconPlus size={11}` à esquerda. Só aparece no modo expandido.

**Trigger de edição:** ícone `IconPencil` (12px, zinc-400) que aparece ao fazer hover no nome do projeto na Sidebar — substitui o dot colorido no hover.

**Modal** — Mantine `<Modal>`:
- `title`: "New Project" ou "Edit Project"
- `size`: "sm"
- `centered`: true

**Campos do formulário:**

| Campo | Componente | Validação |
|-------|-----------|-----------|
| Project name | `<TextInput>` | Obrigatório, max 50 chars |
| Color | Swatch picker (ver abaixo) | Obrigatório |
| Client | `<TextInput>` | Obrigatório |
| Phase | `<TextInput>` placeholder "Development, Design, Discovery…" | Obrigatório |
| Date range | `<TextInput>` placeholder "Jan – Jun 2026" | Opcional |

**Color picker:** Row de 8 swatches pré-definidos (não free-form por ora):
```ts
const COLORS = ['#3E77FC','#8B56FC','#F59E0B','#EF4444','#22C55E','#EC4899','#06B6D4','#64748B']
```
Cada swatch: círculo 20px, borda-2 escura quando selecionado.

**Botões:**
- "Save" (primary, blue) — cria ou atualiza
- "Cancel" — fecha sem salvar
- "Archive" (destructive, vermelho, ghost) — só aparece no modo edição, alinhado à esquerda

**Arquivar:** exibe um `<Modal.confirm>` de confirmação antes de arquivar. Projetos arquivados somem da sidebar e da global view (filtrar `archived === false`).

---

## Impacto em outros componentes

- **`Sidebar.tsx`**: substituir array `projects` hardcoded por `useProjectsStore(s => s.projects.filter(p => !p.archived))`
- **`page.tsx`** e **`ProjectHeader`**: projeto ativo continua sendo o primeiro da lista por ora (sem navegação entre projetos ainda)
- **`GadgetSlot`** e outros que usem dados de projeto: não impactados nesta fase

---

## Arquivo do store

Criar em: `src/stores/useProjectsStore.ts`

---

## Critérios de aceite

- [ ] Criar projeto funciona: aparece na sidebar imediatamente
- [ ] Editar projeto funciona: nome e cor atualizam na sidebar
- [ ] Arquivar remove da sidebar e da global view
- [ ] Dados persistem após reload (localStorage)
- [ ] Seed dos 3 projetos originais está presente na primeira execução
- [ ] Validação impede salvar sem nome, cliente e fase
- [ ] Nenhum erro de TypeScript (strict: true)
