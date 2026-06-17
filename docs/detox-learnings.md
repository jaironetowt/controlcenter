# Learnings do Command Center → Project Management Center

> Versão **destilada e sanitizada** de um brief de produto trazido de outra ferramenta
> (gestão via Claude/cowork). **Sem dados sensíveis** (nomes, e-mails, canais, IDs de
> cloud, terminologia interna foram removidos de propósito — esses ficam fora do git).
> Objetivo: registrar os padrões **genéricos e estáveis** que valem a pena trazer pro PMC.

## Princípio de arquitetura: portal passivo

- **Claude/cowork = cérebro ativo**: coleta de contexto, fontes vivas, geração de texto.
- **PMC = palco passivo**: dashboards, to-dos, riscos, decisões, stakeholders, RAG. Só
  **exibe** o que está no D1. Sem connectors, sem agentes, sem skills no portal.
- **Ponte (futura)**: Claude escreve no D1 do portal via rota de ingestão protegida por
  API key (`[[gizmos_api_keys]]` → `gzak_`), por interação ou scheduled. Ver backlog CC-127.

## Padrões transferíveis (genéricos, estáveis) → Fase 3

| Padrão | Aplicação no PMC | Backlog |
|--------|------------------|---------|
| "Today" / Mission Control | Landing com fila de prioridade: action items atrasados + riscos abertos high, agregando os projetos do espaço | CC-121 |
| RAG status | Derivar 🔴/🟡/🟢 por projeto (blocker crítico / dependências abertas / ok) + override manual | CC-122 |
| Action items: meus vs time | Filtro por owner = usuário atual | CC-123 |
| Blockers & idade | Status "blocked" + dias-aberto + flag de escalonamento (≥N dias) | CC-124 |
| People directory | Diretório de pessoas cross-projeto (genérico, sem auto-lookup de connector) | CC-125 |
| Command palette | Navegação rápida (ir pra projeto/risco/ação; "status de X") | CC-126 |

## Regras de conteúdo genéricas (aplicar onde fizer sentido)

- Datas sempre **absolutas** (não "em 3 dias").
- **Plural = plural**: quando vários itens batem numa busca/filtro, mostrar todos; nunca
  reduzir ao "mais provável".
- "Last updated" por painel; **cache-first + 1 Reload por view** (não um reload por card).
- Estados vazios/erro graciosos em toda lista.
- Texto exec/externo em inglês de negócio (quando houver geração de texto — hoje fora de escopo).

## Fora de escopo no portal (fica no Claude/cowork)

Connectors vivos (chat/e-mail/PM tools/CRM/drive), pipelines de refresh com modelo de IA,
"deliverables hub" que embrulha skills, console de rotinas, corroboração entre fontes vivas,
e qualquer terminologia/estrutura específica de um projeto-cliente. O portal não reimplementa
ferramentas — ele é a camada visual sobre os dados que o Claude deposita.

## Fundações de estabilidade (Fase 2.8 — prioridade)

Error boundary global (CC-116 ✅), neutralizar integrações vivas mortas (CC-117/118 ✅),
hydration guards + versionar persist (CC-119), estados de loading/erro/vazio (CC-120),
validação on-platform no browser (CC-109).
