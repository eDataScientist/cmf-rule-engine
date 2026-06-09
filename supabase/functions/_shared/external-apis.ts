import type {
  DataPreviewResponse,
  ArabicCheckResponse,
  ClaimCategory,
  AIAlignmentResponse,
} from "./types.ts";

const DATA_PREVIEW_URL = "https://data.edata-arabia-uat.pp.ua/stats";
const ARABIC_CHECK_URL = "https://data.edata-arabia-uat.pp.ua/api/stats";

// Get AI alignment edge function URL
const getAIAlignmentUrl = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable not set");
  }
  return `${supabaseUrl}/functions/v1/ai-column-alignment`;
};

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error.message);

      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("All retry attempts failed");
}

/**
 * Call DataPreview API to get dataset shape and sample data
 * @param file - Dataset file (CSV/XLSX)
 * @returns Preview data with shape, column names, and sample rows
 */
export async function callDataPreviewAPI(
  file: File
): Promise<DataPreviewResponse> {
  return retryWithBackoff(async () => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(DATA_PREVIEW_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `DataPreview API failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("DataPreview API response keys:", Object.keys(data));

    // Validate response structure
    if (!data?.column_names) {
      throw new Error("Invalid response from DataPreview API: missing column_names");
    }

    // DataPreview API may return different formats, normalize it
    if (!data.shape && data.describe) {
      // Parse shape from describe string if shape is missing
      const describeLines = data.describe.split('\n');
      const countLine = describeLines.find((line: string) => line.startsWith('count'));
      const rowCount = countLine ? parseInt(countLine.split(/\s+/)[1]) : 0;

      data.shape = {
        rows: rowCount,
        columns: data.column_names.length
      };
      console.log("Normalized shape:", data.shape);
    }

    // Ensure sample exists (may be empty array)
    if (!data.sample) {
      data.sample = [];
    }

    return data as DataPreviewResponse;
  }, 3, 2000); // 3 retries, starting with 2s delay
}

/**
 * Call AI alignment edge function to get column mapping
 * Uses Gemini API with dynamic dimension loading based on claim category
 * @param previewData - Dataset preview data
 * @param claimCategory - 'medical' or 'motor' to load appropriate dimensions
 * @param authHeader - Authorization header for authenticated request
 * @returns Alignment mapping from original to matched columns
 */
export async function callAIAlignment(
  previewData: DataPreviewResponse,
  claimCategory: ClaimCategory,
  authHeader: string
): Promise<AIAlignmentResponse> {
  return retryWithBackoff(async () => {
    const response = await fetch(getAIAlignmentUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify({
        preview_data: previewData,
        claim_category: claimCategory,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `AI alignment API failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();

    // Validate response structure
    if (!data?.alignment || typeof data.alignment !== "object") {
      throw new Error("Invalid response from AI alignment API");
    }

    return data as AIAlignmentResponse;
  }, 3, 10000); // 3 retries, starting with 10s delay (Gemini can be slow)
}

/**
 * Call ArabicCheck API to detect Arabic columns
 * @param file - Dataset file
 * @returns Number of columns containing Arabic text
 */
export async function callArabicCheckAPI(file: File): Promise<number> {
  return retryWithBackoff(async () => {
    console.log(`ArabicCheck: Sending file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(ARABIC_CHECK_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `ArabicCheck API failed: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    const data: ArabicCheckResponse = await response.json();

    // Validate response structure
    if (typeof data?.data?.columns_with_arabic !== "number") {
      throw new Error("Invalid response from ArabicCheck API");
    }

    return data.data.columns_with_arabic;
  }, 3, 2000); // 3 retries, starting with 2s delay
}
