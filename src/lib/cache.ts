const store = new Map<string, { data: unknown; expiresAt: number }>()

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 60_000
): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.data as T

  const data = await fn()
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
  return data
}

export function invalidateCache(prefix: string) {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}