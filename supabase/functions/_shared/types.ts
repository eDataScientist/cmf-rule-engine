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
}

// DataPreview API response
export interface DataPreviewResponse {
  shape: {
    rows: number;
    columns: number;
  };
  column_names: string[];
  sample: Record<string, any>[];
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
  alignmentMapping: Record<string, string>; // Original column name -> Dimension name
}

// Upload status update parameters
export interface UploadStatusUpdate {
  status?: 'uploading' | 'processing' | 'uploaded' | 'failed';
  dataset_id?: number;
  error_message?: string;
}

// Dimension structure
export interface Dimension {
  id: number;
  name: string;
}
