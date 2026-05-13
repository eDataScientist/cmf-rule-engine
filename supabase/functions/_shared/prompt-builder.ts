import type {
  DimensionWithDetails,
  DataPreviewResponse,
  ClaimCategory,
} from "./types.ts";

/**
 * Format dimensions as a markdown table for the AI prompt
 */
function formatDimensionTable(dimensions: DimensionWithDetails[]): string {
  const header = "| Column Name | Display Name | Data Type | Category | Critical | Description |";
  const separator = "|-------------|--------------|-----------|----------|----------|-------------|";

  const rows = dimensions.map((d) => {
    const critical = d.is_critical ? "Yes" : "No";
    // Escape pipe characters in description
    const desc = (d.description || "").replace(/\|/g, "\\|");
    return `| ${d.name} | ${d.display_name} | ${d.data_type} | ${d.category} | ${critical} | ${desc} |`;
  });

  return [header, separator, ...rows].join("\n");
}

/**
 * Get category-specific analysis guidance
 */
function getCategoryGuidance(claimCategory: ClaimCategory): string {
  if (claimCategory === "medical") {
    return `
## MEDICAL CLAIMS SPECIFIC PATTERNS:
- **ICD Codes**: Look for columns containing diagnosis codes (ICD-10, ICD-9). Common patterns: icd, diagnosis_code, dx_code
- **Provider Identifiers**: NPI numbers, provider_id, facility_id, hospital_id
- **Medical Procedures**: CPT codes, procedure_code, treatment_code, service_code
- **Patient Identifiers**: member_id, patient_id, card_number, policy_number
- **Clinical Terms**: admission, discharge, diagnosis, procedure, prescription, pharmacy
- **Financial Patterns**: claimed_amount, approved_amount, denied_amount, copay, deductible
- **Date Patterns**: service_date, admission_date, discharge_date, claim_date`;
  }

  return `
## MOTOR CLAIMS SPECIFIC PATTERNS:
- **Vehicle Identifiers**: VIN, chassis_no, vin_number, vehicle_id, license_plate, registration
- **Accident Details**: accident_date, loss_date, type_of_accident, cause_of_accident
- **Fault Status**: at_fault, fault_flag, responsibility, liable_party
- **Vehicle Specs**: make, model, year, body_type, fuel_type, vehicle_category
- **Repair Info**: workshop, surveyor, repair_value, estimate, parts_replaced
- **Driver Info**: driver_age, driver_nationality, license_id, years_of_experience
- **Geographic**: region, location, place_of_accident, coordinates
- **Policy Info**: policy_number, sum_insured, deductible, cover_type`;
}

/**
 * Format sample data for the prompt
 */
function formatSampleData(sample: Record<string, any>[]): string {
  if (!sample || sample.length === 0) {
    return "No sample data available.";
  }

  // Take first 3 samples max
  const samples = sample.slice(0, 3);

  return samples
    .map((row, i) => {
      const entries = Object.entries(row)
        .map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`)
        .join("\n");
      return `Sample ${i + 1}:\n${entries}`;
    })
    .join("\n\n");
}

/**
 * Build the complete alignment prompt
 */
export function buildAlignmentPrompt(
  dimensions: DimensionWithDetails[],
  previewData: DataPreviewResponse,
  claimCategory: ClaimCategory
): string {
  const categoryLabel = claimCategory === "medical" ? "Medical" : "Motor";
  const dimensionTable = formatDimensionTable(dimensions);
  const categoryGuidance = getCategoryGuidance(claimCategory);
  const sampleData = formatSampleData(previewData.sample);
  const columnNames = previewData.column_names.join(", ");

  return `# ${categoryLabel} Insurance Claims Data Mapping System

You are an expert data analyst specializing in ${categoryLabel.toLowerCase()} insurance claims data standardization. Your task is to create a mapping from input dataset columns to the standardized master schema.

## MASTER SCHEMA COLUMNS:

The following are the ONLY valid dimension names you can map to. Use the exact column name from this table:

${dimensionTable}

${categoryGuidance}

## INPUT DATASET:

**Column names to map:**
${columnNames}

**Sample data from the dataset:**
${sampleData}

## MAPPING RULES:

1. **Exact Match Required**: Output values MUST be exact column names from the master schema table above
2. **Empty String for Unmapped**: If no suitable match exists, use an empty string ""
3. **Semantic Matching**: Match based on meaning, not just name similarity
4. **Data Type Consideration**: Consider the data type when matching (e.g., don't map text to number columns)
5. **Critical Columns**: Prioritize matching critical columns (marked "Yes" in the table)
6. **One-to-One Mapping**: Each input column maps to at most one master column

## COMMON COLUMN NAME VARIATIONS:

- Date variations: date_of_loss, loss_date, accident_dt, incident_date -> AccidentDate
- Amount variations: claim_amt, total_amount, amount_claimed -> ApprovedClaimAmount, SettledAmount
- ID variations: claim_no, claim_ref, reference_number -> ClaimNumber
- Vehicle: make_model, car_brand, manufacturer -> VehicleMake, VehicleBrand

## OUTPUT FORMAT:

Return a JSON object where:
- Keys are the input column names (exactly as provided)
- Values are the matched master schema column names (or empty string if no match)

Example:
{"input_col_1": "ClaimNumber", "input_col_2": "AccidentDate", "unknown_col": ""}`;
}

/**
 * Build JSON schema for structured output
 * Creates a schema that expects an object with string values
 */
export function buildAlignmentSchema(columnNames: string[]): object {
  const properties: Record<string, object> = {};

  for (const col of columnNames) {
    properties[col] = { type: "string" };
  }

  return {
    type: "object",
    properties,
    required: columnNames,
    additionalProperties: false,
  };
}

/**
 * Get the list of valid dimension names for validation
 */
export function getValidDimensionNames(dimensions: DimensionWithDetails[]): Set<string> {
  return new Set(dimensions.map((d) => d.name));
}

/**
 * Validate and clean alignment response
 * Ensures all values are either valid dimension names or empty strings
 */
export function validateAlignment(
  alignment: Record<string, string>,
  validDimensionNames: Set<string>
): Record<string, string> {
  const cleaned: Record<string, string> = {};

  for (const [inputCol, mappedDim] of Object.entries(alignment)) {
    if (!mappedDim || mappedDim.trim() === "") {
      cleaned[inputCol] = "";
    } else if (validDimensionNames.has(mappedDim)) {
      cleaned[inputCol] = mappedDim;
    } else {
      // Try case-insensitive match
      const match = Array.from(validDimensionNames).find(
        (name) => name.toLowerCase() === mappedDim.toLowerCase()
      );
      cleaned[inputCol] = match || "";
      if (!match) {
        console.warn(`Invalid dimension name from AI: "${mappedDim}" for column "${inputCol}"`);
      }
    }
  }

  return cleaned;
}
