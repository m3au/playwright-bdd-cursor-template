import * as fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

import type { Browser } from '@playwright/test';
import { chromium, expect } from '@playwright/test';
import lighthouse from 'lighthouse';

import {
  assertLiveTargetDocument,
  assertProbedLiveTargetDocument,
  prefetchAuditDocument,
  verifyEssentialAssets,
  writeMeasurementModeMarker,
} from './measurement';
import type { AuditTargetProfile } from './target-profiles';

type LighthouseRun = Awaited<ReturnType<typeof lighthouse>>;

export async function verifyLiveTargetIdentity(
  browser: Browser,
  seedUrl: string,
  profile: AuditTargetProfile,
  finalUrl: string,
): Promise<void> {
  if (profile.identityProbe === 'live-rendered') {
    const validationPage = await browser.newPage();
    try {
      const response = await validationPage.goto(seedUrl, {
        waitUntil: 'load',
        timeout: 60_000,
      });
      if (profile.renderedReadySelector) {
        await expect(validationPage.locator(profile.renderedReadySelector).first()).toBeVisible({
          timeout: 60_000,
        });
      }
      assertProbedLiveTargetDocument(profile, {
        finalUrl: validationPage.url(),
        status: response?.status() ?? 0,
        title: await validationPage.title(),
        html: await validationPage.content(),
      });
      await verifyEssentialAssets(validationPage.url(), profile);
    } finally {
      await validationPage.close();
    }
    return;
  }

  await assertLiveTargetDocument(seedUrl, profile, finalUrl);
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
