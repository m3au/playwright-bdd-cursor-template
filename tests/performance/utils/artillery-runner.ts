// cspell:ignore vusers
import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect } from '@playwright/test';

import type { ArtilleryResults } from './metrics-analyzer';

export interface ArtilleryRunOptions {
  config: string;
  output?: string;
  environment?: string;
}

export interface ArtilleryRunResult {
  success: boolean;
  results?: ArtilleryResults;
  error?: string;
  output?: string;
}

export function expectArtilleryLoadSucceeded(
  result: ArtilleryRunResult,
  maxErrorRate = 0.01,
): void {
  expect(result.success).toBe(true);
  const aggregate = result.results?.aggregate;
  expect(aggregate).toBeDefined();
  if (!aggregate) {
    return;
  }
  expect(aggregate.requests.completed).toBeGreaterThan(0);
  const totalRequests = aggregate.requests.completed + aggregate.requests.failed;
  expect(aggregate.errors).toBeLessThan(totalRequests * maxErrorRate);
}

export async function runArtilleryTest(options: ArtilleryRunOptions): Promise<ArtilleryRunResult> {
  const { config, output, environment } = options;

  if (!existsSync(config)) {
    return {
      success: false,
      error: `Artillery config file not found: ${config}`,
    };
  }

  const projectRoot = process.cwd();
  const artilleryBin = existsSync(path.join(projectRoot, 'node_modules', '.bin', 'artillery'))
    ? path.join(projectRoot, 'node_modules', '.bin', 'artillery')
    : 'bunx artillery';

  const outputPath = output || path.join(projectRoot, 'test-output', 'artillery-temp.json');
  const outputDirectory = outputPath.slice(
    0,
    Math.max(0, outputPath.lastIndexOf('/') || outputPath.lastIndexOf('\\')),
  );

  if (outputDirectory && outputDirectory !== outputPath) {
    await mkdir(outputDirectory, { recursive: true }).catch(() => {
      // Directory might already exist
    });
  }

  const arguments_: string[] = ['run', config, '--output', outputPath];

  if (environment) {
    arguments_.push('--environment', environment);
  }

  return new Promise((resolve) => {
    const artilleryProcess = spawn(artilleryBin, arguments_, {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...(environment ? { NODE_ENV: environment } : {}),
      },
    });

    let stdout = '';
    let stderr = '';

    artilleryProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    artilleryProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    artilleryProcess.on('error', (error) => {
      resolve({
        success: false,
        error: `Failed to run Artillery: ${error.message}`,
        output: stderr,
      });
    });

    artilleryProcess.on('close', async (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: `Artillery exited with code ${code ?? 1}`,
          output: stderr || stdout,
        });
        return;
      }

      let results: ArtilleryResults | undefined;
      try {
        if (existsSync(outputPath)) {
          const jsonContent = readFileSync(outputPath, 'utf8');
          results = parseArtilleryJSON(jsonContent);
        } else {
          results = parseArtilleryOutput(stdout);
        }
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Artillery results: ${error instanceof Error ? error.message : String(error)}`,
          output: stdout,
        });
        return;
      }

      resolve({
        success: true,
        results,
        output: stdout,
      });
    });
  });
}

function assignParsedNumber(line: string, pattern: RegExp, assign: (value: number) => void): void {
  const match = line.match(pattern);
  const digits = match?.[1];
  if (digits) {
    assign(Number.parseInt(digits, 10));
  }
}

function parseArtilleryOutput(output: string): ArtilleryResults {
  const results: ArtilleryResults = {
    aggregate: {
      latency: {
        mean: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      },
      requests: {
        completed: 0,
        failed: 0,
      },
      errors: 0,
      duration: 0,
    },
    scenarios: {
      completed: 0,
      failed: 0,
    },
  };
  const metrics: Array<{
    matches: (line: string) => boolean;
    pattern: RegExp;
    assign: (value: number) => void;
  }> = [
    {
      matches: (line) => line.includes('mean:') && line.includes('latency'),
      pattern: /mean:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.latency.mean = value;
      },
    },
    {
      matches: (line) => line.includes('p50:'),
      pattern: /p50:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.latency.p50 = value;
      },
    },
    {
      matches: (line) => line.includes('p95:'),
      pattern: /p95:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.latency.p95 = value;
      },
    },
    {
      matches: (line) => line.includes('p99:'),
      pattern: /p99:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.latency.p99 = value;
      },
    },
    {
      matches: (line) => line.includes('requests') && line.includes('completed'),
      pattern: /completed:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.requests.completed = value;
      },
    },
    {
      matches: (line) => line.includes('requests') && line.includes('failed'),
      pattern: /failed:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.requests.failed = value;
      },
    },
    {
      matches: (line) => line.includes('errors:'),
      pattern: /errors:\s*(\d+)/,
      assign: (value) => {
        results.aggregate.errors = value;
      },
    },
  ];

  for (const line of output.split('\n')) {
    for (const metric of metrics) {
      if (metric.matches(line)) {
        assignParsedNumber(line, metric.pattern, metric.assign);
      }
    }
  }

  return results;
}

function parseArtilleryJSON(jsonContent: string): ArtilleryResults {
  try {
    const data = JSON.parse(jsonContent);

    const aggregate = data.aggregate || {};
    const counters = aggregate.counters || {};
    const summaries = aggregate.summaries || {};

    const sessionLength = summaries['vusers.session_length'] || summaries['session_length'] || {};
    const latency = sessionLength || {};

    const vusersCompleted = counters['vusers.completed'] || aggregate['vusers.completed'] || 0;
    const vusersFailed = counters['vusers.failed'] || aggregate['vusers.failed'] || 0;
    const httpErrors = counters['http.errors'] || counters['errors'] || 0;

    const firstMetricAt = aggregate.firstMetricAt || 0;
    const lastMetricAt = aggregate.lastMetricAt || 0;
    const duration = lastMetricAt > firstMetricAt ? lastMetricAt - firstMetricAt : 0;

    return {
      aggregate: {
        latency: {
          mean: Math.round(latency.mean || 0),
          p50: Math.round(latency.p50 || latency.median || 0),
          p95: Math.round(latency.p95 || 0),
          p99: Math.round(latency.p99 || 0),
        },
        requests: {
          completed: Number(vusersCompleted) || 0,
          failed: Number(vusersFailed) || 0,
        },
        errors: Number(httpErrors) || 0,
        duration: Math.round(duration),
      },
      scenarios: {
        completed: Number(vusersCompleted) || 0,
        failed: Number(vusersFailed) || 0,
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to parse Artillery JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
