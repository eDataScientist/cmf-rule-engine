import { createClient } from "jsr:@supabase/supabase-js@2";
import type {
  CreateDatasetParams,
  UploadStatusUpdate,
  Dimension,
} from "./types.ts";

/**
 * Create Supabase client with service role (bypasses RLS)
 */
function getServiceRoleClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Create Supabase client with user auth (respects RLS)
 */
function getUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase credentials");
  }

  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });
}

/**
 * Create upload status record
 * @param userId - User ID
 * @param status - Initial status
 * @param authHeader - Authorization header for RLS
 * @returns Upload status ID
 */
export async function createUploadStatus(
  userId: string,
  status: string,
  authHeader: string
): Promise<string> {
  const supabase = getUserClient(authHeader);

  const { data, error } = await supabase
    .from("dataset_upload_status")
    .insert({
      user_id: userId,
      status,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create upload status: ${error.message}`);
  }

  return data.id;
}

/**
 * Update upload status record
 * @param uploadStatusId - Upload status ID
 * @param update - Status update fields
 * @param authHeader - Authorization header for RLS
 */
export async function updateUploadStatus(
  uploadStatusId: string,
  update: UploadStatusUpdate,
  authHeader: string
): Promise<void> {
  const supabase = getUserClient(authHeader);

  const { error } = await supabase
    .from("dataset_upload_status")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", uploadStatusId);

  if (error) {
    throw new Error(`Failed to update upload status: ${error.message}`);
  }
}

/**
 * Create dataset record
 * @param params - Dataset creation parameters
 * @returns Dataset ID
 */
export async function createDatasetRecord(
  params: CreateDatasetParams
): Promise<number> {
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("datasets")
    .insert({
      insurance_company: params.insuranceCompany,
      country: params.country,
      file_name: params.fileName,
      rows: params.rows,
      columns: params.columns,
      arabic_columns: params.arabicColumns,
      raw_file_path: params.rawFilePath,
      aligned_file_path: params.alignedFilePath,
      raw_web_url: params.rawFilePath, // Storage key
      aligned_web_url: params.alignedFilePath, // Storage key
      user_id: params.userId,
      uploaded_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create dataset: ${error.message}`);
  }

  return data.id;
}

/**
 * Get all dimensions (cached in memory for performance)
 * @returns Map of dimension name (lowercase) to dimension ID
 */
let dimensionsCache: Map<string, number> | null = null;

export async function getDimensions(): Promise<Map<string, number>> {
  // Return cached dimensions if available
  if (dimensionsCache) {
    return dimensionsCache;
  }

  const supabase = getServiceRoleClient();

  const { data, error } = await supabase
    .from("dimensions")
    .select("id, name");

  if (error) {
    throw new Error(`Failed to fetch dimensions: ${error.message}`);
  }

  // Create map of lowercase dimension names to IDs
  dimensionsCache = new Map(
    (data as Dimension[]).map((d) => [d.name.toLowerCase(), d.id])
  );

  return dimensionsCache;
}

/**
 * Create column presence records for matched dimensions
 * @param datasetId - Dataset ID
 * @param alignment - Alignment mapping (original -> matched dimension)
 * @param dimensionMap - Map of dimension names to IDs
 */
export async function createColumnPresenceRecords(
  datasetId: number,
  alignment: Record<string, string>,
  dimensionMap: Map<string, number>
): Promise<void> {
  const supabase = getServiceRoleClient();

  // Collect unique dimension IDs from alignment
  const uniqueDimensionIds = new Set<number>();

  Object.entries(alignment).forEach(([_originalColumn, matchedDimension]) => {
    // Skip unmapped columns
    if (!matchedDimension || matchedDimension.trim() === "") {
      return;
    }

    // Find dimension ID (case-insensitive)
    const dimensionId = dimensionMap.get(matchedDimension.toLowerCase());

    if (!dimensionId) {
      console.warn(`Dimension not found for: ${matchedDimension}`);
      return;
    }

    uniqueDimensionIds.add(dimensionId);
  });

  // Create presence records from unique dimension IDs
  const presenceRecords = Array.from(uniqueDimensionIds).map((dimensionId) => ({
    dataset_id: datasetId,
    dimension_id: dimensionId,
  }));

  // Insert presence records if any exist
  if (presenceRecords.length > 0) {
    const { error } = await supabase
      .from("dataset_column_presence")
      .insert(presenceRecords);

    if (error) {
      throw new Error(`Failed to create column presence records: ${error.message}`);
    }
  }
}

/**
 * Delete dataset and related records (for cleanup on failure)
 * @param datasetId - Dataset ID to delete
 */
export async function deleteDataset(datasetId: number): Promise<void> {
  const supabase = getServiceRoleClient();

  const { error } = await supabase
    .from("datasets")
    .delete()
    .eq("id", datasetId);

  if (error) {
    throw new Error(`Failed to delete dataset: ${error.message}`);
  }
}
