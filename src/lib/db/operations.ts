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

// Dataset Operations

export interface Dataset {
  id: number;
  insuranceCompany: string;
  country: string;
  fileName: string | null;
  nickname: string | null;
  datePeriod: string | null;
  rows: number;
  columns: number;
  arabicColumns: number | null;
  rawFilePath: string | null;
  alignedFilePath: string | null;
  uploadedAt: string | null;
  createdAt: string;
  userId: string | null;
  alignmentMapping: Record<string, string> | null;
}

export interface DatasetWithStatus extends Dataset {
  uploadStatus: {
    id: string;
    status: 'uploading' | 'processing' | 'uploaded' | 'failed';
    errorMessage: string | null;
    updatedAt: string;
  } | null;
}

export async function getDatasets(): Promise<DatasetWithStatus[]> {
  const { data, error } = await supabase
    .from('datasets')
    .select(`
      *,
      dataset_upload_status (
        id,
        status,
        error_message,
        updated_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch datasets: ${error.message}`);
  }

  return (data as any[]).map(rowToDatasetWithStatus);
}

export async function getDataset(id: number): Promise<DatasetWithStatus | null> {
  const { data, error } = await supabase
    .from('datasets')
    .select(`
      *,
      dataset_upload_status (
        id,
        status,
        error_message,
        updated_at
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch dataset: ${error.message}`);
  }

  return rowToDatasetWithStatus(data as any);
}

export async function deleteDataset(id: number): Promise<void> {
  // Get dataset to retrieve file paths
  const dataset = await getDataset(id);
  if (!dataset) {
    throw new Error('Dataset not found');
  }

  // Delete files from storage if they exist
  if (dataset.rawFilePath) {
    await supabase.storage
      .from('raw-datasets')
      .remove([dataset.rawFilePath]);
  }

  if (dataset.alignedFilePath) {
    await supabase.storage
      .from('aligned-datasets')
      .remove([dataset.alignedFilePath]);
  }

  // Delete dataset record (cascade will delete related records)
  const { error } = await supabase
    .from('datasets')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete dataset: ${error.message}`);
  }
}

export async function getDatasetUploadStatus(datasetId: number) {
  const { data, error } = await supabase
    .from('dataset_upload_status')
    .select('*')
    .eq('dataset_id', datasetId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch upload status: ${error.message}`);
  }

  return data;
}

function rowToDatasetWithStatus(row: any): DatasetWithStatus {
  // Get the most recent upload status if it exists
  const uploadStatusArray = row.dataset_upload_status;
  const uploadStatus = Array.isArray(uploadStatusArray) && uploadStatusArray.length > 0
    ? {
        id: uploadStatusArray[0].id,
        status: uploadStatusArray[0].status,
        errorMessage: uploadStatusArray[0].error_message,
        updatedAt: uploadStatusArray[0].updated_at,
      }
    : null;

  return {
    id: row.id,
    insuranceCompany: row.insurance_company,
    country: row.country,
    fileName: row.file_name,
    nickname: row.nickname,
    datePeriod: row.date_period,
    rows: row.rows,
    columns: row.columns,
    arabicColumns: row.arabic_columns,
    rawFilePath: row.raw_file_path,
    alignedFilePath: row.aligned_file_path,
    uploadedAt: row.uploaded_at,
    createdAt: row.created_at,
    userId: row.user_id,
    alignmentMapping: row.alignment_mapping,
    uploadStatus,
  };
}

export interface DimensionMapping {
  dimensionId: number;
  dimensionName: string;
  displayName: string;
  category: string;
  dataType: string;
  isCritical: boolean;
}

export async function getDatasetColumnMappings(datasetId: number): Promise<DimensionMapping[]> {
  const { data, error } = await supabase
    .from('dataset_column_presence')
    .select(`
      dimension_id,
      dimensions (
        id,
        name,
        display_name,
        category,
        data_type,
        is_critical
      )
    `)
    .eq('dataset_id', datasetId);

  if (error) {
    throw new Error(`Failed to fetch column mappings: ${error.message}`);
  }

  return (data as any[]).map((row) => ({
    dimensionId: row.dimensions.id,
    dimensionName: row.dimensions.name,
    displayName: row.dimensions.display_name,
    category: row.dimensions.category,
    dataType: row.dimensions.data_type,
    isCritical: row.dimensions.is_critical ?? false,
  }));
}

export interface TreeAssociation {
  id: string;
  treeId: string;
  treeName: string;
  treeType: TreeType;
  evaluatedAt: string;
  results: any;
  metadata: any;
}

export async function getDatasetTreeAssociations(datasetId: number): Promise<TreeAssociation[]> {
  const { data, error } = await supabase
    .from('dataset_tree_associations')
    .select(`
      id,
      tree_id,
      evaluated_at,
      results_jsonb,
      metadata,
      trees (
        id,
        name,
        tree_type
      )
    `)
    .eq('dataset_id', datasetId)
    .order('evaluated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch tree associations: ${error.message}`);
  }

  return (data as any[]).map((row) => ({
    id: row.id,
    treeId: row.tree_id,
    treeName: row.trees.name,
    treeType: row.trees.tree_type as TreeType,
    evaluatedAt: row.evaluated_at,
    results: row.results_jsonb,
    metadata: row.metadata,
  }));
}

export interface CreateTreeAssociationParams {
  datasetId: number;
  treeId: string;
  resultsJsonb: any;
  metadata?: any;
}

export async function createTreeAssociation(params: CreateTreeAssociationParams): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { data, error } = await supabase
    .from('dataset_tree_associations')
    .insert({
      dataset_id: params.datasetId,
      tree_id: params.treeId,
      results_jsonb: params.resultsJsonb,
      metadata: params.metadata || null,
      user_id: user.id,
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create tree association: ${error.message}`);
  }

  return data.id;
}

// Dimension Operations

export interface Dimension {
  id: number;
  name: string;
  displayName: string;
  category: string;
  dataType: string;
  isCritical: boolean;
}

export async function getAllDimensions(): Promise<Dimension[]> {
  const { data, error } = await supabase
    .from('dimensions')
    .select('id, name, display_name, category, data_type, is_critical')
    .order('display_name', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch dimensions: ${error.message}`);
  }

  return (data as any[]).map((row) => ({
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    category: row.category,
    dataType: row.data_type,
    isCritical: row.is_critical ?? false,
  }));
}

export async function updateDatasetAlignment(
  datasetId: number,
  alignmentMapping: Record<string, string>
): Promise<void> {
  const { error } = await supabase
    .from('datasets')
    .update({ alignment_mapping: alignmentMapping })
    .eq('id', datasetId);

  if (error) {
    throw new Error(`Failed to update alignment mapping: ${error.message}`);
  }
}
