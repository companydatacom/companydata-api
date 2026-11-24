/**
 * Match one of your own rows to its registered company.
 * Works down from the strongest identifier to the weakest and stops at the
 * first hit: registration number -> website domain -> name.
 *
 * Run: COMPANYDATA_API_KEY=... npx tsx api/find-company.ts
 * No dependencies: Node.js 18+ has fetch built in.
 */

const BASE = "https://app.companydata.com/api/company";
const KEY = process.env.COMPANYDATA_API_KEY;
if (!KEY) throw new Error("Set COMPANYDATA_API_KEY first");

type CompanyRecord = Record<string, unknown> & { ID: string; "Company Name": string };

async function search(params: Record<string, string>): Promise<CompanyRecord[]> {
  const url = `${BASE}/search?${new URLSearchParams(params)}`;
  const res = await fetch(url, { headers: { "x-api-key": KEY!, Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: { records?: CompanyRecord[] } };
  return json.data?.records ?? [];
}

export type Match = { record: CompanyRecord; via: "registration number" | "domain" | "name" };

export async function findCompany(row: {
  regNo?: string;
  domain?: string;
  name: string;
  country?: string; // ISO code, e.g. "NL"
}): Promise<Match | null> {
  if (row.regNo && row.country) {
    const [hit] = await search({ nationalId: row.regNo, countryCode: row.country });
    if (hit) return { record: hit, via: "registration number" }; // exact
  }
  if (row.domain) {
    const [hit] = await search({ website: row.domain });
    if (hit) return { record: hit, via: "domain" }; // strong
  }
  const [hit] = await search({ search: row.name, ...(row.country ? { countryCode: row.country } : {}) });
  // A name-only match is a candidate. Check address or legal form before you store it.
  return hit ? { record: hit, via: "name" } : null;
}

// Demo
findCompany({ name: "Heineken", country: "NL" }).then((match) => {
  console.log(match ? `${match.record["Company Name"]} (ID ${match.record.ID}), matched on ${match.via}` : "no match");
});
