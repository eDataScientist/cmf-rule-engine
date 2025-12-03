export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAlignment(
  alignment: Record<string, string>
): ValidationResult {
  const mappedDimensions = Object.values(alignment).filter(
    d => d && d.trim() !== ''
  );
  const uniqueDimensions = new Set(mappedDimensions);

  if (mappedDimensions.length !== uniqueDimensions.size) {
    return {
      valid: false,
      error: 'Duplicate dimension mappings detected. Each dimension can only be mapped once.'
    };
  }

  return { valid: true };
}
