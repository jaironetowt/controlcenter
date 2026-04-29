# Spec — CC-F05: Project View Header

## O que é

Header fixo no topo da área de conteúdo principal quando o usuário está dentro de um projeto. Exibe identidade do projeto e os dois indicadores de saúde: External (manual) e Internal (calculado automaticamente).

---

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ ▌ Mosaic                                                [●] [●]  │
│   WillowTree Internal · Development · Jan – Jun 2026            │
└──────────────────────────────────────────────────────────────────┘
```

- Container: `border-b border-zinc-200 bg-white px-6 py-4 flex items-center gap-4`
- Barra vertical esquerda: `w-1 h-8 rounded-full bg-blue-500 flex-shrink-0` (cor varia por projeto)
- Lado esquerdo (`flex-1 min-w-0`):
  - Nome do projeto: `text-xl font-bold text-zinc-900 truncate`
  - Subtítulo: `text-[13px] text-zinc-500 mt-0.5` — formato: `{client} · {phase} · {dateRange}`
- Lado direito (`flex items-center gap-2 flex-shrink-0`): badges de saúde

---

## Health Indicators

### External Health (manual)

O PM define manualmente o status percebido pelo cliente / stakeholders externos.

**Componente:** `<ExternalHealthBadge status="green" />`

| Prop `status` | Cor | Label tooltip |
|---------------|-----|---------------|
| `green`       | `#22C55E` (green-500) | "External: On Track" |
| `yellow`      | `#EAB308` (yellow-500) | "External: At Risk" |
| `red`         | `#EF4444` (red-500)   | "External: Off Track" |

**Visual:** círculo sólido 10px + `E` em fonte 9px bold branca sobreposto. Hover: Mantine Tooltip com label.

**Interação:** clique abre um `Popover` do Mantine com três opções de cor (círculos clicáveis). Seleção persiste via Zustand (sem backend por ora — `localStorage`).

**Store:** `useProjectHealthStore` com `externalStatus: 'green' | 'yellow' | 'red'`, persist key `cc-health-{projectId}`.

---

### Internal Health (calculado)

Calculado automaticamente com base nos dados disponíveis no projeto. Por ora (fase 1), a lógica é simples e hardcoded — evoluirá nas fases seguintes.

**Componente:** `<InternalHealthBadge />`

**Lógica fase 1 (hardcoded / placeholder):**
- Retorna sempre `green` enquanto não há dados reais
- Quando PI-001 (Risk Log) estiver implementado: vermelho se qualquer risco com severidade "Critical" estiver aberto
- Quando PI-004 (Action Items) estiver implementado: amarelo se qualquer action item com due date vencida

**Visual:** idêntico ao External, mas com `I` no centro e fundo com opacidade 80% para distinguir visualmente.

**Tooltip:** "Internal: On Track (calculated)" — sempre read-only, sem popover de edição.

---

## Dados hardcoded (fase 1)

```ts
const project = {
  id: 'mosaic',
  name: 'Mosaic',
  color: '#3E77FC',
  client: 'WillowTree Internal',
  phase: 'Development',
  dateRange: 'Jan – Jun 2026',
}
```

---

## Critérios de aceite

- [ ] Header renderiza com barra colorida, nome, subtítulo e dois badges
- [ ] Badge External: clique abre popover com 3 opções de cor
- [ ] Seleção de cor persiste ao recarregar (localStorage via Zustand persist)
- [ ] Badge Internal: renderiza em verde com tooltip "calculated", sem interação de edição
- [ ] Tooltip aparece em hover em ambos os badges
- [ ] Layout não quebra com nomes longos (truncate no nome do projeto)
- [ ] Nenhum erro de TypeScript (strict: true)
