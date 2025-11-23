import { supabase } from './supabase';
import type { Tree, TreeType } from '../types/tree';

export async function createTree(tree: Omit<Tree, 'createdAt'>): Promise<Tree> {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated to create trees');
  }

  const { data, error } = await supabase
    .from('trees')
    .insert({
      id: tree.id,
      name: tree.name,
      tree_type: tree.treeType,
      structure: tree.structure as any,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tree: ${error.message}`);
  }

  return rowToTree(data as any);
}

export async function getTrees(): Promise<Tree[]> {
  const { data, error } = await supabase
    .from('trees')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch trees: ${error.message}`);
  }

  return (data as any[]).map(rowToTree);
}

export async function getTreeById(id: string): Promise<Tree | null> {
  const { data, error } = await supabase
    .from('trees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to fetch tree: ${error.message}`);
  }

  return rowToTree(data as any);
}

export async function deleteTree(id: string): Promise<void> {
  const { error } = await supabase
    .from('trees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete tree: ${error.message}`);
  }
}

function rowToTree(row: any): Tree {
  return {
    id: row.id,
    name: row.name,
    treeType: row.tree_type as TreeType,
    structure: row.structure as Tree['structure'],
    createdAt: new Date(row.created_at),
  };
}
