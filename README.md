# Company data examples: bulk file, API and MCP

Three small, runnable examples of getting company data into your own stack. Each folder is one route:

| Folder | Route | You get | Use it when |
|---|---|---|---|
| [`bulk/`](bulk/) | Bulk feed in your warehouse | SQL to query and refresh a company file with DuckDB | You query the same market again and again, or build the data into your product |
| [`api/`](api/) | Real-time API in your backend | A matcher and a cache in TypeScript, no dependencies | You look up one company at a time: signup, onboarding, KYB |
| [`mcp/`](mcp/) | MCP server for AI agents | Config for Claude Code and Cursor, plus prompts to try | An agent or assistant has to look companies up itself |

The reasoning behind the three routes (cost, freshness, what you may store) is in the write-up on dev.to: [Bulk file, API or MCP: how to get company data into your app in 2026](https://dev.to/companydata/bulk-file-api-or-mcp-how-to-get-company-data-into-your-app-in-2026-3hen).

## Before you start

The API and MCP examples need a key: [get one here](https://app.companydata.com/signup-api), then

```bash
export COMPANYDATA_API_KEY=your_api_key
```

The bulk example runs out of the box on [`sample/companies.csv`](sample/companies.csv): 547 Dutch software companies with registration number, address, industry codes, size, revenue and group structure. No contact names, emails or phone numbers. Want the countries you need? Ask for a [free sample](https://companydata.com/company-database/).

## Run them

```bash
# bulk: needs DuckDB (https://duckdb.org)
duckdb < bulk/query.sql

# api: needs Node.js 18+
npx tsx api/find-company.ts

# mcp: add the hosted server to Claude Code
claude mcp add --transport http companydata https://companydata.com/mcp/ \
  --header "x-api-key: $COMPANYDATA_API_KEY"
```

## One rule that holds for all three

Key your own tables on the **registration number plus country**, and keep the provider's record `ID` next to it. Names change and collide; those two do not. It is also what lets a record you loaded from a file be the same record your API call and your agent see.

## More

- [API reference](https://companydata.com/api-docs/) and [OpenAPI spec](https://companydata.com/openapi.json)
- [TypeScript SDK](https://github.com/companydatacom/companydata-sdk)
- [MCP server](https://github.com/companydatacom/companydata-mcp-server)
