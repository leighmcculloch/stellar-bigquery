# Claude Instructions

This document contains instructions for Claude to assist with this repository.

## Repository Context

This repository contains SQL queries for BigQuery used for querying Stellar blockchain data. It includes:

- SQL queries in the `queries/` directory
- Schema files in the `schema/` directory
- Results from running the queries are in the `results/` directory
- A Deno script (`generate.tsx`) that generates a static website to display the SQL queries

The schema and queries in this repository refer to and use the publicly available Stellar blockchain BigQuery data.

## Key Tasks

When working with this repository, Claude may be asked to:

1. Modify or create SQL queries for BigQuery using Stellar data
2. Update the Deno script that generates the static site
3. Help with GitHub Pages deployment workflow
4. Explain BigQuery schema and data structures
5. Troubleshoot BigQuery integration issues

## Website Generation

The repository includes a Deno script that generates a static website to view all SQL queries:

```bash
# Run the generator script
deno run --allow-read --allow-write generate.tsx
```

The generated HTML will be saved to `dist/index.html` by default. To specify a custom output path:

```bash
deno run --allow-read --allow-write generate.tsx --output custom/path/index.html
```

## SQL Query Approach

When working with SQL queries in this repository:

1. Use standard BigQuery SQL syntax
1. When asked to write a query, always assume it is a new query and write it to a new file in the `queries/` folder, named appropriately, without modifying any existing files.
1. Follow Stellar data model conventions, using the schema files as a reference
1. Optimize for readability and performance
1. Include clear comments explaining complex logic
1. Consider potential query cost when working with large tables

