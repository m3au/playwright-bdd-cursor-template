import * as fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

import { assertLighthouseScoredIdentity, prefetchAuditDocument, writeMeasurementModeMarker } from './measurement';
import type { AuditTargetProfile } from './target-profiles';

type LighthouseRun = Awaited<ReturnType<typeof lighthouse>>;

export function verifyLighthouseScoredDocument(
  result: LighthouseRun,
  profile: AuditTargetProfile,
  seedUrl: string,
): void {
  if (!result) {
    throw new Error(`Lighthouse returned no result for ${seedUrl}`);
  }
  assertLighthouseScoredIdentity(result, profile);
}

export async function measureDegradedDomDocument(
  url: string,
  config: Parameters<typeof lighthouse>[2],
): Promise<LighthouseRun> {
  const prefetched = await prefetchAuditDocument(url);
  if (prefetched.status !== 200) {
    throw new Error(`Degraded DOM probe could not prefetch ${url} (status ${prefetched.status}).`);
  }

  const port = await new Promise<number>((resolve, reject) => {
    const listener = net.createServer();
    listener.listen(0, '127.0.0.1', () => {
      const address = listener.address();
      const freePort = typeof address === 'object' && address ? address.port : 0;
      listener.close(() => resolve(freePort));
    });
    listener.on('error', reject);
  });

  const browser = await chromium.launch({
    headless: true,
    args: [`--remote-debugging-port=${port}`, '--remote-allow-origins=*'],
  });
  try {
    const session = await browser.newBrowserCDPSession();
    await session.send('Fetch.enable', {
      patterns: [{ urlPattern: `${url}*`, requestStage: 'Request' }],
    });
    session.on('Fetch.requestPaused', async (event) => {
      if (event.resourceType === 'Document' && event.request.url.startsWith(url)) {
        await session.send('Fetch.fulfillRequest', {
          requestId: event.requestId,
          responseCode: 200,
          responseHeaders: [{ name: 'content-type', value: 'text/html; charset=utf-8' }],
          body: Buffer.from(prefetched.html).toString('base64'),
        });
        return;
      }
      await session.send('Fetch.continueRequest', { requestId: event.requestId });
    });
    return await lighthouse(
      url,
      {
        logLevel: 'error',
        output: 'html',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        port,
      },
      config,
    );
  } finally {
    await browser.close();
  }
}

export async function writeDegradedDomDiagnostics(
  targetDirectory: string,
  targetUrl: string,
  liveBlocker: string,
  desktopConfig: Parameters<typeof lighthouse>[2],
): Promise<void> {
  const degradedDirectory = path.join(targetDirectory, 'degraded-dom');
  fs.mkdirSync(degradedDirectory, { recursive: true });
  try {
    const degraded = await measureDegradedDomDocument(targetUrl, desktopConfig);
    if (!degraded) {
      throw new Error(`Degraded Lighthouse probe returned no result for ${targetUrl}`);
    }
    const degradedHtml = degraded.report;
    if (typeof degradedHtml === 'string') {
      fs.writeFileSync(path.join(degradedDirectory, 'index.html'), degradedHtml);
    }
    fs.writeFileSync(
      path.join(degradedDirectory, 'report.json'),
      JSON.stringify(degraded.lhr ?? {}, undefined, 2),
    );
    writeMeasurementModeMarker(degradedDirectory, 'degraded-dom', {
      reason: liveBlocker,
      satisfiesLiveGate: false,
    });
  } catch (degradedError) {
    const message = degradedError instanceof Error ? degradedError.message : String(degradedError);
    writeMeasurementModeMarker(degradedDirectory, 'degraded-dom', {
      reason: liveBlocker,
      satisfiesLiveGate: false,
      degradedError: message,
    });
  }
}
