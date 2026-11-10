import { describe, expect, test } from 'bun:test';

import { profileForTargetName } from '../audit/target-profiles';
import {
  assertFinalUrlMatchesSeed,
  assertLighthouseScoredIdentity,
  isChallengeDocument,
  isTargetHttpStatus,
  lighthouseLiveMeasurementBlocked,
  validateTargetDocument,
  verifyEssentialAssetsWithRequest,
  visibleTextLength,
} from '../audit/measurement';

const w3cProfileTemplate = {
  id: 'w3c-bad',
  seedUrlEnv: 'BASE_URL_AXE_W3C_BAD',
  requiredTitleFragments: ['inaccessible home page'],
  requiredBodyFragments: ['welcome', 'citylights'],
  essentialAssets: ['img/homeicon.png'],
  minVisibleTextLength: 80,
  minHtmlLength: 400,
  identityProbe: 'static-html' as const,
  bodyMarkerScope: 'body' as const,
};

const w3cProfile = { ...w3cProfileTemplate, seedUrl: 'http://127.0.0.1:8765/before/home.html' };

const validW3cHtml = `<!doctype html><html><head><title>Welcome to CityLights! [Inaccessible Home Page]</title></head>
<body><p>Welcome to the inaccessible CityLights demo home page with enough visible copy for validation and markers for welcome and citylights in the body.</p>${'<span aria-hidden="true">.</span>'.repeat(200)}</body></html>`;

describe('validateTargetDocument', () => {
  test('accepts the intended W3C before home markers', () => {
    expect(() =>
      validateTargetDocument(
        validW3cHtml,
        'Welcome to CityLights! [Inaccessible Home Page]',
        w3cProfile,
      ),
    ).not.toThrow();
  });

  test('rejects a Cloudflare challenge title with HTTP 200', () => {
    const challengeHtml =
      '<html><head><title>Just a moment...</title></head><body>Checking</body></html>';
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
    const emptyHtml = `<html><head><title>Welcome to CityLights! [Inaccessible Home Page]</title>${'<!-- padding -->'.repeat(40)}</head><body></body></html>`;
    expect(() =>
      validateTargetDocument(emptyHtml, 'Welcome to CityLights! [Inaccessible Home Page]', w3cProfile),
    ).toThrow(/insufficient body content/i);
  });

  test('rejects a wrong document that is not the intended target', () => {
    const wrongHtml = `<html><head><title>Welcome to CityLights! [Inaccessible Home Page]</title></head><body><p>${'totally different page content '.repeat(12)}</p></body></html>`;
    expect(() =>
      validateTargetDocument(wrongHtml, 'Welcome to CityLights! [Inaccessible Home Page]', w3cProfile),
    ).toThrow(/missing required marker/i);
  });

  test('rejects live-rendered documents below the minimum HTML length', () => {
    const polymerLike = {
      ...w3cProfile,
      id: 'polymer-shop',
      identityProbe: 'live-rendered' as const,
      minHtmlLength: 1000,
    };
    expect(() => validateTargetDocument('<html><body>tiny</body></html>', 'SHOP', polymerLike)).toThrow(
      /insufficient HTML payload/i,
    );
  });
});

describe('isTargetHttpStatus', () => {
  test('classifies 403 as blocked', () => {
    expect(isTargetHttpStatus(1, '403')).toBe(false);
  });
});

describe('assertFinalUrlMatchesSeed', () => {
  test('allows same-origin path for a W3C before home page', () => {
    expect(() =>
      assertFinalUrlMatchesSeed('http://127.0.0.1:8765/before/home.html', w3cProfile),
    ).not.toThrow();
  });

  test('rejects a wrong origin', () => {
    expect(() =>
      assertFinalUrlMatchesSeed('https://example.com/before/home.html', w3cProfile),
    ).toThrow(/origin/i);
  });

  test('rejects a path mismatch', () => {
    expect(() =>
      assertFinalUrlMatchesSeed('http://127.0.0.1:8765/after/home.html', w3cProfile),
    ).toThrow(/path/i);
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

  test('surfaces runtime errors before thresholds', () => {
    expect(
      lighthouseLiveMeasurementBlocked(
        {
          lhr: {
            categories: { performance: { score: 0.5 } },
            audits: { 'http-status-code': { score: 1, displayValue: '200' } },
            runtimeError: { code: 'NO_FCP', message: 'No first contentful paint' },
          },
        },
        'https://example.com',
      ),
    ).toContain('NO_FCP');
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

describe('assertLighthouseScoredIdentity', () => {
  const scoredW3cBody = `${validW3cHtml}`.repeat(2);

  test('validates the Lighthouse-scored document title and content', () => {
    expect(() =>
      assertLighthouseScoredIdentity(
        {
          artifacts: {
            MainDocumentContent: scoredW3cBody,
          },
          lhr: {
            finalUrl: w3cProfile.seedUrl,
            audits: {
              'http-status-code': { displayValue: '200' },
            },
          },
        },
        w3cProfile,
      ),
    ).not.toThrow();
  });

  test('rejects a challenge page served with HTTP 200 in MainDocumentContent', () => {
    expect(() =>
      assertLighthouseScoredIdentity(
        {
          artifacts: {
            MainDocumentContent: `${'<html><head><title>Just a moment...</title></head><body>'.repeat(40)}<div class="cf-browser-verification"></div></body></html>`,
          },
          lhr: {
            finalUrl: w3cProfile.seedUrl,
            audits: { 'http-status-code': { displayValue: '200' } },
          },
        },
        w3cProfile,
      ),
    ).toThrow(/challenge/i);
  });

  test('rejects missing MainDocumentContent', () => {
    expect(() =>
      assertLighthouseScoredIdentity(
        {
          lhr: {
            finalUrl: w3cProfile.seedUrl,
            audits: { 'http-status-code': { displayValue: '200' } },
          },
        },
        w3cProfile,
      ),
    ).toThrow(/MainDocumentContent/i);
  });

  test('rejects a finalUrl that does not match the seed', () => {
    expect(() =>
      assertLighthouseScoredIdentity(
        {
          artifacts: { MainDocumentContent: scoredW3cBody },
          lhr: {
            finalUrl: 'http://127.0.0.1:8765/after/home.html',
            audits: { 'http-status-code': { displayValue: '200' } },
          },
        },
        w3cProfile,
      ),
    ).toThrow(/final url|path/i);
  });
});

describe('verifyEssentialAssetsWithRequest', () => {
  test('reports failed essential assets using the scanned session request API', async () => {
    await expect(
      verifyEssentialAssetsWithRequest(
        {
          get: async () => ({ status: () => 404 }),
        },
        w3cProfile.seedUrl,
        w3cProfile,
      ),
    ).rejects.toThrow(/essential asset/i);
  });
});

describe('visibleTextLength', () => {
  test('ignores script content when measuring visible text', () => {
    const html = '<html><body><p>hello</p><script>const x = 1;</script></body></html>';
    expect(visibleTextLength(html)).toBe(5);
  });
});

describe('isChallengeDocument', () => {
  test('detects cf-browser-verification payloads', () => {
    expect(
      isChallengeDocument('<div class="cf-browser-verification"></div>', 'Loading'),
    ).toBe(true);
  });
});

describe('profileForTargetName', () => {
  test('reads seedUrl from environment rather than hard-coded hosts', () => {
    process.env['BASE_URL_AXE_W3C_BAD'] = 'http://127.0.0.1:4321/before/home.html';
    const profile = profileForTargetName('w3c-bad');
    expect(profile.seedUrl).toBe('http://127.0.0.1:4321/before/home.html');
  });
});
