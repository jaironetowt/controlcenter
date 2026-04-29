# Pilar 6 — Configuração & Integrações

## Visão

Gestão dos projetos cadastrados, configuração de integrações com ferramentas externas e personalização do comportamento do Control Center.

## Gestão de Projetos

- Criar, editar, arquivar projetos
- Definir stack de ferramentas por projeto (Jira key, Confluence space, Figma file, etc.)
- Configurar health score (quais indicadores compõem a nota)
- Definir gadgets ativos e layout do dashboard

## Integrações

### Google Suite
- OAuth com conta Google
- Scopes: Drive (leitura), Docs (criação), Slides (criação), Calendar (leitura), Gmail (criação de draft)

### Jira
- API token + domínio
- Scopes: projetos, issues, sprints

### n8n
- Webhook de entrada (eventos externos disparam updates no Control Center)
- Webhook de saída (Control Center dispara automações no n8n)

### Salesforce
- API token + instância
- Scopes: timecards
- Usado por: gadget Team Timecards — lista de quem ainda não enviou timecard na semana corrente

> **Futuro:** expandir para ver horas registradas por membro/período.

### Claude API (Anthropic)
- Chave de API configurável
- Modelo padrão configurável
- Usado por: geração de relatórios, sumarização de atas, extração de action items

## Features — Backlog

| ID | Feature | Prioridade |
|----|---------|-----------|
| CF-001 | CRUD de projetos com configuração de stack | Alta |
| CF-002 | Configuração da API Anthropic | Alta |
| CF-003 | Integração Google OAuth | Alta |
| CF-004 | Integração Jira (API token) | Alta |
| CF-005 | Configuração de gadgets por projeto | Alta |
| CF-006 | Integração Salesforce (API token) | Média |
| CF-007 | Webhook n8n (entrada e saída) | Média |
| CF-008 | Configuração do health score automático (internal) | Média |
| CF-009 | Exportar / importar configuração de projeto | Baixa |
| CF-010 | Multi-usuário (compartilhar projetos) | Baixa |
