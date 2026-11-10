import { describe, expect, test } from 'bun:test';

import {
  extractW3cBadDemo,
  startW3cDemoServer,
  verifyW3cBadZipSha256,
  W3C_BAD_ZIP_SHA256,
} from '../audit/w3c-demo-server';

describe('w3c demo vendor archive', () => {
  test('matches the pinned sha256 for bad.zip', async () => {
    await verifyW3cBadZipSha256();
    expect(W3C_BAD_ZIP_SHA256).toBe(
      'fd538ed4a594eb397fd99e75ab25744d1419fceece961bbfe0bcee9785123216',
    );
  });

  test('serves the before and after home pages from a local HTTP server', async () => {
    extractW3cBadDemo();
    const server = await startW3cDemoServer();
    try {
      const before = await fetch(`${server.baseUrl}/before/home.html`);
      const after = await fetch(`${server.baseUrl}/after/home.html`);
      expect(before.status).toBe(200);
      expect(after.status).toBe(200);
      const beforeHtml = await before.text();
      expect(beforeHtml).toContain('Inaccessible Home Page');
      const afterHtml = await after.text();
      expect(afterHtml).toContain('Accessible Home Page');
    } finally {
      await server.stop();
    }
  });
});
