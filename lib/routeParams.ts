/**
 * expo-router params can arrive as string | string[] | undefined.
 * Normalize to a plain string ("" when absent) so screens stay simple.
 */
export function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}
