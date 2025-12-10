import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { parse } from "jsr:@std/csv";

// Risk level types
type RiskLevel = "low" | "moderate" | "high";

// Request payload
interface FinancialMetricsRequest {
  dataset_id: number;
  predictions: Record<string, RiskLevel>;
}

// Response types
interface PriceDistributionBin {
  binLabel: string;
  count: number;
  minValue: number;
  maxValue: number;
}

interface FinancialMetrics {
  totalClaimedValue: number;
  averageClaimValue: number;
  claimsWithFinancialData: number;
  valueByRisk: {
    low: { totalValue: number; avgValue: number; count: number };
    moderate: { totalValue: number; avgValue: number; count: number };
    high: { totalValue: number; avgValue: number; count: number };
  };
  priceDistribution: {
    high: PriceDistributionBin[];
    low: PriceDistributionBin[];
  };
}

interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
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

function formatBinLabel(minVal: number, maxVal: number): string {
  const fmt = (amt: number): string => {
    if (amt >= 1_000_000) return `${(amt / 1_000_000).toFixed(1)}M`;
    if (amt >= 1_000) return `${(amt / 1_000).toFixed(0)}K`;
    return `${amt.toFixed(0)}`;
  };
  return `$${fmt(minVal)}-$${fmt(maxVal)}`;
}

function computeMetrics(
  alignedRows: Record<string, string>[],
  predictions: Record<string, RiskLevel>
): FinancialMetrics {
  const byRisk: Record<RiskLevel, { total: number; count: number; amounts: number[] }> = {
    low: { total: 0, count: 0, amounts: [] },
    moderate: { total: 0, count: 0, amounts: [] },
    high: { total: 0, count: 0, amounts: [] },
  };

  let totalValue = 0;
  let claimsWithValue = 0;

  for (const row of alignedRows) {
    const claimNumber = row["ClaimNumber"];
    if (!claimNumber) continue;

    const riskLevel = predictions[claimNumber];
    if (!riskLevel) continue;

    const rawAmount = row["EstimateValue"] || row["ApprovedClaimAmount"];
    if (!rawAmount || rawAmount.trim() === "") continue;

    const amount = parseFloat(rawAmount.replace(/[,$]/g, ""));
    if (isNaN(amount) || amount < 0) continue;

    totalValue += amount;
    claimsWithValue++;
    byRisk[riskLevel].total += amount;
    byRisk[riskLevel].count++;
    byRisk[riskLevel].amounts.push(amount);
  }

  const avgValue = claimsWithValue > 0 ? totalValue / claimsWithValue : 0;

  const highRiskAmounts = byRisk.high.amounts;
  const lowRiskAmounts = byRisk.low.amounts;
  const allAmounts = [...highRiskAmounts, ...lowRiskAmounts];
  let highBins: PriceDistributionBin[] = [];
  let lowBins: PriceDistributionBin[] = [];

  if (allAmounts.length > 0) {
    const minAmount = Math.min(...allAmounts);
    const maxAmount = Math.max(...allAmounts);
    const range = maxAmount - minAmount;
    const binCount = 10;
    const binWidth = range > 0 ? range / binCount : 1;

    for (let i = 0; i < binCount; i++) {
      const minValue = minAmount + i * binWidth;
      const maxValue = i === binCount - 1 ? maxAmount : minAmount + (i + 1) * binWidth;
      const binLabel = formatBinLabel(minValue, maxValue);
      highBins.push({ binLabel, count: 0, minValue, maxValue });
      lowBins.push({ binLabel, count: 0, minValue, maxValue });
    }

    for (const amount of highRiskAmounts) {
      const idx = range > 0 ? Math.min(Math.floor((amount - minAmount) / binWidth), binCount - 1) : 0;
      highBins[idx].count++;
    }

    for (const amount of lowRiskAmounts) {
      const idx = range > 0 ? Math.min(Math.floor((amount - minAmount) / binWidth), binCount - 1) : 0;
      lowBins[idx].count++;
    }
  }

  return {
    totalClaimedValue: totalValue,
    averageClaimValue: avgValue,
    claimsWithFinancialData: claimsWithValue,
    valueByRisk: {
      low: {
        totalValue: byRisk.low.total,
        avgValue: byRisk.low.count > 0 ? byRisk.low.total / byRisk.low.count : 0,
        count: byRisk.low.count,
      },
      moderate: {
        totalValue: byRisk.moderate.total,
        avgValue: byRisk.moderate.count > 0 ? byRisk.moderate.total / byRisk.moderate.count : 0,
        count: byRisk.moderate.count,
      },
      high: {
        totalValue: byRisk.high.total,
        avgValue: byRisk.high.count > 0 ? byRisk.high.total / byRisk.high.count : 0,
        count: byRisk.high.count,
      },
    },
    priceDistribution: { high: highBins, low: lowBins },
  };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { supabase } = await validateRequest(req);
    const { dataset_id, predictions }: FinancialMetricsRequest = await req.json();

    if (!dataset_id) throw new Error("Missing required field: dataset_id");
    if (!predictions || typeof predictions !== "object") {
      throw new Error("Missing required field: predictions");
    }

    console.log(`Computing financial metrics for dataset ${dataset_id}`);

    const { data: dataset, error: fetchError } = await supabase
      .from("datasets")
      .select("aligned_file_path")
      .eq("id", dataset_id)
      .single();

    if (fetchError || !dataset) throw new Error(`Failed to fetch dataset: ${fetchError?.message}`);
    if (!dataset.aligned_file_path) throw new Error("Dataset has no aligned file");

    const alignedBlob = await downloadFromStorage("aligned-datasets", dataset.aligned_file_path);
    const alignedContent = await alignedBlob.text();
    const parsed = await parseCSV(alignedContent);

    console.log(`Parsed ${parsed.rows.length} rows`);

    const metrics = computeMetrics(parsed.rows, predictions);

    console.log(`Found ${metrics.claimsWithFinancialData} claims with financial data`);

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Connection": "keep-alive" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message.includes("authorization") ? 401 : error.message.includes("Missing") ? 400 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
