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
    const counts = new Map<string, number>();
    for (const d of mappedDimensions) {
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
    const duplicates = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);

    return {
      valid: false,
      error: `Duplicate dimension mappings detected: ${duplicates.join(', ')}. Each dimension can only be mapped once.`
    };
  }

  return { valid: true };
}
