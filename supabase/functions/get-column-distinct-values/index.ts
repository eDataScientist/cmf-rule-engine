import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { parse } from "jsr:@std/csv";

// Request/Response types
interface GetColumnDistinctValuesRequest {
  dataset_id: number;
  column_name: string;
}

interface GetColumnDistinctValuesResponse {
  values: string[] | null;
  totalRows: number;
  uniqueCount: number;
}

// Constants
const MAX_VALUES = 100;
const UNIQUENESS_THRESHOLD = 0.5; // 50% - if more than 50% unique, don't show suggestions

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

function getStorageClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

async function downloadFromStorage(bucket: string, path: string): Promise<Blob> {
  const supabase = getStorageClient();
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw new Error(`Failed to download: ${error.message}`);
  if (!data) throw new Error("No data returned");
  return data;
}

interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

async function parseCSV(content: string): Promise<CSVData> {
  const parsed = await parse(content, { skipFirstRow: false });
  if (parsed.length === 0) throw new Error("CSV file is empty");
  const headers = parsed[0] as string[];
  const rows = parsed.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = String(row[index] || "");
    });
    return record;
  });
  return { headers, rows };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { supabase } = await validateRequest(req);
    const { dataset_id, column_name }: GetColumnDistinctValuesRequest = await req.json();

    if (!dataset_id) {
      throw new Error("Missing required field: dataset_id");
    }
    if (!column_name) {
      throw new Error("Missing required field: column_name");
    }

    console.log(`Fetching distinct values for column "${column_name}" in dataset ${dataset_id}`);

    // Get dataset to find aligned file path
    const { data: dataset, error: fetchError } = await supabase
      .from("datasets")
      .select("aligned_file_path")
      .eq("id", dataset_id)
      .single();

    if (fetchError || !dataset) {
      throw new Error(`Failed to fetch dataset: ${fetchError?.message}`);
    }
    if (!dataset.aligned_file_path) {
      throw new Error("Dataset has no aligned file");
    }

    // Download and parse the aligned CSV
    const alignedBlob = await downloadFromStorage("aligned-datasets", dataset.aligned_file_path);
    const alignedContent = await alignedBlob.text();
    const parsed = await parseCSV(alignedContent);

    // Check if column exists
    if (!parsed.headers.includes(column_name)) {
      throw new Error(`Column "${column_name}" not found in dataset`);
    }

    // Extract distinct values
    const values = new Set<string>();
    for (const row of parsed.rows) {
      const val = row[column_name];
      if (val && val.trim() !== "") {
        values.add(val.trim());
      }
    }

    const uniqueCount = values.size;
    const totalRows = parsed.rows.length;

    console.log(`Found ${uniqueCount} unique values out of ${totalRows} rows`);

    // If too many unique values (>50% of rows), return null
    // This indicates the column is not suitable for autocomplete (e.g., free text, IDs)
    if (totalRows > 0 && uniqueCount / totalRows > UNIQUENESS_THRESHOLD) {
      console.log(`Uniqueness ratio ${(uniqueCount / totalRows * 100).toFixed(1)}% exceeds threshold, returning null`);

      const response: GetColumnDistinctValuesResponse = {
        values: null,
        totalRows,
        uniqueCount,
      };

      return new Response(JSON.stringify(response), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Connection": "keep-alive",
        },
      });
    }

    // Sort values alphabetically and limit to MAX_VALUES
    const sortedValues = Array.from(values).sort().slice(0, MAX_VALUES);

    const response: GetColumnDistinctValuesResponse = {
      values: sortedValues,
      totalRows,
      uniqueCount,
    };

    return new Response(JSON.stringify(response), {
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
      : error.message.includes("not found")
      ? 404
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
