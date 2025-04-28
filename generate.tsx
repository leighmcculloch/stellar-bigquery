/** @jsx h */
/** @jsxFrag Fragment */
import { h, Fragment } from "npm:preact";
import { renderToString } from "npm:preact-render-to-string";
import { walk } from "jsr:@std/fs";
import { basename, extname } from "jsr:@std/path";
import { parse as parseFlags } from "jsr:@std/flags";
import { parse as parseCSV } from "jsr:@std/csv/parse";

type Query = {
  name: string;
  path: string;
  content: string;
  displayName: string;
  result?: string;
  generatedAt?: string; // Timestamp when the results were generated
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

function copyToClipboard(text: string, buttonId: string = null): string {
  return `
    navigator.clipboard.writeText(\`${text.replace(/`/g, "\\`")}\`)
      .then(() => {
        if ('${buttonId}') {
          const btn = document.getElementById('${buttonId}');
          if (btn) {
            const originalText = btn.innerHTML;
            const originalBg = btn.className;
            btn.innerHTML = 'Copied!';
            btn.className = btn.className.replace('bg-gray-100 hover:bg-gray-200', 'bg-green-100 text-green-700');
            setTimeout(() => { 
              btn.innerHTML = originalText;
              btn.className = originalBg;
            }, 1500);
          }
        }
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
  const hasResult = !!query.result;

  return (
    <div
      className="query-container my-12 bg-white rounded-lg shadow-md overflow-hidden"
      id={query.name}
    >
      <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {query.displayName}
        </h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
            <code className="font-mono text-xs truncate">{query.path}</code>
          </span>
          <a
            href={githubUrl}
            target="_blank"
            className="inline-flex items-center px-3 py-1 rounded-md bg-indigo-50 text-sm text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition-colors duration-200"
            title="View on GitHub"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-4 h-4 mr-1 flex-shrink-0"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
      
      {/* Tabs for Query and Results */}
      {hasResult ? (
        <div>
          {/* Tab Header with Relative Positioning for Button Container */}
          <div className="relative flex border-b border-gray-200">
            {/* Tab Buttons */}
            <button 
              className="py-2 px-4 font-medium text-sm focus:outline-none tab-btn active"
              data-tab-type="query"
              data-target={`${query.name}-query`}
              data-query-name={query.name}
              onClick={`
                // Toggle tabs
                const button = event.currentTarget;
                const tabType = button.getAttribute('data-tab-type');
                const tabContainer = button.closest('.relative');
                const queryName = button.getAttribute('data-query-name');
                const targetId = button.getAttribute('data-target');
                
                // Deactivate all buttons in this tab group
                const siblingBtns = tabContainer.querySelectorAll('.tab-btn');
                siblingBtns.forEach(btn => btn.classList.remove('active'));
                
                // Activate clicked button
                button.classList.add('active');
                
                // Show selected content, hide others
                const contents = document.querySelectorAll('[id^="${query.name}-"]');
                contents.forEach(content => content.classList.add('hidden'));
                document.getElementById(targetId).classList.remove('hidden');
                
                // Show/hide action buttons based on active tab
                const actionContainer = tabContainer.querySelector('.tab-actions');
                if (actionContainer) {
                  const allActionButtons = actionContainer.querySelectorAll('button, a');
                  allActionButtons.forEach(btn => btn.style.display = 'none');
                  
                  if (tabType === 'query') {
                    const sqlBtn = actionContainer.querySelector('#copy-sql-${query.name}');
                    const bqBtn = actionContainer.querySelector('#copy-bq-${query.name}');
                    if (sqlBtn) sqlBtn.style.display = 'inline-flex';
                    if (bqBtn) bqBtn.style.display = 'inline-flex';
                  } else if (tabType === 'result') {
                    const csvBtn = actionContainer.querySelector('#copy-csv-${query.name}');
                    if (csvBtn) csvBtn.style.display = 'inline-flex';
                  }
                }
              `}
            >
              Query
            </button>
            <button 
              className="py-2 px-4 font-medium text-sm focus:outline-none tab-btn"
              data-tab-type="result"
              data-target={`${query.name}-result`}
              data-query-name={query.name}
              onClick={`
                // Toggle tabs
                const button = event.currentTarget;
                const tabType = button.getAttribute('data-tab-type');
                const tabContainer = button.closest('.relative');
                const queryName = button.getAttribute('data-query-name');
                const targetId = button.getAttribute('data-target');
                
                // Deactivate all buttons in this tab group
                const siblingBtns = tabContainer.querySelectorAll('.tab-btn');
                siblingBtns.forEach(btn => btn.classList.remove('active'));
                
                // Activate clicked button
                button.classList.add('active');
                
                // Show selected content, hide others
                const contents = document.querySelectorAll('[id^="${query.name}-"]');
                contents.forEach(content => content.classList.add('hidden'));
                document.getElementById(targetId).classList.remove('hidden');
                
                // Show/hide action buttons based on active tab
                const actionContainer = tabContainer.querySelector('.tab-actions');
                if (actionContainer) {
                  const allActionButtons = actionContainer.querySelectorAll('button, a');
                  allActionButtons.forEach(btn => btn.style.display = 'none');
                  
                  if (tabType === 'query') {
                    const sqlBtn = actionContainer.querySelector('#copy-sql-${query.name}');
                    const bqBtn = actionContainer.querySelector('#copy-bq-${query.name}');
                    if (sqlBtn) sqlBtn.style.display = 'inline-flex';
                    if (bqBtn) bqBtn.style.display = 'inline-flex';
                  } else if (tabType === 'result') {
                    const csvBtn = actionContainer.querySelector('#copy-csv-${query.name}');
                    if (csvBtn) csvBtn.style.display = 'inline-flex';
                  }
                }
              `}
            >
              Sample Results
            </button>
            
            {/* Action Buttons Container */}
            <div className="tab-actions absolute top-0 right-0 pt-1 pr-1 flex gap-1">
              {/* Copy SQL Button */}
              <button
                id={`copy-sql-${query.name}`}
                onClick={copyToClipboard(query.content, `copy-sql-${query.name}`)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors duration-200 shadow-sm font-medium"
                title="Copy SQL to clipboard"
                style="display: inline-flex;" // Show by default for Query tab
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
                Copy Query
              </button>
              
              {/* Copy & Open BigQuery Button */}
              <a
                id={`copy-bq-${query.name}`}
                href={getBigQueryUrl(query.content)}
                target="_blank"
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors duration-200 shadow-sm font-medium"
                title="Copy SQL & Open in BigQuery"
                style="display: inline-flex;" // Show by default for Query tab
                onClick={`event.preventDefault(); ${
                  copyToClipboard(query.content)
                }; window.open('${getBigQueryUrl(query.content)}', '_blank');`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Copy Query & Open BigQuery
              </a>
              
              {/* Copy CSV Button */}
              <button
                id={`copy-csv-${query.name}`}
                onClick={copyToClipboard(query.result, `copy-csv-${query.name}`)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors duration-200 shadow-sm font-medium"
                title="Copy CSV to clipboard"
                style="display: none;" // Hidden by default, shown when Results tab is active
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
                Copy CSV
              </button>
            </div>
          </div>
          
          {/* Tab Content Panes */}
          <div id={`${query.name}-query`} className="tab-content">
            <pre className="p-0 m-0 bg-gray-50 overflow-auto">
              <code className="language-sql p-6 block">{query.content}</code>
            </pre>
          </div>
          
          <div id={`${query.name}-result`} className="tab-content hidden">
            {/* Warning banner for historical data with same padding as content */}
            <div className="p-6 bg-gray-50">
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm">
                <p className="font-bold">Heads up!</p>
                <p className="text-sm">
                  These sample results were generated at an earlier time and are not automatically updated. 
                  For the most current data, please run the query directly against BigQuery.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 overflow-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {query.result && renderCsvTable(query.result)}
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Single Tab with Buttons for Query-only view */}
          <div className="relative flex border-b border-gray-200">
            <div className="py-2 px-4 font-medium text-sm focus:outline-none tab-btn active">
              Query
            </div>
            
            {/* Action Buttons Container */}
            <div className="tab-actions absolute top-0 right-0 pt-1 pr-1 flex gap-1">
              {/* Copy SQL Button */}
              <button
                id={`copy-sql-solo-${query.name}`}
                onClick={copyToClipboard(query.content, `copy-sql-solo-${query.name}`)}
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors duration-200 shadow-sm font-medium"
                title="Copy SQL to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
                Copy Query
              </button>
              
              {/* Copy & Open BigQuery Button */}
              <a
                id={`copy-bq-solo-${query.name}`}
                href={getBigQueryUrl(query.content)}
                target="_blank"
                className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs transition-colors duration-200 shadow-sm font-medium"
                title="Copy SQL & Open in BigQuery"
                onClick={`event.preventDefault(); ${
                  copyToClipboard(query.content)
                }; window.open('${getBigQueryUrl(query.content)}', '_blank');`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Copy Query & Open BigQuery
              </a>
            </div>
          </div>
          
          <pre className="p-0 m-0 bg-gray-50 overflow-auto">
            <code className="language-sql p-6 block">{query.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

function renderCsvTable(csvContent: string) {
  try {
    // Parse the CSV data
    // First, we need to get the headers from the first line
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) {
      return <tbody><tr><td className="p-4">CSV has no data.</td></tr></tbody>;
    }
    
    const headers = lines[0].split(',');
    
    // Now parse the rows with the Deno standard library
    const result = parseCSV(csvContent);
    if (!result.length) {
      return <tbody><tr><td className="p-4">CSV has no data.</td></tr></tbody>;
    }
    
    // Skip the header row
    const rows = result.slice(1);
    
    return (
      <>
        <thead className="bg-gray-100">
          <tr>
            {headers.map((header, i) => (
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" key={i}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((rowData, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {rowData.map((cellValue, cellIndex) => {
                return (
                  <td className="px-4 py-3 text-sm text-gray-500" key={cellIndex}>
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </>
    );
  } catch (error) {
    // Handle CSV parsing errors
    console.error("CSV Parsing Error:", error.message);
    return (
      <tbody>
        <tr>
          <td colSpan={1} className="text-red-500 p-4">
            Error parsing CSV data: {error.message}
          </td>
        </tr>
      </tbody>
    );
  }
}


function Layout({ queries }: { queries: Query[] }) {
  const timestamp = new Date().toISOString();
  return (
    <Fragment>
      <header className="bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Leigh's Stellar BigQuery Queries
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
            <p className="text-gray-600 mb-6 leading-relaxed">
              A collection of BigQuery queries that I,{" "}
              <a
                href="https://leighm.cc"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
              >
                Leigh
              </a>, have found personally helpful when using{" "}
              <a
                href="https://developers.stellar.org/docs/data/analytics/hubble"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
              >
                Stellar Hubble
              </a>. Stellar Hubble is the public BigQuery repository
              containing historical/archive data for the{" "}
              <a
                href="https://stellar.org"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
              >
                Stellar Network
              </a>. These queries are not intended for general consumption and
              collect data specific to the use cases I have encountered. Use
              at your own risk.
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
    </Fragment>
  );
}

async function generateHtml(): Promise<string> {
  const queries: Query[] = [];
  const resultFiles = new Map<string, string>();
  const resultTimestamps = new Map<string, string>();

  // Collect result files first
  try {
    for await (
      const entry of walk("./results", {
        includeDirs: false,
        exts: [".csv"],
      })
    ) {
      const name = basename(entry.path, ".csv");
      const content = await Deno.readTextFile(entry.path);
      resultFiles.set(name, content);
      
      // Get file modification time for the timestamp
      try {
        const fileInfo = await Deno.stat(entry.path);
        if (fileInfo.mtime) {
          // Format the date nicely
          const date = new Date(fileInfo.mtime);
          const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          resultTimestamps.set(name, formattedDate);
        }
      } catch (statError) {
        console.error(`Warning: Could not get file info for ${entry.path}: ${statError.message}`);
      }
    }
  } catch (error) {
    // Handle case where results directory might not exist
    console.error(`Warning: Error accessing results directory: ${error.message}`);
  }

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
    
    // Check if there's a matching result file
    const result = resultFiles.has(name) ? resultFiles.get(name) : undefined;
    const generatedAt = resultTimestamps.has(name) ? resultTimestamps.get(name) : undefined;
    
    queries.push({ name, path: entry.path, content, displayName, result, generatedAt });
  }

  // Sort queries alphabetically
  queries.sort((a, b) => a.name.localeCompare(b.name));

  // Create HTML head section
  const headContent = `
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Leigh's Stellar BigQuery Queries</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/atom-one-light.min.css"
    />
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/languages/sql.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
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
    </script>
    <style>
      /* Tab styling */
      .tab-btn.active {
        border-bottom: 2px solid #6366f1;
        color: #4f46e5;
      }
      .tab-btn:not(.active) {
        color: #6b7280;
      }
      .tab-btn:not(.active):hover {
        color: #4f46e5;
        background-color: #f9fafb;
      }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  `;
  
  // Generate the body content using Preact
  const bodyContent = renderToString(<Layout queries={queries} />);
  
  // Create final script section
  const scripts = `
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      hljs.highlightAll();
      
      // Initialize tabs and action buttons for each query container
      document.querySelectorAll('.tab-btn[data-tab-type="query"]').forEach(btn => {
        // Set the Query tab as active by default
        btn.classList.add('active');
        
        // Show Query tab action buttons
        const tabContainer = btn.closest('.relative');
        if (tabContainer) {
          const queryName = btn.getAttribute('data-query-name');
          
          if (queryName) {
            const sqlBtn = document.getElementById(\`copy-sql-\${queryName}\`);
            const bqBtn = document.getElementById(\`copy-bq-\${queryName}\`);
            
            if (sqlBtn) sqlBtn.style.display = 'inline-flex';
            if (bqBtn) bqBtn.style.display = 'inline-flex';
          }
          
          // Hide Result tab action buttons
          const csvBtn = tabContainer.querySelector('button[id^="copy-csv-"]');
          if (csvBtn) csvBtn.style.display = 'none';
        }
      });
      
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
  </script>
  `;

  // Assemble the final HTML
  const html = `<!DOCTYPE html>
<html lang="en">
${headContent}
<body class="bg-gray-50 min-h-screen" id="top">
  ${bodyContent}
  ${scripts}
</body>
</html>`;

  return html;
}

async function main() {
  const args = parseFlags(Deno.args);
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
