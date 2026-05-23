export function unwrapApiData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid API response");
  }

  const record = payload as Record<string, unknown>;

  if ("data" in record && record.data !== undefined) {
    return record.data as T;
  }

  return payload as T;
}
