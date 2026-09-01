/**
 * Collapses openapi-fetch's `{data, error}` result into a value-or-throw —
 * the shape every queryFn/mutationFn in this app wants. Not for every call
 * site: pullMachine.ts needs the raw response.status to branch on 402, so
 * it stays on the manual `if (error) throw error;` form instead.
 */
export async function unwrap<T>(request: Promise<{ data?: T; error?: unknown }>): Promise<T> {
  const { data, error } = await request;
  if (error) throw error;
  return data as T;
}
