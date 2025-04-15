# BigQuery SQL Queries

This repository contains SQL queries for analyzing muxed account data in BigQuery.

## Directory Structure

- `queries/`: Contains SQL query files
- `schema/`: Contains BigQuery schema definitions
- `.github/workflows/`: GitHub Actions workflow configurations

## Generating Static Website

This repository includes a Deno script that generates a static website using JSX to view all SQL queries.

To run locally:

```bash
# Install Deno if you haven't already
# Run the generator script
deno run --allow-read --allow-write generate.tsx
```

The generated HTML will be saved to `dist/index.html` by default. You can specify a custom output path:

```bash
deno run --allow-read --allow-write generate.tsx --output custom/path/index.html
```

## GitHub Pages Deployment

The repository is configured with a GitHub Actions workflow that automatically builds and deploys the static website to GitHub Pages whenever changes are pushed to the main branch.

The deployed site displays all SQL queries with syntax highlighting and a table of contents for easy navigation.