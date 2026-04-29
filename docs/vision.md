# Control Center — Visão do Produto

## Problema

Um PM/PL gerencia múltiplos contextos simultaneamente — projetos, clientes, times, ferramentas. O esforço de *agregar* informação consome tempo que deveria estar sendo usado para *agir* sobre ela.

## Solução

Um portal pessoal que funciona como **sistema nervoso central** — não substitui as ferramentas existentes, mas conecta e apresenta o que importa, na hora certa, no lugar certo.

> "Um painel pessoal que agrega, organiza e processa informação de múltiplos projetos e ferramentas — reduzindo o tempo de troca de contexto e acelerando a geração de outputs de comunicação."

## Premissas

- **Agnóstico de ferramentas** — conecta com qualquer stack (Jira, Confluence, Figma, Linear, GitHub, etc.)
- **Suite Google como backbone** — Sheets, Docs, Slides, Calendar, Gmail, Drive
- **Automação via n8n** — orquestração de integrações e workflows
- **Multi-projeto** — cada projeto pode ter natureza e stack diferente
- **Modular** — cada feature é um gadget independente, ativável por projeto
- **Uso inicial solo**, com visão de dashboards exportáveis/compartilháveis no futuro

## Maior dor resolvida

Relatórios: capturar o que aconteceu nos últimos X dias, extrair key points, mastigar e gerar um relatório pronto para envio — com o menor esforço manual possível.

## Os 6 Pilares Funcionais

| # | Pilar | O que resolve |
|---|-------|---------------|
| 1 | Workspace | Tela inicial customizável, multi-projeto, gadgets modulares |
| 2 | Inteligência do Projeto | Risk log, Decision log, Action items, Stakeholder map |
| 3 | Métricas & Execução | Dados de Jira/etc. — velocidade, burn, qualidade |
| 4 | Conhecimento | Arquivos, atas de reunião, templates, busca |
| 5 | Relatórios & Comunicação | Geração automática de reports, status updates |
| 6 | Configuração & Integrações | Conexão com ferramentas, gestão de projetos, permissões |

## Roadmap de Fases

### Fase 1 — Foundation
Workspace funcional com gadgets básicos, gestão de projetos, estrutura de dados local.

### Fase 2 — Inteligência
Risk log, decision log, action items, stakeholder map com rastreio e histórico.

### Fase 3 — Integração
Conexão com Jira, Google Suite, Calendar, Gmail. Dados reais puxados automaticamente.

### Fase 4 — IA & Relatórios
Geração automática de reports, sumarização de progresso, drafts de status update.

### Fase 5 — Colaboração
Dashboards exportáveis, compartilhamento, permissões por projeto.
