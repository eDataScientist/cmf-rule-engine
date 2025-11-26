import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Import shared modules
import { parseCSV, applyAlignment, generateCSV } from "../_shared/csv.ts";
import {
  uploadToStorage,
  downloadFromStorage,
} from "../_shared/storage.ts";

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

  return { user, authHeader, supabase };
}

// Main regeneration function
async function regenerateAlignedDataset(
  datasetId: number,
  alignmentMapping: Record<string, string>,
  supabase: any
) {
  console.log(`Regenerating aligned dataset for dataset ${datasetId}`);

  // 1. Fetch dataset record to get file paths
  const { data: dataset, error: fetchError } = await supabase
    .from("datasets")
    .select("raw_file_path, aligned_file_path, file_name")
    .eq("id", datasetId)
    .single();

  if (fetchError || !dataset) {
    throw new Error(`Failed to fetch dataset: ${fetchError?.message}`);
  }

  if (!dataset.raw_file_path) {
    throw new Error("Dataset has no raw file");
  }

  console.log(`Downloading raw file: ${dataset.raw_file_path}`);

  // 2. Download raw CSV from storage
  const rawBlob = await downloadFromStorage("raw-datasets", dataset.raw_file_path);
  const rawContent = await rawBlob.text();

  console.log(`Parsing CSV...`);

  // 3. Parse CSV
  const parsed = await parseCSV(rawContent);

  console.log(`Raw CSV headers:`, parsed.headers);
  console.log(`Alignment mapping:`, JSON.stringify(alignmentMapping, null, 2));

  console.log(`Applying new alignment mapping...`);

  // 4. Apply new alignment
  const transformed = applyAlignment(parsed, alignmentMapping);

  console.log(`Aligned headers:`, transformed.headers);
  console.log(`Original header count: ${parsed.headers.length}, Aligned header count: ${transformed.headers.length}`);

  console.log(`Generating aligned CSV...`);

  // 5. Generate aligned CSV
  const alignedCSV = await generateCSV(transformed);

  console.log(`Uploading new aligned file to storage...`);

  // 6. Upload to storage (overwrites existing file)
  const alignedPath = dataset.aligned_file_path;
  if (!alignedPath) {
    throw new Error("Dataset has no aligned file path");
  }

  await uploadToStorage(
    "aligned-datasets",
    alignedPath,
    new Blob([alignedCSV], { type: "text/csv" }),
    "text/csv"
  );

  console.log(`Aligned dataset regenerated successfully!`);

  return {
    success: true,
    rows: transformed.rows.length,
    columns: transformed.headers.length,
  };
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate request and authenticate user
    const { supabase } = await validateRequest(req);

    // Parse request body
    const { dataset_id, alignment_mapping } = await req.json();

    if (!dataset_id || !alignment_mapping) {
      throw new Error("Missing required fields: dataset_id or alignment_mapping");
    }

    console.log(`Processing regeneration for dataset ${dataset_id}`);

    // Regenerate aligned dataset
    const result = await regenerateAlignedDataset(
      dataset_id,
      alignment_mapping,
      supabase
    );

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error regenerating aligned dataset:", error);

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
