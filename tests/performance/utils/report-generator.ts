// cspell:ignore Segoe
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { ArtilleryResults } from './metrics-analyzer';
import { analyzePerformanceResults } from './metrics-analyzer';

export interface ReportOptions {
  outputDir?: string;
  filename?: string;
}

export function generatePerformanceReport(
  results: ArtilleryResults,
  options: ReportOptions = {},
): string {
  const { outputDir: outputDirectory = 'test-output/performance-reports', filename } = options;

  const analysis = analyzePerformanceResults(results);
  const timestamp = new Date().toISOString().replaceAll(':', '-');
  const reportFilename = filename || `performance-report-${timestamp}.json`;

  const report = {
    timestamp: new Date().toISOString(),
    results,
    analysis: analysis.metrics,
    summary: analysis.summary,
  };

  const reportPath = path.join(outputDirectory, reportFilename);
  writeFileSync(reportPath, JSON.stringify(report, undefined, 2));

  return reportPath;
}

export function generateHTMLReport(results: ArtilleryResults, options: ReportOptions = {}): string {
  const { outputDir: outputDirectory = 'test-output/performance-reports', filename } = options;

  const analysis = analyzePerformanceResults(results);
  const timestamp = new Date().toISOString().replaceAll(':', '-');
  const reportFilename = filename || `performance-report-${timestamp}.html`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Performance Test Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 2em;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .metric-value {
      font-size: 2em;
      font-weight: bold;
      color: #333;
    }
    .metric-label {
      color: #666;
      font-size: 0.9em;
      margin-top: 5px;
    }
    .latency-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .timestamp {
      color: #999;
      font-size: 0.9em;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Performance Test Report</h1>
    <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
  </div>

  <div class="metrics">
    <div class="metric-card">
      <h3>Requests Completed</h3>
      <div class="metric-value">${results.aggregate.requests.completed.toLocaleString()}</div>
      <div class="metric-label">${results.aggregate.requests.failed} failed</div>
    </div>

    <div class="metric-card">
      <h3>Error Rate</h3>
      <div class="metric-value">${(analysis.metrics['errorRate'] as number).toFixed(2)}%</div>
      <div class="metric-label">of total requests</div>
    </div>

    <div class="metric-card">
      <h3>Throughput</h3>
      <div class="metric-value">${(analysis.metrics['throughput'] as number).toFixed(2)}</div>
      <div class="metric-label">requests/second</div>
    </div>
  </div>

  <div class="metric-card">
    <h3>Latency Percentiles</h3>
    <div class="latency-grid">
      <div>
        <div class="metric-label">Mean</div>
        <div class="metric-value" style="font-size: 1.5em;">${results.aggregate.latency.mean}ms</div>
      </div>
      <div>
        <div class="metric-label">P50</div>
        <div class="metric-value" style="font-size: 1.5em;">${results.aggregate.latency.p50}ms</div>
      </div>
      <div>
        <div class="metric-label">P95</div>
        <div class="metric-value" style="font-size: 1.5em;">${results.aggregate.latency.p95}ms</div>
      </div>
      <div>
        <div class="metric-label">P99</div>
        <div class="metric-value" style="font-size: 1.5em;">${results.aggregate.latency.p99}ms</div>
      </div>
    </div>
  </div>

  <pre style="background: white; padding: 20px; border-radius: 8px; overflow-x: auto;">${analysis.summary}</pre>
</body>
</html>
  `.trim();

  const reportPath = path.join(outputDirectory, reportFilename);
  writeFileSync(reportPath, html);

  return reportPath;
}
