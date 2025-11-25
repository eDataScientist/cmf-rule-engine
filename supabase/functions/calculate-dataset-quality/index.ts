import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

interface QualityMetrics {
  dataset_id: number;
  total_dimensions: number;
  present_dimensions: number;
  completeness_percentage: number;
  missing_critical_columns: string[];
  critical_completeness_percentage: number;
  quality_score: number;
}

Deno.serve(async (req: Request) => {
  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
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
          headers: { "Content-Type": "application/json" },
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

    // Get all dimensions (master schema)
    const { data: allDimensions, error: dimensionsError } = await supabase
      .from("dimensions")
      .select("id, name, display_name, is_critical");

    if (dimensionsError) throw dimensionsError;

    // Get present columns for this dataset
    const { data: presentColumns, error: presenceError } = await supabase
      .from("dataset_column_presence")
      .select("dimension_id, dimensions(name, display_name, is_critical)")
      .eq("dataset_id", dataset_id);

    if (presenceError) throw presenceError;

    // Calculate metrics
    const totalDimensions = allDimensions.length;
    const presentDimensions = presentColumns.length;
    const completenessPercentage = Math.round(
      (presentDimensions / totalDimensions) * 100
    );

    // Get critical dimensions
    const criticalDimensions = allDimensions.filter((d) => d.is_critical);
    const presentDimensionIds = new Set(
      presentColumns.map((p) => p.dimension_id)
    );

    const missingCriticalColumns = criticalDimensions
      .filter((d) => !presentDimensionIds.has(d.id))
      .map((d) => d.display_name);

    const criticalPresent = criticalDimensions.filter((d) =>
      presentDimensionIds.has(d.id)
    ).length;
    const criticalCompletenessPercentage = criticalDimensions.length > 0
      ? Math.round((criticalPresent / criticalDimensions.length) * 100)
      : 100;

    // Calculate quality score (weighted: 70% critical, 30% overall)
    const qualityScore = Math.round(
      criticalCompletenessPercentage * 0.7 + completenessPercentage * 0.3
    );

    const metrics: QualityMetrics = {
      dataset_id,
      total_dimensions: totalDimensions,
      present_dimensions: presentDimensions,
      completeness_percentage: completenessPercentage,
      missing_critical_columns: missingCriticalColumns,
      critical_completeness_percentage: criticalCompletenessPercentage,
      quality_score: qualityScore,
    };

    return new Response(JSON.stringify(metrics), {
      headers: {
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
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
