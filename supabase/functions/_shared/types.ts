// Shared TypeScript interfaces for Edge Functions

// Process State for tracking cleanup
export interface ProcessState {
  uploadStatusId: string | null;
  rawFilePath: string | null;
  alignedFilePath: string | null;
  datasetId: number | null;
}

// Dataset metadata from form
export interface DatasetMetadata {
  insuranceCompany: string;
  country: string;
  email: string;
  userId: string;
  companyId: string;
  claimCategory: ClaimCategory;
  granularity: DatasetGranularity;
}

// DataPreview API response
export interface DataPreviewResponse {
  shape: {
    rows: number;
    columns: number;
  };
  column_names: string[];
  sample: Record<string, unknown>[];
}

// N8N alignment response
export interface N8nAlignmentResponse {
  alignment: Record<string, string>;
}

// ArabicCheck API response
export interface ArabicCheckResponse {
  data: {
    columns_with_arabic: number;
  };
}

// CSV data structure
export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

// Dataset creation parameters
export interface CreateDatasetParams {
  insuranceCompany: string;
  country: string;
  fileName: string;
  rows: number;
  columns: number;
  arabicColumns: number;
  rawFilePath: string;
  alignedFilePath: string;
  userId: string;
  companyId: string;
  alignmentMapping: Record<string, string>; // Original column name -> Dimension name
  claimCategory: ClaimCategory;
  granularity: DatasetGranularity;
}

// Upload status update parameters
export interface UploadStatusUpdate {
  status?: 'uploading' | 'processing' | 'uploaded' | 'failed';
  dataset_id?: number;
  error_message?: string;
}

// Claim category type
export type ClaimCategory = 'medical' | 'motor';

// Dataset granularity type
export type DatasetGranularity = 'claim' | 'invoice' | 'item';

// Dimension structure
export interface Dimension {
  id: number;
  name: string;
  claim_category: ClaimCategory;
}

// Dimension with full details for AI alignment
export interface DimensionWithDetails {
  id: number;
  name: string;
  display_name: string;
  category: string;
  data_type: string;
  is_critical: boolean;
  description: string;
  claim_category: ClaimCategory;
}

// AI Alignment request payload
export interface AIAlignmentRequest {
  preview_data: DataPreviewResponse;
  claim_category: ClaimCategory;
}

// AI Alignment response (same as N8N for compatibility)
export interface AIAlignmentResponse {
  alignment: Record<string, string>;
}
