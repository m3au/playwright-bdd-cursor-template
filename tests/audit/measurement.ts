import * as fs from 'node:fs';
import path from 'node:path';

import type { AuditTargetProfile } from './target-profiles';

const CHALLENGE_TITLE = 'Just a moment';

export type MeasurementMode = 'live' | 'degraded-dom';

export interface LiveDocumentProbe {
  readonly finalUrl: string;
  readonly status: number;
  readonly title: string;
  readonly html: string;
}

export function isChallengeTitle(title: string): boolean {
  return title.includes(CHALLENGE_TITLE);
}

export function isChallengeDocument(html: string, title: string): boolean {
  if (isChallengeTitle(title)) {
    return true;
  }
  const lowered = html.toLowerCase();
  return (
    lowered.includes('challenge-platform') ||
    lowered.includes('cf-browser-verification') ||
    lowered.includes('/cdn-cgi/challenge-platform/')
  );
}

/**
 * Lighthouse's HTTP status audit reports the code in displayValue.
 * Client error responses are not a measurement of the target page.
 */
export function isTargetHttpStatus(
  score: number | null | undefined,
  displayValue: string | undefined,
): boolean {
  if (displayValue === '403' || displayValue === '401' || displayValue === '503') {
    return false;
  }
  if (typeof displayValue === 'string' && /^[45]\d\d$/.test(displayValue)) {
    return false;
  }
  if (typeof score === 'number' && score === 0 && displayValue !== undefined) {
    return false;
  }
  return true;
}

export function requireNumericScore(
  label: string,
  score: number | null | undefined,
  diagnostics: string,
): number {
  if (typeof score !== 'number') {
    throw new TypeError(
      `Lighthouse ${label} score is ${String(score)}. Invalid measurement before any threshold comparison. ${diagnostics}`,
    );
  }
  return score;
}

function removeHtmlSections(html: string, tagName: string): string {
  const openTag = `<${tagName}`;
  const closeTag = `</${tagName}>`;
  let result = html;
  const lower = result.toLowerCase();
  let openIndex = lower.indexOf(openTag);
  while (openIndex !== -1) {
    const closeIndex = lower.indexOf(closeTag, openIndex);
    if (closeIndex === -1) {
      break;
    }
    result = `${result.slice(0, openIndex)} ${result.slice(closeIndex + closeTag.length)}`;
    openIndex = result.toLowerCase().indexOf(openTag);
  }
  return result;
}

function stripHtmlTags(html: string): string {
  let visible = '';
  let inTag = false;
  for (const char of html) {
    if (char === '<') {
      inTag = true;
      continue;
    }
    if (char === '>') {
      inTag = false;
      continue;
    }
    if (!inTag) {
      visible += char;
    }
  }
  return visible;
}

export function visibleTextLength(html: string): number {
  const withoutScripts = removeHtmlSections(removeHtmlSections(html, 'script'), 'style');
  return stripHtmlTags(withoutScripts).replaceAll(/\s+/g, ' ').trim().length;
}

export function validateTargetDocument(
  html: string,
  title: string,
  profile: AuditTargetProfile,
): void {
  if (isChallengeDocument(html, title)) {
    throw new Error(
      `Challenge or bot-check document blocked the live audit for ${profile.id} (title "${title}").`,
    );
  }

  if (profile.identityProbe === 'live-rendered') {
    if (html.length < profile.minHtmlLength) {
      throw new Error(
        `Document for ${profile.id} has insufficient HTML payload (${html.length} bytes).`,
      );
    }
  } else {
    const visibleLength = visibleTextLength(html);
    if (visibleLength < profile.minVisibleTextLength) {
      throw new Error(
        `Document for ${profile.id} has insufficient body content (${visibleLength} visible characters).`,
      );
    }
  }

  for (const fragment of profile.requiredTitleFragments) {
    if (!title.toLowerCase().includes(fragment.toLowerCase())) {
      throw new Error(
        `Title for ${profile.id} is missing required marker "${fragment}" (got "${title}").`,
      );
    }
  }
  const extractedBody = html.match(/<body[\s\S]*?<\/body>/i)?.[0] ?? html;
  const bodySource =
    profile.bodyMarkerScope === 'document' || profile.identityProbe === 'live-rendered'
      ? html
      : extractedBody;
  const bodyText =
    profile.identityProbe === 'live-rendered' || profile.bodyMarkerScope === 'document'
      ? bodySource.toLowerCase()
      : stripHtmlTags(bodySource).toLowerCase();
  for (const fragment of profile.requiredBodyFragments) {
    if (!bodyText.includes(fragment.toLowerCase())) {
      throw new Error(`Body for ${profile.id} is missing required marker "${fragment}".`);
    }
  }
}

function normalizeUrlPath(pathname: string): string {
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
}

export function assertFinalUrlMatchesSeed(finalUrl: string, profile: AuditTargetProfile): void {
  const expected = new URL(profile.seedUrl);
  const actual = new URL(finalUrl);
  if (actual.origin !== expected.origin) {
    throw new Error(
      `Final URL origin ${actual.origin} does not match intended target ${expected.origin} for ${profile.id}.`,
    );
  }
  const expectedPath = normalizeUrlPath(expected.pathname);
  const actualPath = normalizeUrlPath(actual.pathname);
  if (actualPath !== expectedPath && !actualPath.startsWith(`${expectedPath}/`)) {
    throw new Error(
      `Final URL path ${actual.pathname} does not match intended target ${expected.pathname} for ${profile.id}.`,
    );
  }
}

export async function prefetchAuditDocument(
  url: string,
): Promise<{ status: number; html: string; finalUrl: string }> {
  const response = await fetch(url, {
    redirect: 'follow',
  });
  return {
    status: response.status,
    html: await response.text(),
    finalUrl: response.url,
  };
}

export async function verifyEssentialAssetsWithRequest(
  request: { get: (url: string) => Promise<{ status: () => number }> },
  pageUrl: string,
  profile: AuditTargetProfile,
): Promise<void> {
  for (const assetPath of profile.essentialAssets) {
    const assetUrl = new URL(assetPath, pageUrl).href;
    const response = await request.get(assetUrl);
    if (response.status() !== 200) {
      throw new Error(
        `Essential asset ${assetUrl} for ${profile.id} returned HTTP ${String(response.status())}.`,
      );
    }
  }
}

export function assertProbedLiveTargetDocument(
  profile: AuditTargetProfile,
  probe: Pick<LiveDocumentProbe, 'finalUrl' | 'status' | 'title' | 'html'>,
): void {
  assertFinalUrlMatchesSeed(probe.finalUrl, profile);
  if (probe.status < 200 || probe.status >= 400) {
    throw new Error(
      `Live document probe for ${profile.id} returned HTTP ${probe.status} (final ${probe.finalUrl}).`,
    );
  }
  validateTargetDocument(probe.html, probe.title, profile);
}

export interface LighthouseCategories {
  readonly performance?: { score?: number | null } | null;
}

export interface LighthouseStatusAudit {
  readonly score?: number | null;
  readonly displayValue?: string;
}

export interface LighthouseResultLike {
  readonly artifacts?: {
    readonly MainDocumentContent?: string;
  };
  readonly lhr?: {
    readonly finalUrl?: string;
    readonly requestedUrl?: string;
    readonly categories?: LighthouseCategories & Record<string, { score?: number | null } | undefined>;
    readonly audits?: Record<
      string,
      { readonly displayValue?: string; readonly details?: unknown; readonly score?: number | null } | undefined
    >;
    readonly runtimeError?: { code?: string; message?: string };
  } | null;
}

export function lighthouseDocumentProbe(
  result: LighthouseResultLike,
  seedUrl: string,
): LiveDocumentProbe {
  const lhr = result.lhr;
  if (!lhr) {
    throw new Error('Lighthouse result is missing lhr');
  }
  const finalUrl = lhr.finalUrl ?? lhr.requestedUrl ?? seedUrl;
  const mainHtml = result.artifacts?.MainDocumentContent ?? '';
  const title =
    mainHtml.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ??
    String(lhr.audits?.['document-title']?.displayValue ?? '');
  const audits = lhr.audits ?? {};
  const fallbackChunks = [
    title,
    JSON.stringify(audits['main-document-content']?.details ?? {}),
    JSON.stringify(audits['link-text']?.details ?? {}),
    String(audits['meta-description']?.displayValue ?? ''),
    String(audits['dom-size']?.displayValue ?? ''),
  ];
  const html = mainHtml.length > 0 ? mainHtml : fallbackChunks.filter((chunk) => chunk.length > 0).join('\n');
  const statusCode = Number.parseInt(
    String(lhr.audits?.['http-status-code']?.displayValue ?? '200'),
    10,
  );
  return {
    finalUrl,
    status: Number.isFinite(statusCode) ? statusCode : 200,
    title,
    html,
  };
}

export function assertLighthouseScoredIdentity(
  result: LighthouseResultLike,
  profile: AuditTargetProfile,
  seedUrl: string,
): void {
  const probe = lighthouseDocumentProbe(result, seedUrl);
  assertProbedLiveTargetDocument(profile, probe);
}

export function lighthouseLiveMeasurementBlocked(
  result: LighthouseResultLike,
  url: string,
): string | undefined {
  const performance = result.lhr?.categories?.['performance']?.score;
  const status = result.lhr?.audits?.['http-status-code'];
  if (typeof performance !== 'number') {
    return `missing performance score for ${url}`;
  }
  const httpStatus = status as LighthouseStatusAudit | undefined;
  if (!isTargetHttpStatus(httpStatus?.score, httpStatus?.displayValue)) {
    return `HTTP ${String(httpStatus?.displayValue)} for ${url}`;
  }
  const runtimeError = result.lhr?.runtimeError;
  if (runtimeError?.code) {
    return `runtime error ${runtimeError.code}: ${runtimeError.message ?? ''}`.trim();
  }
  return undefined;
}

export function writeMeasurementModeMarker(
  directory: string,
  mode: MeasurementMode,
  details: Record<string, string | number | boolean>,
): void {
  fs.writeFileSync(
    path.join(directory, 'measurement-mode.json'),
    JSON.stringify({ mode, ...details }, undefined, 2),
  );
}
