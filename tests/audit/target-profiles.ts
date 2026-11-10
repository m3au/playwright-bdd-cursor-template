export type AuditIdentityProbe = 'static-html' | 'live-rendered';

export interface AuditTargetProfile {
  readonly id: string;
  readonly seedUrl: string;
  readonly requiredTitleFragments: readonly string[];
  readonly requiredBodyFragments: readonly string[];
  readonly essentialAssets: readonly string[];
  readonly minVisibleTextLength: number;
  readonly minHtmlLength: number;
  readonly identityProbe: AuditIdentityProbe;
  readonly renderedReadySelector?: string;
}

export const auditTargetProfiles: Record<string, AuditTargetProfile> = {
  'polymer-shop': {
    id: 'polymer-shop',
    seedUrl: 'https://shop.polymer-project.org/',
    requiredTitleFragments: ['shop'],
    requiredBodyFragments: ['polymer'],
    essentialAssets: ['es5-bundled/'],
    minVisibleTextLength: 80,
    minHtmlLength: 1000,
    identityProbe: 'live-rendered',
    renderedReadySelector: 'shop-home',
  },
  'w3c-bad': {
    id: 'w3c-bad',
    seedUrl: 'https://www.w3.org/WAI/demos/bad/',
    requiredTitleFragments: ['before and after demonstration'],
    requiredBodyFragments: ['inaccessible'],
    essentialAssets: ['css/meta.css'],
    minVisibleTextLength: 120,
    minHtmlLength: 500,
    identityProbe: 'static-html',
  },
  'w3c-after': {
    id: 'w3c-after',
    seedUrl: 'https://www.w3.org/WAI/demos/bad/after/home.html',
    requiredTitleFragments: ['citylights', 'accessible'],
    requiredBodyFragments: ['welcome'],
    essentialAssets: ['css/main.css'],
    minVisibleTextLength: 120,
    minHtmlLength: 500,
    identityProbe: 'static-html',
  },
  'deque-mars': {
    id: 'deque-mars',
    seedUrl: 'https://dequeuniversity.com/demo/mars',
    requiredTitleFragments: ['mars commuter'],
    requiredBodyFragments: ['mars'],
    essentialAssets: [],
    minVisibleTextLength: 80,
    minHtmlLength: 1000,
    identityProbe: 'live-rendered',
    renderedReadySelector: 'h1',
  },
};

export function profileForTargetName(name: string): AuditTargetProfile {
  const profile = auditTargetProfiles[name];
  if (!profile) {
    throw new Error(`No audit target profile registered for ${name}`);
  }
  return profile;
}
