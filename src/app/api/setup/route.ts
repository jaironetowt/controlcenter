// ─── GET /api/setup ────────────────────────────────────────────────────────────
// Verifica se as tabelas do banco de dados existem no Supabase.
// Retorna status de cada tabela e o SQL de criação caso precise rodar no
// SQL Editor do Supabase Dashboard.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const TABLES = ['projects', 'risks', 'action_items', 'decisions', 'stakeholders', 'user_settings'];

export async function GET(): Promise<Response> {
  const supabaseUrl    = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no .env.local.' },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Verifica existência de cada tabela tentando fazer um SELECT limitado
  const tableStatus: Record<string, boolean> = {};
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    // Se a tabela não existe, o error.code será '42P01' (undefined_table)
    tableStatus[table] = !error || error.code !== '42P01';
  }

  const allTablesExist = Object.values(tableStatus).every(Boolean);

  // Ler o SQL de migração para exibir ao usuário se precisar criar tabelas
  let migrationSql = '';
  try {
    const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '001_initial.sql');
    migrationSql = fs.readFileSync(sqlPath, 'utf-8');
  } catch {
    migrationSql = '-- Arquivo supabase/migrations/001_initial.sql não encontrado';
  }

  return Response.json({
    ok: allTablesExist,
    tables: tableStatus,
    allTablesExist,
    migrationSql: allTablesExist ? null : migrationSql,
    message: allTablesExist
      ? 'Todas as tabelas existem. Banco de dados pronto.'
      : 'Algumas tabelas ainda não existem. Execute o SQL no Supabase SQL Editor.',
  });
}
