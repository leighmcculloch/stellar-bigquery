/** @jsx h */
/** @jsxFrag Fragment */
import { h } from "npm:preact";
import { renderToString } from "npm:preact-render-to-string";
import { walk } from "jsr:@std/fs";
import { basename, extname } from "jsr:@std/path";
import { parse } from "jsr:@std/flags";

type Query = {
  name: string;
  path: string;
  content: string;
  displayName: string;
};

function QueryList({ queries }: { queries: Query[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {queries.map((q) => (
        <a
          key={q.name}
          href={`#${q.name}`}
          className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100 hover:border-indigo-100 flex items-center"
        >
          <div className="mr-3 text-indigo-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <span className="text-gray-800 font-medium">{q.displayName}</span>
        </a>
      ))}
    </div>
  );
}

function getBigQueryUrl(sql: string): string {
  // Simply create a URL to the BigQuery console
  // We can't directly pass SQL in the URL because of length restrictions
  // and encoding issues, so we'll handle it with copy to clipboard instead
  return "https://console.cloud.google.com/bigquery";
}

function copyToClipboard(text: string): string {
  return `
    navigator.clipboard.writeText(\`${text.replace(/`/g, "\\`")}\`)
      .then(() => {
        const btn = document.getElementById('copy-btn-${text.length}');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Copied!';
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  `;
}

function QueryDisplay({ query }: { query: Query }) {
  // Extract filename without extension for GitHub link
  const filename = query.path.split("/").pop()?.replace(".sql", "") || "";
  const githubUrl =
    `https://github.com/leighmcculloch/stellar-bigquery/blob/main/queries/${filename}.sql`;

  return (
    <div
      className="query-container my-12 bg-white rounded-lg shadow-md overflow-hidden"
      id={query.name}
    >
      <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {query.displayName}
          </h2>
          <div className="flex flex-wrap gap-3 mt-2">
            <p className="text-sm text-gray-600 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 mr-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <code className="font-mono text-xs">{query.path}</code>
            </p>
            <a
              href={githubUrl}
              target="_blank"
              className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              title="View on GitHub"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="w-4 h-4 mr-1"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            id={`copy-btn-${query.content.length}`}
            onClick={copyToClipboard(query.content)}
            className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm transition-colors duration-200 shadow-sm"
            title="Copy SQL to clipboard"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
              />
            </svg>
            Copy SQL
          </button>
          <a
            href={getBigQueryUrl(query.content)}
            target="_blank"
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm transition-colors duration-200 shadow-sm"
            title="Open in BigQuery (copy SQL first)"
            onClick={`event.preventDefault(); ${
              copyToClipboard(query.content)
            }; window.open('${getBigQueryUrl(query.content)}', '_blank');`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
            Copy & Open BigQuery
          </a>
        </div>
      </div>
      <pre className="p-0 m-0 bg-gray-50 overflow-auto">
        <code className="language-sql p-6 block">{query.content}</code>
      </pre>
    </div>
  );
}

function Layout({ queries }: { queries: Query[] }) {
  const timestamp = new Date().toISOString();
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Leigh's Stellar BigQuery Queries</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/atom-one-light.min.css"
        />
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js">
        </script>
        <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/languages/sql.min.js">
        </script>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
          {`
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
                  mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'monospace']
                }
              }
            }
          }
        `}
        </script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-50 min-h-screen" id="top">
        <header className="bg-white border-b border-gray-200 z-10 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Leigh's BigQuery SQL Queries
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Updated: {new Date(timestamp).toLocaleString()}
                </p>
              </div>
              <a
                href="https://github.com/leighmcculloch/stellar-bigquery"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-5 h-5 mr-2"
                >
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span className="text-sm">leighmcculloch/stellar-bigquery</span>
              </a>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <section className="mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <p className="text-gray-600 mb-6">
                A collection of BigQuery queries for the{" "}
                <a href="https://developers.stellar.org/docs/data/analytics/hubble">
                  public Stellar blockchain data
                </a>. Click any query to view its content.
              </p>
              <QueryList queries={queries} />
            </div>
          </section>

          <section>
            {queries.map((query) => (
              <QueryDisplay
                key={query.name}
                query={query}
              />
            ))}
          </section>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-600 text-sm">
              Leigh's Stellar BigQuery Queries •{" "}
              <a
                href="https://github.com/leighmcculloch/stellar-bigquery"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                GitHub Repository
              </a>
            </p>
          </div>
        </footer>

        <button
          onClick="window.scrollTo({top: 0, behavior: 'smooth'})"
          className="fixed bottom-4 right-4 bg-indigo-600 text-white p-2 rounded-full shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          id="back-to-top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 15.75 7.5-7.5 7.5 7.5"
            />
          </svg>
        </button>

        <script>
          {`
          document.addEventListener('DOMContentLoaded', () => {
            hljs.highlightAll();
            
            // Add smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
              anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                  window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                  });
                }
              });
            });
            
            // Show/hide back to top button
            const backToTopButton = document.getElementById('back-to-top');
            window.addEventListener('scroll', () => {
              if (window.scrollY > 300) {
                backToTopButton.classList.remove('hidden');
              } else {
                backToTopButton.classList.add('hidden');
              }
            });
          });
        `}
        </script>
      </body>
    </html>
  );
}

async function generateHtml(): Promise<string> {
  const queries: Query[] = [];

  // Walk through the queries directory and collect SQL files
  for await (
    const entry of walk("./queries", {
      includeDirs: false,
      exts: [".sql"],
    })
  ) {
    const name = basename(entry.path, ".sql");
    const displayName = name.replace(/_/g, " ");
    const content = await Deno.readTextFile(entry.path);
    queries.push({ name, path: entry.path, content, displayName });
  }

  // Sort queries alphabetically
  queries.sort((a, b) => a.name.localeCompare(b.name));

  // Generate HTML using JSX
  const html = "<!DOCTYPE html>\n" +
    renderToString(<Layout queries={queries} />);
  return html;
}

async function main() {
  const args = parse(Deno.args);
  const outputPath = args.output || "dist/index.html";

  // Create output directory if it doesn't exist
  const outputDir = outputPath.split("/").slice(0, -1).join("/");
  if (outputDir) {
    try {
      await Deno.mkdir(outputDir, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }
  }

  // Generate HTML
  const html = await generateHtml();

  // Write to file
  await Deno.writeTextFile(outputPath, html);

  console.log(`HTML generated at ${outputPath}`);
}

if (import.meta.main) {
  main();
}
