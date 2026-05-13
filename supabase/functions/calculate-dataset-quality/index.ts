import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { dataset_id } = await req.json();
    if (!dataset_id) {
      return new Response(
        JSON.stringify({ error: "dataset_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // First, get the dataset to determine its claim_category
    const { data: dataset, error: datasetError } = await supabase
      .from("datasets")
      .select("id, claim_category")
      .eq("id", dataset_id)
      .single();

    if (datasetError) {
      if (datasetError.code === "PGRST116") {
        return new Response(
          JSON.stringify({ error: "Dataset not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw datasetError;
    }

    const claimCategory = dataset.claim_category || "motor"; // Default to motor for backwards compatibility

    // Get dimensions filtered by claim_category
    const { data: allDimensions, error: dimensionsError } = await supabase
      .from("dimensions")
      .select("id, name, display_name, is_critical, claim_category")
      .eq("claim_category", claimCategory);

    if (dimensionsError) throw dimensionsError;

    // Get present columns for this dataset
    const { data: presentColumns, error: presenceError } = await supabase
      .from("dataset_column_presence")
      .select("dimension_id, dimensions(name, display_name, is_critical, claim_category)")
      .eq("dataset_id", dataset_id);

    if (presenceError) throw presenceError;

    // Filter present columns to only count those matching the claim_category
    // (in case there are any mismatched records from before this fix)
    const relevantPresentColumns = presentColumns.filter(
      (p) => p.dimensions?.claim_category === claimCategory
    );

    // Calculate metrics
    const totalDimensions = allDimensions.length;
    const presentDimensions = relevantPresentColumns.length;
    const completenessPercentage = totalDimensions > 0
      ? Math.round((presentDimensions / totalDimensions) * 100)
      : 0;

    // Get critical dimensions for this category
    const criticalDimensions = allDimensions.filter((d) => d.is_critical);
    const presentDimensionIds = new Set(
      relevantPresentColumns.map((p) => p.dimension_id)
    );
    const missingCriticalColumns = criticalDimensions
      .filter((d) => !presentDimensionIds.has(d.id))
      .map((d) => d.display_name);

    const criticalPresent = criticalDimensions.filter((d) =>
      presentDimensionIds.has(d.id)
    ).length;
    const criticalCompletenessPercentage =
      criticalDimensions.length > 0
        ? Math.round((criticalPresent / criticalDimensions.length) * 100)
        : 100;

    // Calculate quality score (weighted: 70% critical, 30% overall)
    const qualityScore = Math.round(
      criticalCompletenessPercentage * 0.7 + completenessPercentage * 0.3
    );

    const metrics = {
      dataset_id,
      claim_category: claimCategory,
      total_dimensions: totalDimensions,
      present_dimensions: presentDimensions,
      completeness_percentage: completenessPercentage,
      missing_critical_columns: missingCriticalColumns,
      critical_completeness_percentage: criticalCompletenessPercentage,
      quality_score: qualityScore,
    };

    return new Response(JSON.stringify(metrics), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error calculating quality metrics:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
