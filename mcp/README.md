# MCP: let your agent look companies up

The hosted server needs no install. It has three tools: `company_search`, `company_enrich` and `field_lookup`.

## Claude Code

```bash
claude mcp add --transport http companydata https://companydata.com/mcp/ \
  --header "x-api-key: your_api_key"
```

## Cursor

Copy [`cursor-mcp.json`](cursor-mcp.json) to `.cursor/mcp.json` in your project and put your key in it.

## Prompts to try

- "Find Heineken N.V. in the Netherlands and give me its registration number and address."
- "Which company is the ultimate parent of this supplier, and how many companies are in the group?"
- "Here are five company names with their countries. Match each to its registered company and tell me which matches you are unsure about."

## Two things to know

- MCP is the API with a model in the loop: same data, same credits, less determinism. Where you need the same answer every time, call the API instead (see [`../api/`](../api/)).
- Whatever a tool returns goes into the model's context, so it is sent to your AI provider. Keep that in mind for records with people in them (directors, contacts).
