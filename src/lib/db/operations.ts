import { eq } from 'drizzle-orm';
import { getDB, persistDB } from './client';
import { trees, type NewTreeRecord, type TreeRecord } from './schema';
import type { Tree } from '../types/tree';

export async function createTree(tree: Omit<Tree, 'createdAt'>): Promise<Tree> {
  const db = getDB();

  const newTree: NewTreeRecord = {
    id: tree.id,
    name: tree.name,
    treeType: tree.treeType,
    structure: JSON.stringify(tree.structure),
    createdAt: new Date(),
  };

  await db.insert(trees).values(newTree);
  await persistDB();

  return {
    ...tree,
    createdAt: newTree.createdAt,
  };
}

export async function getTrees(): Promise<Tree[]> {
  const db = getDB();
  const results = await db.select().from(trees);

  return results.map(recordToTree);
}

export async function getTreeById(id: string): Promise<Tree | null> {
  const db = getDB();
  const results = await db.select().from(trees).where(eq(trees.id, id));

  if (results.length === 0) return null;

  return recordToTree(results[0]);
}

export async function deleteTree(id: string): Promise<void> {
  const db = getDB();
  await db.delete(trees).where(eq(trees.id, id));
  await persistDB();
}

function recordToTree(record: TreeRecord): Tree {
  return {
    id: record.id,
    name: record.name,
    treeType: record.treeType as 'medical' | 'motor',
    structure: JSON.parse(record.structure as string),
    createdAt: new Date(record.createdAt),
  };
}
