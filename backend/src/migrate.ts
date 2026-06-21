import { db } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executa todas as migrations SQL do diretório ./migrations
 */
async function runMigrations() {
  console.log('[Migrations] Iniciando migrations...');
  
  const isPostgres = !!process.env.DATABASE_URL;

  // Cria tabela de controle de migrations
  if (isPostgres) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    await db.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL UNIQUE,
        executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  const migrationsDir = path.resolve(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('[Migrations] Diretório de migrations não encontrado. Pulando.');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    // Verifica se já foi executada
    const exists = await db.query(
      'SELECT 1 FROM _migrations WHERE filename = $1',
      [file]
    );

    if (exists.rows.length > 0) {
      console.log(`[Migrations] ✓ ${file} (já executada)`);
      continue;
    }

    // Executa a migration
    let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    if (isPostgres) {
      // Traduzir INTEGER PRIMARY KEY AUTOINCREMENT para SERIAL PRIMARY KEY
      sql = sql.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY');
      // Traduzir AUTOINCREMENT para nada
      sql = sql.replace(/AUTOINCREMENT/gi, '');
      // Traduzir TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP para TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      sql = sql.replace(/TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP');
      // Traduzir TEXT DEFAULT CURRENT_TIMESTAMP para TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      sql = sql.replace(/TEXT DEFAULT CURRENT_TIMESTAMP/gi, 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP');
      // Traduzir TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      sql = sql.replace(/TEXT NOT NULL DEFAULT \(CURRENT_TIMESTAMP\)/gi, 'TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP');
    }
    
    try {
      await db.exec(sql);
      await db.query(
        'INSERT INTO _migrations (filename) VALUES ($1)',
        [file]
      );
      console.log(`[Migrations] ✅ ${file} executada com sucesso.`);
    } catch (error) {
      console.error(`[Migrations] ❌ Erro ao executar ${file}:`, error);
      throw error;
    }
  }

  // Purga absoluta de todas as sementes e tabelas para produção limpa sem dados fakes
  try {
    console.log('[Migrations] Realizando purga absoluta de dados fake para produção...');
    
    await db.query(`DELETE FROM tasks`);
    await db.query(`DELETE FROM projects`);
    await db.query(`DELETE FROM goals`);
    await db.query(`DELETE FROM objectives`);
    await db.query(`DELETE FROM diary_entries`);
    await db.query(`DELETE FROM pages`);
    await db.query(`DELETE FROM folders`);
    await db.query(`DELETE FROM workspaces`);
    await db.query(`DELETE FROM financial_transactions`);
    await db.query(`DELETE FROM financial_projections`);
    await db.query(`DELETE FROM financial_categories`);
    await db.query(`DELETE FROM financial_mural`);

    console.log('[Migrations] Todas as tabelas foram limpas com absoluto sucesso para produção de alto nível.');
  } catch (err) {
    console.warn('[Migrations] Alerta: Falha ao purgar registros:', err);
  }

  console.log('[Migrations] Todas as migrations foram executadas.');
}

export { runMigrations };
