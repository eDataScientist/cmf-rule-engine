import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Response type
interface DatasetDimension {
  id: number;
  name: string;
  displayName: string;
  dataType: string;
  category: string;
  isCritical: boolean;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  return null;
}

async function validateRequest(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) throw new Error("No authorization header");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("User not authenticated");

  return { user, supabase };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { supabase } = await validateRequest(req);
    const { dataset_id }: { dataset_id: number } = await req.json();

    if (!dataset_id) {
      throw new Error("Missing required field: dataset_id");
    }

    console.log(`Fetching dimensions for dataset ${dataset_id}`);

    // Query dataset_column_presence joined with dimensions
    const { data, error } = await supabase
      .from("dataset_column_presence")
      .select(`
        dimension_id,
        dimensions (
          id,
          name,
          display_name,
          data_type,
          category,
          is_critical
        )
      `)
      .eq("dataset_id", dataset_id);

    if (error) {
      throw new Error(`Failed to fetch dimensions: ${error.message}`);
    }

    // Helper to capitalize data type
    function capitalizeDataType(type: string): string {
      const typeMap: Record<string, string> = {
        'string': 'String',
        'number': 'Number',
        'date': 'Date',
        'boolean': 'Boolean',
      };
      return typeMap[type.toLowerCase()] || type;
    }

    // Transform to response format
    const dimensions: DatasetDimension[] = (data || [])
      .filter((row: any) => row.dimensions)
      .map((row: any) => ({
        id: row.dimensions.id,
        name: row.dimensions.name,
        displayName: row.dimensions.display_name,
        dataType: capitalizeDataType(row.dimensions.data_type),
        category: row.dimensions.category,
        isCritical: row.dimensions.is_critical ?? false,
      }));

    console.log(`Found ${dimensions.length} dimensions for dataset ${dataset_id}`);

    return new Response(JSON.stringify(dimensions), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    const status = error.message.includes("authorization")
      ? 401
      : error.message.includes("Missing")
      ? 400
      : 500;

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
