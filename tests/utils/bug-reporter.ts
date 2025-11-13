import { readFile, writeFile } from 'node:fs/promises';

import type { TestInfo } from '@playwright/test';
import { test as baseTest } from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';

import type { AutomationExerciseUser } from '@automationexercise/utils/user-data';

export interface BugReport {
  timestamp: string;
  cableBeginningType: string;
  cableBeginningConnector: string;
  cableEndType: string;
  cableEndConnector: string;
  error: string;
  stepsToReproduce: string[];
}

export interface TestContext {
  cableBeginningType?: string;
  cableBeginningConnector?: string;
  cableEndType?: string;
  cableEndConnector?: string;
  steps?: string[];
  automationExercise?: {
    user?: AutomationExerciseUser;
    userRegistered?: boolean;
  };
}

// Store test context per test ID (supports parallel test execution)
const testContexts = new Map<string, TestContext>();

function getCurrentTestId(): string {
  try {
    const testInfo = baseTest.info();
    return testInfo?.testId || 'unknown';
  } catch {
    return 'unknown';
  }
}

export function getTestContext(testId?: string): TestContext {
  const id = testId || getCurrentTestId();
  if (!testContexts.has(id)) {
    testContexts.set(id, {});
  }
  return testContexts.get(id)!;
}

export function setTestContext(context: Partial<TestContext>, testId?: string): void {
  const id = testId || getCurrentTestId();
  const current = getTestContext(id);
  testContexts.set(id, { ...current, ...context });
}

export function addTestStep(step: string, testId?: string): void {
  const id = testId || getCurrentTestId();
  const current = getTestContext(id);
  const steps = current.steps || [];
  steps.push(step);
  testContexts.set(id, { ...current, steps });
}

export function clearTestContext(testId?: string): void {
  const id = testId || getCurrentTestId();
  testContexts.delete(id);
}

const BUGS_FILE = path.join(process.cwd(), 'BUGS.json');

/**
 * Ensures BUGS.json file exists and returns its contents.
 * Creates empty array if file doesn't exist or is invalid JSON.
 */
async function ensureBugsFileExists(): Promise<BugReport[]> {
  if (!existsSync(BUGS_FILE)) {
    const emptyArray: BugReport[] = [];
    await writeFile(BUGS_FILE, JSON.stringify(emptyArray, undefined, 2), 'utf8');
    return emptyArray;
  }

  try {
    const content = await readFile(BUGS_FILE, 'utf8');
    return JSON.parse(content) as BugReport[];
  } catch {
    // File exists but is invalid JSON - reset it
    const emptyArray: BugReport[] = [];
    await writeFile(BUGS_FILE, JSON.stringify(emptyArray, undefined, 2), 'utf8');
    return emptyArray;
  }
}

export async function appendBugReport(bug: BugReport): Promise<void> {
  const bugs = await ensureBugsFileExists();
  bugs.push(bug);
  await writeFile(BUGS_FILE, JSON.stringify(bugs, undefined, 2), 'utf8');
}

/**
 * Extract steps to reproduce from testInfo or tracked steps.
 * Prefers testInfo.steps if available, otherwise falls back to tracked steps from testContext.
 */
export function extractStepsToReproduce(testInfo: TestInfo, testContext: TestContext): string[] {
  let stepsToReproduce: string[] = [];
  try {
    const testInfoSteps = (testInfo as { steps?: Array<{ title: string }> }).steps;
    if (testInfoSteps && testInfoSteps.length > 0) {
      stepsToReproduce = testInfoSteps.map((step: { title: string }) => step.title).filter(Boolean);
    }
  } catch {
    // Fall back to tracked steps if testInfo.steps isn't available
  }

  if (stepsToReproduce.length === 0) {
    stepsToReproduce = testContext.steps || [];
  }

  return stepsToReproduce;
}

/**
 * Creates a bug report from test error information and test context.
 * Includes cable configuration, error message, and steps to reproduce.
 */
export function createBugReport(testInfo: TestInfo, testContext: TestContext): BugReport {
  const timestamp = new Date().toISOString();
  const errorMessage = testInfo.error?.message || testInfo.error?.toString() || 'Unknown error';
  const stepsToReproduce = extractStepsToReproduce(testInfo, testContext);

  return {
    timestamp,
    cableBeginningType: testContext.cableBeginningType || 'unknown',
    cableBeginningConnector: testContext.cableBeginningConnector || 'unknown',
    cableEndType: testContext.cableEndType || 'unknown',
    cableEndConnector: testContext.cableEndConnector || 'unknown',
    error: errorMessage,
    stepsToReproduce,
  };
}
