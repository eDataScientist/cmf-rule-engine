import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Create Supabase client for storage operations
 */
function getStorageClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Generate unique storage path with timestamp
 * @param userId - User ID for isolation
 * @param filename - Original filename
 * @param suffix - Optional suffix (e.g., '_aligned')
 * @returns Unique storage path: {userId}/{timestamp}_{filename}{suffix}
 */
export function generateStoragePath(
  userId: string,
  filename: string,
  suffix?: string
): string {
  const timestamp = Date.now();
  const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const finalFilename = suffix
    ? cleanFilename.replace(/(\.[^.]+)$/, `${suffix}$1`)
    : cleanFilename;

  return `${userId}/${timestamp}_${finalFilename}`;
}

/**
 * Upload file to Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param file - File or Blob to upload
 * @param contentType - MIME type of the file
 * @returns Uploaded file path
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File | Blob,
  contentType: string
): Promise<string> {
  const supabase = getStorageClient();

  // Convert File/Blob to ArrayBuffer for upload
  const arrayBuffer = await file.arrayBuffer();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, arrayBuffer, {
      contentType,
      upsert: true, // Overwrite if exists (for retries)
    });

  if (error) {
    throw new Error(`Failed to upload to storage: ${error.message}`);
  }

  if (!data?.path) {
    throw new Error("No path returned from storage upload");
  }

  return data.path;
}

/**
 * Download file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @returns File blob
 */
export async function downloadFromStorage(
  bucket: string,
  path: string
): Promise<Blob> {
  const supabase = getStorageClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    throw new Error(`Failed to download from storage: ${error.message}`);
  }

  if (!data) {
    throw new Error("No data returned from storage download");
  }

  return data;
}

/**
 * Delete file from Supabase Storage
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = getStorageClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Failed to delete from storage: ${error.message}`);
  }
}
