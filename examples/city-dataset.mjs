#!/usr/bin/env node
// Export the largest companies (by revenue) in one city to CSV.
//
//   COMPANYDATA_API_KEY=... node examples/city-dataset.mjs --country NL --city Amsterdam --limit 1000 > amsterdam.csv
//
// cityName needs the value exactly as stored; look it up with
//   GET /api/cities?search=amst&countries=NL
//
// IDs, registration numbers and postal codes are written as text. Open the
// file in Excel through Data > From Text/CSV and set those columns to Text,
// or Excel drops leading zeros and turns long numbers into 8,79991E+13.
//
// Each exported company uses one export credit. Node.js 18+, no dependencies.

const BASE_URL = process.env.COMPANYDATA_API_BASE_URL ?? 'https://app.companydata.com';
const API_KEY = process.env.COMPANYDATA_API_KEY;

export const COLUMNS = [
  'ID', 'Company Name', 'Trade Name', 'Address 1', 'Address 2', 'Postal Code', 'City', 'State/Province', 'Country',
  'Company Registration Number', 'Company Registration Type Code',
  'Business Category Code 1', 'Business Category Code 1 - Description',
  'Founding Year', 'Yearly Revenue Local Currency', 'Currency Code', 'Yearly Revenue in U.S. Dollars',
  'Employees On Site', 'Employees Total',
  'Import/Export Code', 'Import/Export Code - Description',
  'Business Legal Type', 'Business Legal Type - Description',
  'Location Type - Description', 'Subsidiary Code - Description',
  'Local Headquarter ID Number', 'Local Headquarter Company Name', 'Local Headquarter City', 'Local Headquarter Country Name',
  'National Headquarter ID Number', 'National Headquarter Company Name', 'National Headquarter City Name',
  'Global Headquarter ID Number', 'Global Headquarter Company Name', 'Global Headquarter City Name', 'Global Headquarter Country Name',
  'Number of Companies in Group',
];

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
}

async function get(path, params) {
  const url = `${BASE_URL}${path}?${new URLSearchParams(params)}`;
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { 'x-api-key': API_KEY, accept: 'application/json' } });
    if (res.ok) return res.json();
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
      continue;
    }
    throw new Error(`${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
}

export function csvCell(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  if (!API_KEY) throw new Error('Set COMPANYDATA_API_KEY');
  const country = arg('country');
  const city = arg('city');
  const limit = Number(arg('limit', '1000'));
  if (!country || !city) throw new Error('Pass --country XX --city <exact city name> [--limit 1000]');

  const pageSize = Math.min(50, limit);
  const rows = new Map();
  for (let page = 1; rows.size < limit; page++) {
    const res = await get('/api/company/export', {
      countryCode: country, cityName: city, orderBy: 'revenueDesc', page: String(page), pageSize: String(pageSize),
    });
    const records = res.data?.records ?? [];
    for (const r of records) if (rows.size < limit) rows.set(r.ID, r);
    process.stderr.write(`\r${rows.size} / ${Math.min(limit, res.meta?.totalCount ?? limit)}`);
    if (records.length < pageSize) break;
  }
  process.stderr.write('\n');

  // Largest first. Sorted here as well, in case a page comes back in ID order.
  const sorted = [...rows.values()].sort(
    (a, b) => (Number(b['Yearly Revenue in U.S. Dollars']) || 0) - (Number(a['Yearly Revenue in U.S. Dollars']) || 0),
  );
  const lines = [COLUMNS.map(csvCell).join(',')];
  for (const r of sorted) lines.push(COLUMNS.map((c) => csvCell(r[c])).join(','));
  process.stdout.write(`${lines.join('\n')}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
