/**
 * Test helper utilities for common test operations.
 */

/**
 * Sanitizes a name for use in file paths or directory names.
 * Converts to lowercase and replaces non-alphanumeric characters with hyphens.
 *
 * @param name - The name to sanitize
 * @returns Sanitized name safe for use in file paths
 */
export function sanitizeTestName(name: string): string {
  const segments = name.toLowerCase().match(/[a-z0-9]+/g);
  return segments?.join('-') ?? 'target';
}
