/**
 * A small TTL cache in front of a lookup, so the same company is not paid
 * for twice in a day. Check your contract first: some providers do not allow
 * storing responses.
 */

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

export async function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const value = await load();
  cache.set(key, { at: Date.now(), value });
  return value;
}

// Usage:
//   import { findCompany } from "./find-company";
//   const match = await cached("nl:heineken", () => findCompany({ name: "Heineken", country: "NL" }));
