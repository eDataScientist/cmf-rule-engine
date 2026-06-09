import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai";
import { createClient } from "jsr:@supabase/supabase-js@2";

import { getDimensionsByCategory } from "../_shared/database.ts";
import {
  buildAlignmentPrompt,
  buildAlignmentSchema,
  getValidDimensionNames,
  validateAlignment,
} from "../_shared/prompt-builder.ts";
import type {
  AIAlignmentRequest,
  AIAlignmentResponse,
  ClaimCategory,
} from "../_shared/types.ts";

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
async function validateRequest(req: Request): Promise<void> {
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
}

// Initialize OpenAI client
function getAIClient(): OpenAI {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }
  return new OpenAI({ apiKey });
}

// Call OpenAI API for column alignment
async function generateAlignment(
  openai: OpenAI,
  prompt: string,
  schema: object
): Promise<Record<string, string>> {
  console.log("Calling OpenAI API with structured output...");

  const response = await openai.chat.completions.create({
    model: "gpt-5.4-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that maps dataset columns to standard insurance claim dimensions.",
      },
      { role: "user", content: prompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "column_alignment",
        strict: true,
        schema: schema,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI API");
  }

  console.log("OpenAI API response received, parsing JSON...");

  try {
    return JSON.parse(content) as Record<string, string>;
  } catch (error) {
    console.error("Failed to parse OpenAI response:", content);
    throw new Error(`Failed to parse AI response as JSON: ${error.message}`);
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Validate authentication
    await validateRequest(req);

    // Parse request body
    const body: AIAlignmentRequest = await req.json();
    const { preview_data, claim_category } = body;

    if (!preview_data || !claim_category) {
      throw new Error("Missing required fields: preview_data or claim_category");
    }

    // Validate claim category
    if (claim_category !== "medical" && claim_category !== "motor") {
      throw new Error(`Invalid claim_category: ${claim_category}. Must be 'medical' or 'motor'`);
    }

    console.log(`Processing alignment for ${claim_category} dataset with ${preview_data.column_names.length} columns`);

    // Fetch dimensions for this category
    console.log(`Fetching ${claim_category} dimensions from database...`);
    const dimensions = await getDimensionsByCategory(claim_category as ClaimCategory);
    console.log(`Found ${dimensions.length} dimensions for ${claim_category}`);

    // Build the prompt and schema
    const prompt = buildAlignmentPrompt(dimensions, preview_data, claim_category as ClaimCategory);
    const schema = buildAlignmentSchema(preview_data.column_names);
    const validDimensionNames = getValidDimensionNames(dimensions);

    // Get AI client and generate alignment
    const ai = getAIClient();
    const rawAlignment = await generateAlignment(ai, prompt, schema);

    // Validate and clean the alignment
    const alignment = validateAlignment(rawAlignment, validDimensionNames);

    // Count matched columns
    const matchedCount = Object.values(alignment).filter((v) => v && v.trim() !== "").length;
    console.log(`Alignment complete: ${matchedCount}/${preview_data.column_names.length} columns matched`);

    const response: AIAlignmentResponse = { alignment };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in ai-column-alignment:", error);

    const status = error.message.includes("authorization") || error.message.includes("authenticated")
      ? 401
      : error.message.includes("Missing required") || error.message.includes("Invalid claim_category")
      ? 400
      : 500;

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
