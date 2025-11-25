import { parse, stringify } from "jsr:@std/csv";
import type { CSVData } from "./types.ts";

/**
 * Parse CSV content into headers and rows
 * @param content - Raw CSV string content
 * @returns Object with headers array and rows as Record array
 */
export async function parseCSV(content: string): Promise<CSVData> {
  try {
    // Parse CSV using Deno standard library
    const parsed = await parse(content, {
      skipFirstRow: false, // We'll handle headers manually
    });

    if (parsed.length === 0) {
      throw new Error("CSV file is empty");
    }

    // First row is headers
    const headers = parsed[0] as string[];

    // Rest are data rows - convert to Record<string, string>
    const rows = parsed.slice(1).map((row) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = String(row[index] || "");
      });
      return record;
    });

    return { headers, rows };
  } catch (error) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
}

/**
 * Apply alignment mapping to transform column names
 * @param data - Original CSV data
 * @param alignment - Mapping from original column names to new names
 * @returns Transformed CSV data with aligned column names
 */
export function applyAlignment(
  data: CSVData,
  alignment: Record<string, string>
): CSVData {
  try {
    // Create new headers by applying alignment mapping
    const alignedHeaders: string[] = [];
    const headerMapping = new Map<string, string>();

    data.headers.forEach((originalHeader) => {
      const alignedHeader = alignment[originalHeader];

      // Only include columns that have a mapping (non-empty alignment)
      if (alignedHeader && alignedHeader.trim() !== "") {
        alignedHeaders.push(alignedHeader);
        headerMapping.set(originalHeader, alignedHeader);
      }
    });

    // Transform rows to use aligned column names
    const alignedRows = data.rows.map((row) => {
      const alignedRow: Record<string, string> = {};

      headerMapping.forEach((alignedHeader, originalHeader) => {
        alignedRow[alignedHeader] = row[originalHeader] || "";
      });

      return alignedRow;
    });

    return {
      headers: alignedHeaders,
      rows: alignedRows,
    };
  } catch (error) {
    throw new Error(`Failed to apply alignment: ${error.message}`);
  }
}

/**
 * Generate CSV string from headers and rows
 * @param data - CSV data with headers and rows
 * @returns CSV string content
 */
export async function generateCSV(data: CSVData): Promise<string> {
  try {
    // Convert rows back to array format for stringify
    const arrayData = [
      data.headers, // First row is headers
      ...data.rows.map((row) =>
        data.headers.map((header) => row[header] || "")
      ),
    ];

    // Generate CSV using Deno standard library
    const csvString = await stringify(arrayData);

    return csvString;
  } catch (error) {
    throw new Error(`Failed to generate CSV: ${error.message}`);
  }
}
