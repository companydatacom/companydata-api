#!/usr/bin/env node
// Build the full corporate hierarchy of a company as a JSON tree.
//
//   COMPANYDATA_API_KEY=... node examples/corporate-hierarchy.mjs --id 0995856641 > amazon.json
//   COMPANYDATA_API_KEY=... node examples/corporate-hierarchy.mjs --search "Amazon.com" --country US
//
// 1. Export the company and read its "Global Headquarter ID Number".
// 2. Export every company with that worldwideHeadquarterID (scroll pagination,
//    so no member is skipped or repeated).
// 3. Hang each company under its Local, then National, then Global headquarters.
//
// Each exported company uses one export credit. Node.js 18+, no dependencies.

const BASE_URL = process.env.COMPANYDATA_API_BASE_URL ?? 'https://app.companydata.com';
const API_KEY = process.env.COMPANYDATA_API_KEY;

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
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

const exportOne = async (id) => (await get('/api/company/export', { ID: id })).data?.records?.[0] ?? null;

async function exportGroup(globalId) {
  const records = [];
  let page = await get('/api/company/export', { worldwideHeadquarterID: globalId, useScroll: 'true', pageSize: '50' });
  for (;;) {
    records.push(...(page.data?.records ?? []));
    process.stderr.write(`\r${records.length} companies`);
    if (!page.meta?.hasMoreRecords || !page.meta?.scrollId) break;
    page = await get('/api/company/export', { scrollId: page.meta.scrollId, useScroll: 'true', pageSize: '50' });
  }
  process.stderr.write('\n');
  // A scroll never returns a company twice, but guard anyway.
  return [...new Map(records.map((r) => [r.ID, r])).values()];
}

const num = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

function node(r) {
  return {
    id: r.ID,
    name: r['Company Name'],
    tradeName: r['Trade Name'] || null,
    city: r.City ?? null,
    country: r.Country ?? null,
    registrationNumber: r['Company Registration Number'] || null,
    locationType: r['Location Type - Description'] ?? null,
    employeesTotal: num(r['Employees Total']),
    revenueUSD: num(r['Yearly Revenue in U.S. Dollars']),
    website: r.Website || null,
    subsidiaries: [],
  };
}

// Same rule as https://companydata.com/api-docs/use-cases/corporate-structure/
function parentOf(r, ids) {
  for (const field of ['Local Headquarter ID Number', 'National Headquarter ID Number', 'Global Headquarter ID Number']) {
    const id = r[field];
    if (id && id !== r.ID && ids.has(id)) return id;
  }
  return null;
}

function buildTree(records, rootRecord) {
  const nodes = new Map(records.map((r) => [r.ID, node(r)]));
  if (!nodes.has(rootRecord.ID)) nodes.set(rootRecord.ID, node(rootRecord));
  const root = nodes.get(rootRecord.ID);
  for (const r of records) {
    if (r.ID === root.id) continue;
    const parent = nodes.get(parentOf(r, nodes) ?? root.id);
    parent.subsidiaries.push(nodes.get(r.ID));
  }
  const sortTree = (n) => {
    n.subsidiaries.sort((a, b) => (b.revenueUSD ?? -1) - (a.revenueUSD ?? -1) || a.name.localeCompare(b.name));
    n.subsidiaries.forEach(sortTree);
  };
  sortTree(root);
  return root;
}

function depth(n) {
  return n.subsidiaries.length ? 1 + Math.max(...n.subsidiaries.map(depth)) : 0;
}

async function main() {
  if (!API_KEY) throw new Error('Set COMPANYDATA_API_KEY');
  let id = arg('id');
  if (!id) {
    const search = arg('search');
    if (!search) throw new Error('Pass --id <ID> or --search <name> [--country XX]');
    const params = { search, pageSize: '1' };
    if (arg('country')) params.countryCode = arg('country');
    id = (await get('/api/company/search', params)).data?.records?.[0]?.ID;
    if (!id) throw new Error(`No company found for "${search}"`);
  }

  const company = await exportOne(id);
  if (!company) throw new Error(`No company with ID ${id}`);
  const globalId = company['Global Headquarter ID Number'] || company.ID;

  const members = await exportGroup(globalId);
  const rootRecord = members.find((r) => r.ID === globalId) ?? (await exportOne(globalId)) ?? company;
  const tree = buildTree(members, rootRecord);

  const countries = {};
  for (const r of members) if (r.Country) countries[r.Country] = (countries[r.Country] ?? 0) + 1;

  const out = {
    group: {
      globalHeadquarterId: globalId,
      globalHeadquarterName: rootRecord['Company Name'],
      companiesInGroup: num(rootRecord['Number of Companies in Group']),
      companiesReturned: members.length,
      levels: depth(tree) + 1,
      countries: Object.fromEntries(Object.entries(countries).sort((a, b) => b[1] - a[1])),
      source: `${BASE_URL}/api/company/export?worldwideHeadquarterID=${globalId}`,
      fetchedAt: new Date().toISOString(),
    },
    tree,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
