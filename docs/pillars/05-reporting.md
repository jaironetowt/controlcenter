# Pilar 5 — Relatórios & Comunicação

## Visão

A maior dor: gerar reports de progresso com o menor esforço manual possível. O Control Center agrega os dados dos últimos X dias, extrai os key points e gera um draft pronto para revisão e envio.

## Tipos de relatório

### Status Report (semanal/quinzenal)
- O que foi feito nos últimos X dias
- O que está planejado para os próximos X dias
- Risks e blockers ativos
- Métricas-chave
- Action items em aberto

### Executive Summary
- Versão executiva do status report
- Foco em decisões, riscos críticos e milestones
- Linguagem de negócio, sem detalhes técnicos

### Sprint Report (para projetos com Jira)
- Itens concluídos na sprint
- Velocity vs. planejado
- Bugs introduzidos vs. resolvidos
- Retrospectiva (pontos de melhoria)

### Stakeholder Update
- Versão customizada por stakeholder (nível de detalhe configurável)
- Gerado como Google Slides ou email draft

## Fluxo de geração

```
Selecionar período + tipo de relatório
    ↓
Control Center agrega dados (risks, decisions, action items, métricas)
    ↓
IA processa e gera draft estruturado
    ↓
Usuário revisa e ajusta
    ↓
Exportar: Google Docs / Slides / email draft no Gmail
```

## Features — Backlog

| ID | Feature | Prioridade |
|----|---------|-----------|
| RP-001 | Geração de status report com IA | Alta |
| RP-002 | Configurar período do relatório (últimos X dias) | Alta |
| RP-003 | Preview do relatório antes de exportar | Alta |
| RP-004 | Exportar para Google Docs | Alta |
| RP-005 | Histórico de relatórios gerados | Média |
| RP-006 | Templates customizáveis de relatório | Média |
| RP-007 | Executive Summary | Média |
| RP-008 | Exportar para Google Slides | Média |
| RP-009 | Criar draft de e-mail no Gmail | Média |
| RP-010 | Sprint Report integrado com Jira | Baixa |
| RP-011 | Stakeholder Update personalizado | Baixa |
