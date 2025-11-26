import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Import shared modules
import { parseCSV, applyAlignment, generateCSV } from "../_shared/csv.ts";
import {
  callDataPreviewAPI,
  callN8nAlignment,
  callArabicCheckAPI,
} from "../_shared/external-apis.ts";
import {
  uploadToStorage,
  downloadFromStorage,
  deleteFromStorage,
  generateStoragePath,
} from "../_shared/storage.ts";
import {
  createUploadStatus,
  updateUploadStatus,
  createDatasetRecord,
  getDimensions,
  createColumnPresenceRecords,
  deleteDataset,
} from "../_shared/database.ts";
import type { ProcessState, DatasetMetadata } from "../_shared/types.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight
function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Validate request and return authenticated user
async function validateRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new Error("No authorization header");
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  return { user, authHeader };
}

// Parse and validate form data
function validateFormData(formData: FormData) {
  const file = formData.get("Claims_Data") as File;
  const insuranceCompany = formData.get("Insurance Company Name") as string;
  const email = formData.get("Email") as string;
  const country = formData.get("Country") as string;

  if (!file || !insuranceCompany || !country) {
    throw new Error(
      "Missing required fields: Claims_Data, Insurance Company Name, or Country"
    );
  }

  return { file, insuranceCompany, email, country };
}

// Cleanup resources on error
async function cleanupOnError(state: ProcessState): Promise<void> {
  console.log("Cleaning up resources after error...");

  // Delete uploaded files (best effort, don't throw)
  if (state.rawFilePath) {
    try {
      await deleteFromStorage("raw-datasets", state.rawFilePath);
      console.log(`Deleted raw file: ${state.rawFilePath}`);
    } catch (error) {
      console.error("Failed to delete raw file:", error.message);
    }
  }

  if (state.alignedFilePath) {
    try {
      await deleteFromStorage("aligned-datasets", state.alignedFilePath);
      console.log(`Deleted aligned file: ${state.alignedFilePath}`);
    } catch (error) {
      console.error("Failed to delete aligned file:", error.message);
    }
  }

  // Delete dataset record if created (cascade deletes presence records)
  if (state.datasetId) {
    try {
      await deleteDataset(state.datasetId);
      console.log(`Deleted dataset: ${state.datasetId}`);
    } catch (error) {
      console.error("Failed to delete dataset:", error.message);
    }
  }
}

// Main processing function
async function processDatasetUpload(
  file: File,
  metadata: DatasetMetadata,
  authHeader: string
) {
  const state: ProcessState = {
    uploadStatusId: null,
    rawFilePath: null,
    alignedFilePath: null,
    datasetId: null,
  };

  try {
    console.log("Step 1: Creating upload status...");
    state.uploadStatusId = await createUploadStatus(
      metadata.userId,
      "uploading",
      authHeader
    );
    console.log(`Upload status created: ${state.uploadStatusId}`);

    console.log("Step 2: Uploading raw file to storage...");
    const rawPath = generateStoragePath(metadata.userId, file.name);
    state.rawFilePath = await uploadToStorage(
      "raw-datasets",
      rawPath,
      file,
      file.type
    );
    console.log(`Raw file uploaded: ${state.rawFilePath}`);

    console.log("Step 3: Updating status to processing...");
    await updateUploadStatus(
      state.uploadStatusId,
      { status: "processing" },
      authHeader
    );

    console.log("Step 4: Calling DataPreview API...");
    const previewData = await callDataPreviewAPI(file);
    console.log(
      `Preview data received: ${previewData.shape.rows} rows, ${previewData.shape.columns} columns`
    );

    console.log("Step 5: Calling N8N for AI alignment...");
    const { alignment } = await callN8nAlignment(previewData);
    const matchedColumns = Object.values(alignment).filter(
      (v) => v && v.trim() !== ""
    ).length;
    console.log(
      `Alignment received: ${matchedColumns}/${Object.keys(alignment).length} columns matched`
    );

    console.log("Step 6: Transforming CSV data...");
    const rawBlob = await downloadFromStorage("raw-datasets", state.rawFilePath);
    const rawContent = await rawBlob.text();
    const parsed = await parseCSV(rawContent);
    const transformed = applyAlignment(parsed, alignment);
    const alignedCSV = await generateCSV(transformed);
    console.log(
      `CSV transformed: ${transformed.rows.length} rows, ${transformed.headers.length} aligned columns`
    );

    console.log("Step 7: Uploading aligned file to storage...");
    const alignedPath = generateStoragePath(metadata.userId, file.name, "_aligned");
    state.alignedFilePath = await uploadToStorage(
      "aligned-datasets",
      alignedPath,
      new Blob([alignedCSV], { type: "text/csv" }),
      "text/csv"
    );
    console.log(`Aligned file uploaded: ${state.alignedFilePath}`);

    console.log("Step 8: Calling ArabicCheck API...");
    const alignedBlob = await downloadFromStorage(
      "aligned-datasets",
      state.alignedFilePath
    );
    const alignedFile = new File([alignedBlob], file.name, {
      type: "text/csv",
    });
    const arabicColumns = await callArabicCheckAPI(alignedFile);
    console.log(`Arabic columns detected: ${arabicColumns}`);

    console.log("Step 9: Creating dataset record...");
    state.datasetId = await createDatasetRecord({
      insuranceCompany: metadata.insuranceCompany,
      country: metadata.country,
      fileName: file.name,
      rows: previewData.shape.rows,
      columns: previewData.shape.columns,
      arabicColumns,
      rawFilePath: state.rawFilePath,
      alignedFilePath: state.alignedFilePath,
      userId: metadata.userId,
      alignmentMapping: alignment,
    });
    console.log(`Dataset record created: ${state.datasetId}`);

    console.log("Step 10: Creating column presence records...");
    const dimensions = await getDimensions();
    await createColumnPresenceRecords(state.datasetId, alignment, dimensions);
    console.log(`Column presence records created`);

    console.log("Step 11: Updating status to uploaded...");
    await updateUploadStatus(
      state.uploadStatusId,
      {
        status: "uploaded",
        dataset_id: state.datasetId,
      },
      authHeader
    );

    console.log("Dataset upload completed successfully!");
    return {
      success: true,
      upload_status_id: state.uploadStatusId,
      dataset_id: state.datasetId,
      matched_columns: matchedColumns,
      total_columns: Object.keys(alignment).length,
      alignment,
    };
  } catch (error) {
    console.error("Error during dataset upload:", error);

    // Cleanup resources
    await cleanupOnError(state);

    // Update status to failed
    if (state.uploadStatusId) {
      try {
        await updateUploadStatus(
          state.uploadStatusId,
          {
            status: "failed",
            error_message: error.message,
          },
          authHeader
        );
      } catch (updateError) {
        console.error("Failed to update status to failed:", updateError);
      }
    }

    throw error;
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate request and authenticate user
    const { user, authHeader } = await validateRequest(req);

    // Parse and validate form data
    const formData = await req.formData();
    const { file, insuranceCompany, email, country } = validateFormData(formData);

    console.log(`Processing upload for user ${user.id}: ${file.name}`);

    // Process dataset upload
    const result = await processDatasetUpload(
      file,
      {
        insuranceCompany,
        country,
        email,
        userId: user.id,
      },
      authHeader
    );

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing dataset upload:", error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes("authorization")
          ? 401
          : error.message.includes("Missing required")
          ? 400
          : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
