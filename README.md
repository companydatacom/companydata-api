# Company Data API

The [CompanyData Company Data API](https://companydata.com/company-data-api/) is a company and business data API for KYB, enrichment and lead generation, built on official government registers: **377M+ registered businesses in 190+ countries**, from 1,200+ registers and sources, in one schema and refreshed monthly. Search a company by name, registration number, address, phone or email, then get the full record: address, registration and VAT number, industry codes, employees, revenue, contacts, executives and the corporate structure (parent, ultimate parent and every company in the group).

One API key covers every country. On the same key: domain enrichment (website in, company out) and location lookups.

- **Docs:** [companydata.com/api-docs](https://companydata.com/api-docs/)
- **KYB / business verification:** [companydata.com/kyb-api](https://companydata.com/kyb-api/)
- **OpenAPI spec:** [companydata.com/openapi.json](https://companydata.com/openapi.json)
- **Get an API key:** [app.companydata.com/signup-api](https://app.companydata.com/signup-api) (7-day trial with 500 searches and 10 exports)
- **Sample data:** [free business datasets](#sample-data) (CSV, no key needed)

## What you can do with it

- **KYB and onboarding:** check that a business exists in the official register, with its registration number, legal form and address. [Due diligence & KYC guide](https://companydata.com/api-docs/use-cases/due-diligence/)
- **Company search and autocomplete:** a company name field in a signup or checkout form that fills in the registered address. [Autocomplete guide](https://companydata.com/api-docs/use-cases/company-search/)
- **CRM and lead enrichment:** complete a record from a name, registration number or website domain with industry, size, revenue and contacts. [Matching a list](https://companydata.com/api-docs/use-cases/matching-a-list/)
- **Corporate structure:** every company in a group, from any member, with local, national and global headquarters. [Corporate structure guide](https://companydata.com/api-docs/use-cases/corporate-structure/)
- **Prospect lists:** filter by country, city, industry (SIC), employees, revenue or founding year and export the matches. [Lead generation guide](https://companydata.com/api-docs/use-cases/lead-generation/)
- **Address search:** find the companies on a street, in a postal code or in a city. [Address search guide](https://companydata.com/api-docs/use-cases/address-search/)

## Quickstart

### 1. REST

Base URL: `https://app.companydata.com`. Send your key in the `x-api-key` header.

```bash
curl -G "https://app.companydata.com/api/company/search" \
  -H "x-api-key: $COMPANYDATA_API_KEY" \
  --data-urlencode "countryCode=NL" \
  --data-urlencode "search=Heineken"
```

```json
{
  "meta": { "totalCount": 3, "currentPage": 1, "totalPages": 1, "pageSize": 25 },
  "data": {
    "records": [
      { "ID": "330114331", "Company Name": "Heineken N.V.", "Country": "Netherlands", "City": "AMSTERDAM" }
    ]
  }
}
```

Pass the `ID` to `/api/company/export` for the full record:

```bash
curl -G "https://app.companydata.com/api/company/export" \
  -H "x-api-key: $COMPANYDATA_API_KEY" \
  --data-urlencode "ID=330114331"
```

### 2. TypeScript SDK

```bash
npm install @companydata/companydata-sdk
```

```typescript
import { ApiClient } from '@companydata/companydata-sdk';

const client = new ApiClient({
  auth: { type: 'apiKey', apiKey: process.env.COMPANYDATA_API_KEY! },
});

const { data } = await client.company.search({ countryCode: 'NL', search: 'Heineken' });

// Every record in a country, page by page
let page = await client.company.exportWithScroll({ countryCode: 'NL', pageSize: 1000 });
while (page.meta.hasMoreRecords) {
  page = await client.company.exportWithScroll({ scrollId: page.meta.scrollId, pageSize: 1000 });
}
```

Repo: [companydatacom/companydata-sdk](https://github.com/companydatacom/companydata-sdk) | npm: [@companydata/companydata-sdk](https://www.npmjs.com/package/@companydata/companydata-sdk) | Docs: [JavaScript SDK](https://companydata.com/api-docs/sdks/javascript/)

#### Per-register SDKs

Thin wrappers over the main SDK, pinned to one country, with a lookup helper for that register. Same record shape.

| Register | Country | npm | Repo |
|---|---|---|---|
| KVK | NL | `@companydata/kvk-api` | [kvk-api](https://github.com/companydatacom/kvk-api) |
| Handelsregister | DE | `@companydata/handelsregister-api` | [handelsregister-api](https://github.com/companydatacom/handelsregister-api) |
| Companies House | GB | `@companydata/companies-house-api` | [companies-house-api](https://github.com/companydatacom/companies-house-api) |
| Sirene | FR | `@companydata/sirene-api` | [sirene-api](https://github.com/companydatacom/sirene-api) |
| KBO/BCE | BE | `@companydata/kbo-api` | [kbo-api](https://github.com/companydatacom/kbo-api) |
| KRS | PL | `@companydata/krs-api` | [krs-api](https://github.com/companydatacom/krs-api) |
| Bolagsverket | SE | `@companydata/bolagsverket-api` | [bolagsverket-api](https://github.com/companydatacom/bolagsverket-api) |
| Zefix | CH | `@companydata/zefix-api` | [zefix-api](https://github.com/companydatacom/zefix-api) |
| ARES | CZ | `@companydata/ares-api` | [ares-api](https://github.com/companydatacom/ares-api) |
| CVR | DK | `@companydata/cvr-api` | [cvr-api](https://github.com/companydatacom/cvr-api) |
| CNPJ | BR | `@companydata/cnpj-api` | [cnpj-api](https://github.com/companydatacom/cnpj-api) |
| ABN Lookup | AU | `@companydata/abn-lookup-api` | [abn-lookup-api](https://github.com/companydatacom/abn-lookup-api) |
| SEC EDGAR | US | `@companydata/sec-edgar-api` | [sec-edgar-api](https://github.com/companydatacom/sec-edgar-api) |

### 3. MCP server (Claude, Cursor and other AI tools)

Hosted, no install:

```bash
claude mcp add --transport http companydata https://companydata.com/mcp/ --header "x-api-key: your_api_key"
```

Cursor (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "companydata": {
      "url": "https://companydata.com/mcp/",
      "headers": { "x-api-key": "your_api_key" }
    }
  }
}
```

Or run it locally with npx (Node.js 18+):

```bash
claude mcp add companydata -e COMPANYDATA_API_KEY=your_api_key -- npx -y @companydata/mcp-server
```

Tools: `company_search`, `company_enrich`, `field_lookup`.

Repo: [companydatacom/companydata-mcp-server](https://github.com/companydatacom/companydata-mcp-server) | npm: [@companydata/mcp-server](https://www.npmjs.com/package/@companydata/mcp-server) | Setup guide: [companydata.com/product/mcp-server](https://companydata.com/product/mcp-server/)

## Endpoints

| Method | Endpoint | What it does |
|---|---|---|
| GET | `/api/company/search` | Find companies by name, registration number, address, phone, email or filters. Light records (ID, name, country), up to 50 results |
| GET | `/api/company/export` | Full company records for an `ID` or a filter, with standard or scroll pagination for any number of records |
| GET | `/api/website/html` | Domain enrichment: download a website and return the company candidates in it (registration and VAT numbers, JSON-LD, imprint) |
| GET | `/api/cities` | Exact city names to use in the `cityName` filter |

Full reference with parameters, error codes and response examples: [companydata.com/api-docs](https://companydata.com/api-docs/).

### Filters

The same filters work on search and export. A selection:

| Parameter | Filters on |
|---|---|
| `search` | Company name |
| `nationalId` | Registration number (add `countryCode`) |
| `countryCode` | ISO 2-letter country code ([list](https://companydata.com/api-docs/countries/)) |
| `cityName`, `postalCode`, `streetName`, `provinceName` | Address ([address search](https://companydata.com/api-docs/use-cases/address-search/)) |
| `phoneNumber`, `mobileNumber`, `email` | Contact details |
| `sic4Digits` | 4-digit SIC industry code |
| `employeesTotal`, `annualSales`, `foundingYears` | Size, revenue and age |
| `worldwideHeadquarterID` | Every company in a corporate group |
| `hasEmail`, `hasPhone`, `hasWebsite`, `hasCEOName`, ... | Records that have that field |

All filters: [Company search & export](https://companydata.com/api-docs/request-company/).

## The company record

Export returns flat records under `data.records`. Fields include:

- **Identity:** company name, trade name, registration number and type, legal form, founding year
- **Address:** street, postal code, city, state or province, country
- **Industry:** SIC codes with descriptions
- **Size:** employees on site and in total, yearly revenue in local currency and USD, each marked reported or modelled
- **Contacts:** website, email, phone, CEO name and title, executives
- **Corporate structure:** local, national and global headquarters (ID, name, address), location type, subsidiary code, number of companies in the group

Which fields you get depends on your plan. Every field: [Response fields](https://companydata.com/api-docs/returned-fields/) and the [data dictionary](https://companydata.com/data-dictionary/).

### Corporate structure in two calls

```bash
# 1. Find the company and read its "Global Headquarter ID Number"
curl -G "https://app.companydata.com/api/company/export" \
  -H "x-api-key: $COMPANYDATA_API_KEY" \
  --data-urlencode "ID=330114331"

# 2. Every company in that group
curl -G "https://app.companydata.com/api/company/export" \
  -H "x-api-key: $COMPANYDATA_API_KEY" \
  --data-urlencode "worldwideHeadquarterID=<Global Headquarter ID Number>"
```

The whole group as a JSON tree, in one command ([`examples/corporate-hierarchy.mjs`](examples/corporate-hierarchy.mjs), Node.js 18+, no dependencies):

```bash
COMPANYDATA_API_KEY=your_api_key node examples/corporate-hierarchy.mjs --search "Amazon.com" --country US > amazon.json
```

It exports every company with the group's `worldwideHeadquarterID` (scroll pagination, so nothing is skipped) and hangs each one under its local, then national, then global headquarters. Walkthrough with a tree view: [Corporate structure](https://companydata.com/api-docs/use-cases/corporate-structure/).

## Sample data

Free CSV samples of the 1,000 largest companies in eight cities, in the same fields as the API (CC0 license). No API key needed.

| City | Sample CSV |
|---|---|
| Amsterdam | [amsterdam-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/amsterdam) |
| Berlin | [berlin-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/berlin) |
| London | [london-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/london) |
| Paris | [paris-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/paris) |
| Madrid | [madrid-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/madrid) |
| Rome | [rome-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/rome) |
| New York City | [new-york-city-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/new-york-city) |
| Los Angeles | [los-angeles-business-dataset-sample.csv](https://github.com/companydatacom/public-datasets/tree/main/datasets/los-angeles) |

A few rows from those files:

| Company | City | Industry (SIC) | Revenue (USD) | Global headquarters | Companies in group |
|---|---|---|---|---|---|
| Zalando SE | Berlin | 5961 Catalog and Mail-Order Houses | $11.0B | Zalando SE, Germany | 108 |
| 50hertz Transmission GmbH | Berlin | 4911 Electric Services | $11.0B | Elia Group, Belgium | 47 |
| Endesa Energia SAU | Madrid | 4911 Electric Services | $20.5B | Enel SpA, Italy | 2,461 |
| Repsol Petroleo SA | Madrid | 2911 Petroleum Refining | $31.4B | Repsol SA, Spain | 1,991 |
| CBRE GWS Integrated Facility Management B.V. | Amsterdam | 6719 Offices of Holding Companies | $321M | CBRE Group, Inc., United States | 2,001 |
| Adobe Inc. | Los Angeles | 7372 Prepackaged Software | $19.4B | Adobe Inc., United States | 146 |
| Oaktree Capital Management, L.P. | Los Angeles | 6282 Investment Advice | $4.9B | Brookfield Corporation, Canada | 153 |

- **Build a city file yourself:** [`examples/city-dataset.mjs`](examples/city-dataset.mjs) exports the largest companies in any city, by revenue, with IDs and registration numbers kept as text:
  ```bash
  COMPANYDATA_API_KEY=your_api_key node examples/city-dataset.mjs --country NL --city AMSTERDAM --limit 1000 > amsterdam.csv
  ```
- **All companies in a city:** [companydata.com/free-business-datasets](https://companydata.com/free-business-datasets/)
- **A sample of your own selection** (country, industry, size), within 24 hours: [companydata.com/request-data](https://companydata.com/request-data/)
- **Look up one company for free:** [companydata.com/company-lookup](https://companydata.com/company-lookup/)

## Limits

- 50 requests per second per key by default; above that the API returns `429`.
- Monthly searches, export credits and requests depend on the plan. Responses carry headers with what is left, and a `429` names the limit and when it resets.
- Details: [Authentication](https://companydata.com/api-docs/authentication/).

## Links

- Product page: [companydata.com/company-data-api](https://companydata.com/company-data-api/)
- API docs: [companydata.com/api-docs](https://companydata.com/api-docs/)
- Quickstart: [companydata.com/api-docs/quickstart](https://companydata.com/api-docs/quickstart/)
- OpenAPI spec: [companydata.com/openapi.json](https://companydata.com/openapi.json)
- Docs for LLMs: [companydata.com/llms-full.txt](https://companydata.com/llms-full.txt)
- Pricing: [companydata.com/pricing](https://companydata.com/pricing/)
- All APIs, including per-register APIs: [companydata.com/apis](https://companydata.com/apis/)
- Data sources: [companydata.com/our-data](https://companydata.com/our-data/)
- Contact: [companydata.com/contact](https://companydata.com/contact/)
