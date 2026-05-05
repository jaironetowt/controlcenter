#!/usr/bin/env node
/**
 * migrate-from-localstorage.ts
 *
 * Script de migração one-shot: lê um JSON dump do localStorage e insere
 * os dados no Supabase.
 *
 * Uso:
 *   1. No browser, abra o DevTools → Console e rode:
 *
 *      const keys = ['cc-projects','cc-risks-v2','cc-action-items','cc-decisions','cc-stakeholders','cc-features'];
 *      const dump = {};
 *      keys.forEach(k => { try { dump[k] = JSON.parse(localStorage.getItem(k) || '{}'); } catch(e) {} });
 *      console.log(JSON.stringify(dump, null, 2));
 *
 *   2. Salve o output em um arquivo, ex: localstorage-dump.json
 *
 *   3. Crie o arquivo .env.local com as variáveis do Supabase
 *
 *   4. Rode:
 *      npx tsx scripts/migrate-from-localstorage.ts localstorage-dump.json
 *
 * Estrutura esperada do JSON de input:
 * {
 *   "cc-projects":     { "state": { "projects": [...] } },
 *   "cc-risks-v2":     { "state": { "risks": [...] } },
 *   "cc-action-items": { "state": { "items": [...] } },
 *   "cc-decisions":    { "state": { "decisions": [...] } },
 *   "cc-stakeholders": { "state": { "stakeholders": [...] } },
 *   "cc-features":     { "state": { "features": { ... } } }
 * }
 *
 * Alternativamente, o script também aceita um JSON no formato simplificado
 * (sem o wrapper "state") direto com as arrays:
 * {
 *   "projects": [...],
 *   "risks": [...],
 *   "action_items": [...],
 *   "decisions": [...],
 *   "stakeholders": [...],
 *   "features": { ... }
 * }
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// ─── Env ──────────────────────────────────────────────────────────────────────

// Carregar .env.local manualmente (tsx não lê .env automaticamente)
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local não encontrado. Use variáveis de ambiente diretamente.');
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios.');
  process.exit(1);
}

// ─── Types locais (espelhando os stores) ──────────────────────────────────────

interface Project {
  id: string;
  name: string;
  color: string;
  client: string;
  phase: string;
  dateRange: string;
  archived: boolean;
  archivedAt?: number;
  createdAt: number;
  salesforceId?: string;
}

interface Risk {
  id: string;
  projectId: string;
  title: string;
  description: string;
  probability: string;
  impact: string;
  status: string;
  owner: string;
  createdAt: number;
  closedAt?: number;
}

interface ActionItem {
  id: string;
  projectId: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: string;
  status: string;
  createdAt: number;
}

interface Decision {
  id: string;
  projectId: string;
  title: string;
  context: string;
  decision: string;
  alternatives: string;
  author: string;
  createdAt: number;
}

interface Stakeholder {
  id: string;
  projectId: string;
  name: string;
  role: string;
  company: string;
  influence: string;
  interest: string;
  notes: string;
  createdAt: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function msToIso(ms: number | undefined): string | null {
  if (!ms) return null;
  return new Date(ms).toISOString();
}

function ensureUuid(id: string): string {
  // Se já é UUID válido, retorna como está
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  // IDs legados (ex: 'mosaic', 'risk-seed-1') precisam de um UUID estável
  // Gera um UUID v5-like deterministico usando o id como seed com crypto
  // Para simplicidade, geramos um UUID aleatório mas logamos o mapeamento
  const newId = crypto.randomUUID();
  console.log(`  ↳ ID legado "${id}" → "${newId}"`);
  return newId;
}

// ─── Parse input ─────────────────────────────────────────────────────────────

function parseInput(raw: Record<string, unknown>) {
  // Formato localStorage (com wrapper "state")
  if (raw['cc-projects'] !== undefined) {
    const proj = (raw['cc-projects'] as { state?: { projects?: Project[] } })?.state?.projects ?? [];
    const risks = (raw['cc-risks-v2'] as { state?: { risks?: Risk[] } })?.state?.risks ?? [];
    const items = (raw['cc-action-items'] as { state?: { items?: ActionItem[] } })?.state?.items ?? [];
    const decs = (raw['cc-decisions'] as { state?: { decisions?: Decision[] } })?.state?.decisions ?? [];
    const shs = (raw['cc-stakeholders'] as { state?: { stakeholders?: Stakeholder[] } })?.state?.stakeholders ?? [];
    const feats = (raw['cc-features'] as { state?: { features?: Record<string, boolean> } })?.state?.features ?? {};
    return { projects: proj, risks, action_items: items, decisions: decs, stakeholders: shs, features: feats };
  }

  // Formato simplificado (arrays diretas)
  return {
    projects:     (raw.projects as Project[]) ?? [],
    risks:        (raw.risks as Risk[]) ?? [],
    action_items: (raw.action_items as ActionItem[]) ?? [],
    decisions:    (raw.decisions as Decision[]) ?? [],
    stakeholders: (raw.stakeholders as Stakeholder[]) ?? [],
    features:     (raw.features as Record<string, boolean>) ?? {},
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error('Uso: npx tsx scripts/migrate-from-localstorage.ts <caminho-do-dump.json>');
    process.exit(1);
  }

  const absPath = path.resolve(process.cwd(), inputFile);
  if (!fs.existsSync(absPath)) {
    console.error(`❌  Arquivo não encontrado: ${absPath}`);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(absPath, 'utf-8')) as Record<string, unknown>;
  const data = parseInput(raw);

  const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

  // Verificar autenticação — o script precisa de um token de serviço ou usar
  // a chave de service_role para bypassing de RLS. Com anon key, as RLS policies
  // vão bloquear. Aviso ao usuário.
  console.log('\n⚠️  ATENÇÃO: As RLS policies requerem autenticação.');
  console.log('   Para rodar este script, use a SERVICE_ROLE key do Supabase');
  console.log('   em vez da ANON key, OU desabilite temporariamente as RLS policies.');
  console.log('   SERVICE_ROLE key: Supabase → Settings → API → service_role\n');

  // ─── Mapas de ID legado → UUID ────────────────────────────────────────────
  const projectIdMap: Record<string, string> = {};

  // ─── Projetos ────────────────────────────────────────────────────────────

  console.log(`📦  Migrando ${data.projects.length} projeto(s)...`);
  for (const p of data.projects) {
    const newId = ensureUuid(p.id);
    projectIdMap[p.id] = newId;

    const row = {
      id:            newId,
      name:          p.name,
      color:         p.color,
      client:        p.client,
      phase:         p.phase,
      date_range:    p.dateRange,
      archived:      p.archived,
      archived_at:   msToIso(p.archivedAt ?? undefined),
      salesforce_id: p.salesforceId ?? null,
      created_at:    msToIso(p.createdAt) ?? new Date().toISOString(),
    };

    const { error } = await supabase.from('projects').upsert(row, { onConflict: 'id' });
    if (error) console.error(`  ❌ Projeto "${p.name}": ${error.message}`);
    else console.log(`  ✅ Projeto "${p.name}" (${newId})`);
  }

  // ─── Risks ───────────────────────────────────────────────────────────────

  console.log(`\n⚠️  Migrando ${data.risks.length} risco(s)...`);
  for (const r of data.risks) {
    const newId = ensureUuid(r.id);
    const newProjectId = projectIdMap[r.projectId] ?? ensureUuid(r.projectId);

    const row = {
      id:          newId,
      project_id:  newProjectId,
      title:       r.title,
      description: r.description,
      probability: r.probability,
      impact:      r.impact,
      status:      r.status,
      owner:       r.owner,
      created_at:  msToIso(r.createdAt) ?? new Date().toISOString(),
      closed_at:   msToIso(r.closedAt ?? undefined),
    };

    const { error } = await supabase.from('risks').upsert(row, { onConflict: 'id' });
    if (error) console.error(`  ❌ Risco "${r.title}": ${error.message}`);
    else console.log(`  ✅ Risco "${r.title}"`);
  }

  // ─── Action Items ─────────────────────────────────────────────────────────

  console.log(`\n📋  Migrando ${data.action_items.length} action item(s)...`);
  for (const item of data.action_items) {
    const newId = ensureUuid(item.id);
    const newProjectId = projectIdMap[item.projectId] ?? ensureUuid(item.projectId);

    const row = {
      id:         newId,
      project_id: newProjectId,
      title:      item.title,
      owner:      item.owner,
      due_date:   item.dueDate,
      priority:   item.priority,
      status:     item.status,
      created_at: msToIso(item.createdAt) ?? new Date().toISOString(),
    };

    const { error } = await supabase.from('action_items').upsert(row, { onConflict: 'id' });
    if (error) console.error(`  ❌ Item "${item.title}": ${error.message}`);
    else console.log(`  ✅ Item "${item.title}"`);
  }

  // ─── Decisions ───────────────────────────────────────────────────────────

  console.log(`\n📝  Migrando ${data.decisions.length} decisão(ões)...`);
  for (const d of data.decisions) {
    const newId = ensureUuid(d.id);
    const newProjectId = projectIdMap[d.projectId] ?? ensureUuid(d.projectId);

    const row = {
      id:           newId,
      project_id:   newProjectId,
      title:        d.title,
      context:      d.context,
      decision:     d.decision,
      alternatives: d.alternatives,
      author:       d.author,
      created_at:   msToIso(d.createdAt) ?? new Date().toISOString(),
    };

    const { error } = await supabase.from('decisions').upsert(row, { onConflict: 'id' });
    if (error) console.error(`  ❌ Decisão "${d.title}": ${error.message}`);
    else console.log(`  ✅ Decisão "${d.title}"`);
  }

  // ─── Stakeholders ─────────────────────────────────────────────────────────

  console.log(`\n👥  Migrando ${data.stakeholders.length} stakeholder(s)...`);
  for (const sh of data.stakeholders) {
    const newId = ensureUuid(sh.id);
    const newProjectId = projectIdMap[sh.projectId] ?? ensureUuid(sh.projectId);

    const row = {
      id:         newId,
      project_id: newProjectId,
      name:       sh.name,
      role:       sh.role,
      company:    sh.company,
      influence:  sh.influence,
      interest:   sh.interest,
      notes:      sh.notes,
      created_at: msToIso(sh.createdAt) ?? new Date().toISOString(),
    };

    const { error } = await supabase.from('stakeholders').upsert(row, { onConflict: 'id' });
    if (error) console.error(`  ❌ Stakeholder "${sh.name}": ${error.message}`);
    else console.log(`  ✅ Stakeholder "${sh.name}"`);
  }

  // ─── Features (user_settings) ─────────────────────────────────────────────

  if (Object.keys(data.features).length > 0) {
    console.log('\n🚩  Features encontradas no dump:');
    console.log('   As features serão inseridas em user_settings após o primeiro login.');
    console.log('   Features:', JSON.stringify(data.features));
    console.log('   (Inserção de user_settings requer o user_id do Supabase Auth)');
  }

  console.log('\n🎉  Migração concluída!');
  console.log('   Verifique os dados no Supabase Table Editor.');
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
