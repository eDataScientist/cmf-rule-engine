import initSqlJs, { type Database } from 'sql.js';
import { drizzle, type DrizzleSqliteWasmDatabase } from 'drizzle-orm/sql-js';
import * as schema from './schema';
import { loadDatabase, saveDatabase } from './persistence';

let db: DrizzleSqliteWasmDatabase<typeof schema> | null = null;
let sqliteDb: Database | null = null;

export async function initDB(): Promise<DrizzleSqliteWasmDatabase<typeof schema>> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file) => `https://sql.js.org/dist/${file}`,
  });

  const savedData = await loadDatabase();

  if (savedData) {
    sqliteDb = new SQL.Database(savedData);
  } else {
    sqliteDb = new SQL.Database();
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS trees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        tree_type TEXT NOT NULL CHECK(tree_type IN ('medical', 'motor')),
        structure TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }

  db = drizzle(sqliteDb, { schema });

  return db;
}

export async function persistDB(): Promise<void> {
  if (!sqliteDb) return;
  const data = sqliteDb.export();
  await saveDatabase(data);
}

export function getDB(): DrizzleSqliteWasmDatabase<typeof schema> {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
}

export { db, sqliteDb };
