#!/usr/bin/env node
/**
 * create-tables.ts
 *
 * Cria as tabelas do Control Center no Supabase via Management API.
 *
 * Requer um Supabase Access Token pessoal (diferente da anon/service key).
 * Obtenha em: https://app.supabase.com/account/tokens
 *
 * Uso:
 *   SUPABASE_ACCESS_TOKEN=sbp_xxxx npx tsx scripts/create-tables.ts
 *
 * Ou adicione SUPABASE_ACCESS_TOKEN no .env.local e rode:
 *   npx tsx scripts/create-tables.ts
 */

import fs from 'fs';
import path from 'path';

// ─── Carregar .env.local ───────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
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

const PROJECT_REF = 'ffonrcyyjrexlpeapxwm';
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
  console.error('');
  console.error('❌  SUPABASE_ACCESS_TOKEN não encontrado.');
  console.error('');
  console.error('   Para criar as tabelas, você precisa de um Access Token pessoal do Supabase.');
  console.error('   Obtenha em: https://app.supabase.com/account/tokens');
  console.error('');
  console.error('   Depois rode:');
  console.error('   SUPABASE_ACCESS_TOKEN=sbp_xxxx npx tsx scripts/create-tables.ts');
  console.error('');
  console.error('   ─── ALTERNATIVA MAIS RÁPIDA ───────────────────────────────────────');
  console.error('   Acesse o Supabase Dashboard → SQL Editor e cole o conteúdo de:');
  console.error('   supabase/migrations/001_initial.sql');
  console.error('   Link direto: https://app.supabase.com/project/ffonrcyyjrexlpeapxwm/sql/new');
  console.error('');
  process.exit(1);
}

// ─── Ler o SQL de migração ────────────────────────────────────────────────────
const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/001_initial.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

// ─── Executar via Management API ──────────────────────────────────────────────
async function main() {
  console.log('\nCriando tabelas no Supabase via Management API...');
  console.log(`Projeto: ${PROJECT_REF}\n`);

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    const data = await res.json();
    console.log('Tabelas criadas com sucesso!');
    console.log('Resultado:', JSON.stringify(data, null, 2));
    return;
  }

  const errText = await res.text();
  console.error(`Erro ${res.status}: ${errText}`);

  if (res.status === 401) {
    console.error('\n   Token inválido ou expirado.');
    console.error('   Gere um novo em: https://app.supabase.com/account/tokens');
  } else if (res.status === 403) {
    console.error('\n   Sem permissão. Certifique-se de que o token tem acesso ao projeto.');
  }

  process.exit(1);
}

main().catch((err) => {
  console.error('Erro inesperado:', err);
  process.exit(1);
});
