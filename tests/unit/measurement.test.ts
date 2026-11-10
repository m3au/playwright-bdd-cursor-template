import { describe, expect, test } from 'bun:test';

import {
  assertFinalUrlMatchesSeed,
  isChallengeDocument,
  lighthouseLiveMeasurementBlocked,
  validateTargetDocument,
  visibleTextLength,
} from '../audit/measurement';
import { auditTargetProfiles } from '../audit/target-profiles';

const w3cProfile = auditTargetProfiles['w3c-bad']!;

const validW3cHtml = `<!doctype html><html><head><title>Before and After Demonstration: Overview</title></head>
<body><p>This demo shows inaccessible markup before remediation across multiple sections and links so the visible body is long enough for identity checks.</p></body></html>`;

describe('validateTargetDocument', () => {
  test('accepts the intended W3C bad demo markers', () => {
    expect(() =>
      validateTargetDocument(validW3cHtml, 'Before and After Demonstration: Overview', w3cProfile),
    ).not.toThrow();
  });

  test('rejects a Cloudflare challenge title with HTTP 200', () => {
    const challengeHtml = '<html><head><title>Just a moment...</title></head><body>Checking</body></html>';
    expect(() =>
      validateTargetDocument(challengeHtml, 'Just a moment...', w3cProfile),
    ).toThrow(/challenge/i);
  });

  test('rejects challenge platform markup even when the title looks benign', () => {
    const challengeHtml =
      '<html><head><title>Welcome</title></head><body><div id="challenge-platform"></div></body></html>';
    expect(() => validateTargetDocument(challengeHtml, 'Welcome', w3cProfile)).toThrow(/challenge/i);
  });

  test('rejects an empty document body', () => {
    const emptyHtml = '<html><head><title>Before and After Demonstration</title></head><body></body></html>';
    expect(() =>
      validateTargetDocument(emptyHtml, 'Before and After Demonstration', w3cProfile),
    ).toThrow(/insufficient body content/i);
  });

  test('rejects a wrong document that is not the intended target', () => {
    const wrongHtml = `<html><head><title>Before and After Demonstration</title></head><body><p>${'totally different page content '.repeat(12)}</p></body></html>`;
    expect(() =>
      validateTargetDocument(wrongHtml, 'Before and After Demonstration', w3cProfile),
    ).toThrow(/missing required marker/i);
  });
});

describe('isChallengeDocument', () => {
  test('detects cf-browser-verification payloads', () => {
    expect(
      isChallengeDocument('<div class="cf-browser-verification"></div>', 'Loading'),
    ).toBe(true);
  });
});

describe('assertFinalUrlMatchesSeed', () => {
  test('allows same-origin path for the W3C bad demo', () => {
    expect(() =>
      assertFinalUrlMatchesSeed('https://www.w3.org/WAI/demos/bad/', w3cProfile),
    ).not.toThrow();
  });

  test('rejects a wrong origin', () => {
    expect(() =>
      assertFinalUrlMatchesSeed('https://example.com/WAI/demos/bad/', w3cProfile),
    ).toThrow(/origin/i);
  });
});

describe('lighthouseLiveMeasurementBlocked', () => {
  test('flags missing performance scores', () => {
    expect(
      lighthouseLiveMeasurementBlocked(
        { lhr: { categories: { performance: { score: undefined } } } },
        'https://example.com',
      ),
    ).toContain('missing performance');
  });

  test('allows a numeric live score with HTTP 200', () => {
    expect(
      lighthouseLiveMeasurementBlocked(
        {
          lhr: {
            categories: { performance: { score: 0.9 } },
            audits: { 'http-status-code': { score: 1, displayValue: '200' } },
          },
        },
        'https://example.com',
      ),
    ).toBeUndefined();
  });
});

describe('visibleTextLength', () => {
  test('ignores script content when measuring visible text', () => {
    const html = '<html><body><p>hello</p><script>const x = 1;</script></body></html>';
    expect(visibleTextLength(html)).toBe(5);
  });
});

describe('verifyEssentialAssets', () => {
  test('reports failed essential assets', async () => {
    const { verifyEssentialAssets } = await import('../audit/measurement');
    await expect(
      verifyEssentialAssets('https://www.w3.org/WAI/demos/bad/', {
        ...w3cProfile,
        essentialAssets: ['css/does-not-exist.css'],
      }),
    ).rejects.toThrow(/essential asset/i);
  });
});
