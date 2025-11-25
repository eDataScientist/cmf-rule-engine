import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const N8N_WEBHOOK_URL = "https://aiagentsedata.app.n8n.cloud/webhook/claims/dataset";

interface N8nResponse {
  dataset_id: number;
  alignment: Array<{
    original_column: string;
    matched_dimension: string | null;
    confidence?: number;
  }>;
}

interface UploadContext {
  uploadStatusId: string | null;
  userId: string;
  supabase: any;
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle CORS preflight requests
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

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  return { user, supabase };
}

// Parse and validate form data
function validateFormData(formData: FormData) {
  const file = formData.get("Claims_Data") as File;
  const insuranceCompany = formData.get("Insurance Company Name") as string;
  const email = formData.get("Email") as string;
  const country = formData.get("Country") as string;

  if (!file || !insuranceCompany || !country) {
    throw new Error("Missing required fields: Claims_Data, Insurance Company Name, or Country");
  }

  return { file, insuranceCompany, email, country };
}

// Create initial upload status record
async function createUploadStatus(supabase: any, userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("dataset_upload_status")
    .insert({
      user_id: userId,
      status: "uploading",
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

// Update status to processing
async function updateStatusToProcessing(supabase: any, uploadStatusId: string) {
  await supabase
    .from("dataset_upload_status")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", uploadStatusId);
}

// Forward request to n8n webhook
async function forwardToN8n(
  file: File,
  insuranceCompany: string,
  email: string,
  country: string,
  userId: string
): Promise<N8nResponse> {
  const n8nFormData = new FormData();
  n8nFormData.append("Claims_Data", file);
  n8nFormData.append("Insurance Company Name", insuranceCompany);
  n8nFormData.append("Email", email);
  n8nFormData.append("Country", country);
  n8nFormData.append("user_id", userId);

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    body: n8nFormData,
  });

  if (!response.ok) {
    throw new Error(`n8n webhook failed: ${response.statusText}`);
  }

  const data: N8nResponse = await response.json();

  if (!data.dataset_id || !data.alignment) {
    throw new Error("Invalid response from n8n: missing dataset_id or alignment");
  }

  return data;
}

// Process alignment data and create column presence records
async function processAlignment(supabase: any, n8nData: N8nResponse) {
  // Fetch all dimensions
  const { data: dimensions, error: dimensionsError } = await supabase
    .from("dimensions")
    .select("id, name");

  if (dimensionsError) throw dimensionsError;

  // Create dimension map
  const dimensionMap = new Map(
    dimensions.map((d: any) => [d.name.toLowerCase(), d.id])
  );

  // Map alignment to dimension IDs
  const matchedDimensions = n8nData.alignment
    .filter((item) => item.matched_dimension !== null)
    .map((item) => {
      const dimensionId = dimensionMap.get(item.matched_dimension!.toLowerCase());
      if (!dimensionId) {
        console.warn(`Dimension not found: ${item.matched_dimension}`);
        return null;
      }
      return {
        dataset_id: n8nData.dataset_id,
        dimension_id: dimensionId,
      };
    })
    .filter((item) => item !== null);

  // Insert column presence records
  if (matchedDimensions.length > 0) {
    const { error: presenceError } = await supabase
      .from("dataset_column_presence")
      .insert(matchedDimensions);

    if (presenceError) throw presenceError;
  }

  return matchedDimensions;
}

// Update upload status to success
async function updateUploadSuccess(
  supabase: any,
  uploadStatusId: string,
  datasetId: number
) {
  await supabase
    .from("dataset_upload_status")
    .update({
      status: "uploaded",
      dataset_id: datasetId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", uploadStatusId);
}

// Update upload status to failed
async function updateUploadFailure(uploadStatusId: string, errorMessage: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  await supabase
    .from("dataset_upload_status")
    .update({
      status: "failed",
      error_message: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", uploadStatusId);
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  let uploadStatusId: string | null = null;

  try {
    // Validate request and authenticate user
    const { user, supabase } = await validateRequest(req);

    // Parse and validate form data
    const formData = await req.formData();
    const { file, insuranceCompany, email, country } = validateFormData(formData);

    // Create upload status
    uploadStatusId = await createUploadStatus(supabase, user.id);

    // Update to processing
    await updateStatusToProcessing(supabase, uploadStatusId);

    // Forward to n8n
    const n8nData = await forwardToN8n(file, insuranceCompany, email, country, user.id);

    // Process alignment and create presence records
    const matchedDimensions = await processAlignment(supabase, n8nData);

    // Update to success
    await updateUploadSuccess(supabase, uploadStatusId, n8nData.dataset_id);

    return new Response(
      JSON.stringify({
        success: true,
        upload_status_id: uploadStatusId,
        dataset_id: n8nData.dataset_id,
        matched_columns: matchedDimensions.length,
        total_columns: n8nData.alignment.length,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
      }
    );
  } catch (error) {
    console.error("Error processing dataset upload:", error);

    // Update status to failed
    if (uploadStatusId) {
      await updateUploadFailure(uploadStatusId, error.message);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes("authorization") ? 401 :
               error.message.includes("Missing required") ? 400 : 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
