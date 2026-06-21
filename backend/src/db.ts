import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import pg from 'pg';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração opcional do pool de conexão PostgreSQL (usado em produção/Hostinger)
let pgPool: pg.Pool | null = null;
if (config.databaseUrl) {
  pgPool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: false }
  });
  console.log('[PostgreSQL] Conexão configurada com sucesso para produção.');
}

// Garantir que a pasta data existe
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'database.sqlite');

let dbInstance: Database<sqlite3.Database, sqlite3.Statement> | null = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('[SQLite] Conexão com o banco estabelecida com sucesso.');
    
    // Habilitar Foreign Keys no SQLite
    await dbInstance.run('PRAGMA foreign_keys = ON');
  }
  return dbInstance;
}

// Inicializar apenas se o Postgres não estiver ativo
if (!pgPool) {
  getDb().catch(err => console.error('[SQLite] Erro ao abrir o banco:', err));
}

export const db = {
  async query(text: string, params: any[] = []) {
    const start = Date.now();
    try {
      // 1. Caso esteja rodando em Produção (PostgreSQL configurado)
      if (pgPool) {
        const res = await pgPool.query(text, params);
        const duration = Date.now() - start;
        console.log('[PostgreSQL Query]', { text, duration: `${duration}ms`, rows: res.rowCount });
        return { rows: res.rows, rowCount: res.rowCount ?? 0 };
      }

      // 2. Caso esteja rodando em Desenvolvimento (SQLite Fallback)
      const database = await getDb();
      
      // Traduzir sintaxe do Postgres ($1, $2) para SQLite (?)
      let sqliteQuery = text.replace(/\$\d+/g, '?');
      
      const isSelect = sqliteQuery.trim().toUpperCase().startsWith('SELECT');
      const hasReturning = sqliteQuery.toUpperCase().includes('RETURNING');
      
      let res;
      if (isSelect || hasReturning) {
        const rows = await database.all(sqliteQuery, params);
        res = { rows, rowCount: rows.length };
      } else {
        const result = await database.run(sqliteQuery, params);
        res = { rows: [], rowCount: result.changes ?? 0 };
      }
      
      const duration = Date.now() - start;
      console.log('[Database Query]', { text: sqliteQuery, duration: `${duration}ms`, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('[Database Query Error]', { text, error });
      throw error;
    }
  },
  
  async getClient() {
    if (pgPool) {
      const client = await pgPool.connect();
      return {
        query: client.query.bind(client),
        release: client.release.bind(client)
      };
    }

    const database = await getDb();
    return {
      query: this.query.bind(this),
      release: () => { /* no-op para sqlite simplificado */ }
    };
  },

  async exec(sql: string) {
    if (pgPool) {
      const client = await pgPool.connect();
      try {
        await client.query(sql);
      } finally {
        client.release();
      }
      return;
    }

    const database = await getDb();
    return await database.exec(sql);
  }
};

