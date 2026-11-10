import { environment } from '@utils';

import type { LighthouseGatedCategory } from './audit-gates';
import { gatePolicyForTarget } from './audit-gates';

export type AuditIdentityProbe = 'static-html' | 'live-rendered';

export interface AuditTargetProfileTemplate {
  readonly id: string;
  readonly seedUrlEnv: string;
  readonly requiredTitleFragments: readonly string[];
  readonly requiredBodyFragments: readonly string[];
  readonly essentialAssets: readonly string[];
  readonly minVisibleTextLength: number;
  readonly minHtmlLength: number;
  readonly identityProbe: AuditIdentityProbe;
  readonly bodyMarkerScope: 'body' | 'document';
  readonly renderedReadySelector?: string;
}

export interface AuditTargetProfile extends AuditTargetProfileTemplate {
  readonly seedUrl: string;
}

const profileTemplates: Record<string, AuditTargetProfileTemplate> = {
  'polymer-shop': {
    id: 'polymer-shop',
    seedUrlEnv: 'BASE_URL_LIGHTHOUSE_POLYMER',
    requiredTitleFragments: ['shop'],
    requiredBodyFragments: ['polymer'],
    essentialAssets: ['es5-bundled/'],
    minVisibleTextLength: 10,
    minHtmlLength: 10,
    identityProbe: 'static-html',
    bodyMarkerScope: 'document',
    renderedReadySelector: 'shop-home',
  },
  'w3c-bad': {
    id: 'w3c-bad',
    seedUrlEnv: 'BASE_URL_AXE_W3C_BAD',
    requiredTitleFragments: ['inaccessible home page'],
    requiredBodyFragments: ['welcome', 'citylights'],
    essentialAssets: ['../css/meta.css', '../img/w3c.png'],
    minVisibleTextLength: 80,
    minHtmlLength: 400,
    identityProbe: 'static-html',
    bodyMarkerScope: 'body',
  },
  'w3c-after': {
    id: 'w3c-after',
    seedUrlEnv: 'BASE_URL_AXE_W3C_AFTER',
    requiredTitleFragments: ['accessible home page'],
    requiredBodyFragments: ['welcome', 'citylights'],
    essentialAssets: ['../css/meta.css', '../img/w3c.png'],
    minVisibleTextLength: 80,
    minHtmlLength: 400,
    identityProbe: 'static-html',
    bodyMarkerScope: 'body',
  },
  'deque-mars': {
    id: 'deque-mars',
    seedUrlEnv: 'BASE_URL_AXE_DEQUE_MARS',
    requiredTitleFragments: ['mars commuter'],
    requiredBodyFragments: ['mars'],
    essentialAssets: [],
    minVisibleTextLength: 80,
    minHtmlLength: 1000,
    identityProbe: 'live-rendered',
    bodyMarkerScope: 'document',
    renderedReadySelector: 'h1',
  },
};

export function profileForTargetName(name: string): AuditTargetProfile {
  const template = profileTemplates[name];
  if (!template) {
    throw new Error(`No audit target profile registered for ${name}`);
  }
  const seedUrl = environment(template.seedUrlEnv);
  if (!seedUrl) {
    throw new Error(`Missing ${template.seedUrlEnv} for audit target ${name}`);
  }
  return { ...template, seedUrl };
}

export function lighthouseCategoriesForTarget(targetId: string): readonly LighthouseGatedCategory[] {
  return gatePolicyForTarget(targetId).lighthouseCategories;
}
