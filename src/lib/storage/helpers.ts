import { supabase } from '../db/supabase';

/**
 * Generate a signed URL for a file in Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in the bucket
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL for downloading the file
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error('No signed URL returned from Supabase');
  }

  return data.signedUrl;
}

/**
 * Generate signed URL for raw dataset file
 */
export async function getRawDatasetUrl(filePath: string): Promise<string> {
  return getSignedUrl('raw-datasets', filePath);
}

/**
 * Generate signed URL for aligned dataset file
 */
export async function getAlignedDatasetUrl(filePath: string): Promise<string> {
  return getSignedUrl('aligned-datasets', filePath);
}

/**
 * Download a file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in the bucket
 * @param bustCache - Add timestamp to force fresh download
 * @returns File blob
 */
export async function downloadFile(bucket: string, path: string, bustCache: boolean = false): Promise<Blob> {
  // Add cache buster to force fresh download if needed
  const downloadPath = bustCache ? `${path}?t=${Date.now()}` : path;

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(downloadPath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  if (!data) {
    throw new Error('No file data returned from Supabase');
  }

  return data;
}

/**
 * Download raw dataset file
 */
export async function downloadRawDataset(filePath: string, bustCache: boolean = false): Promise<Blob> {
  return downloadFile('raw-datasets', filePath, bustCache);
}

/**
 * Download aligned dataset file
 */
export async function downloadAlignedDataset(filePath: string, bustCache: boolean = false): Promise<Blob> {
  return downloadFile('aligned-datasets', filePath, bustCache);
}

function buildVersionedFilename(filename: string, suffix?: string): string {
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const finalFilename = suffix
    ? cleanFilename.replace(/(\.[^.]+)$/, `${suffix}$1`)
    : cleanFilename;
  return `${timestamp}_${finalFilename}`;
}

/**
 * Generate company-scoped storage path.
 * Format: {company_id}/{dataset_id}/{timestamp}_{filename}
 */
export function generateStoragePath(
  companyId: string,
  datasetId: number | string,
  filename: string,
  suffix?: string
): string {
  const versionedFilename = buildVersionedFilename(filename, suffix);
  return `${companyId}/${datasetId}/${versionedFilename}`;
}

/**
 * Generate temporary path before a dataset id exists.
 * Format: {company_id}/pending/{timestamp}_{filename}
 */
export function generatePendingStoragePath(
  companyId: string,
  filename: string,
  suffix?: string
): string {
  const versionedFilename = buildVersionedFilename(filename, suffix);
  return `${companyId}/pending/${versionedFilename}`;
}

/**
 * Trigger browser download of a blob
 * @param blob - File blob
 * @param filename - Desired filename for download
 */
export function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
