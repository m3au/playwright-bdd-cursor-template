const CHALLENGE_TITLE = 'Just a moment';

export function isChallengeTitle(title: string): boolean {
  return title.includes(CHALLENGE_TITLE);
}

/**
 * Lighthouse's HTTP status audit reports the code in displayValue.
 * A 403 challenge document is not a measurement of the target page.
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

export async function prefetchAuditDocument(
  url: string,
): Promise<{ status: number; html: string }> {
  const response = await fetch(url, {
    headers: { 'user-agent': 'playwright-bdd-cursor-template' },
  });
  return { status: response.status, html: await response.text() };
}
