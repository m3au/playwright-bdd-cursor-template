export function environment(name: string): string | undefined {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`${name} environment variable is required`);
  }
  return value === '' ? undefined : value;
}

export interface AuditTarget {
  name: string;
  url: string;
}

export interface EnvironmentConfig {
  timeout: number;
  expectTimeout: number;
  workers: number | string;
  retries: number;
  repeatEach: number;
  fullyParallel: boolean;
  forbidOnly: boolean;
  maxFailures: number;
  chromium: boolean;
  firefox: boolean;
  webkit: boolean;
  browserChannel?: string;
  headed: boolean;
  slowMo: number;
  browserArgs?: string;
  viewportWidth: number;
  viewportHeight: number;
  deviceScaleFactor: number;
  userAgent?: string;
  locale?: string;
  timezoneId?: string;
  geolocation?: string;
  permissions?: string;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  reducedMotion: boolean;
  forcedColors: boolean;
  hasTouch: boolean;
  isMobile: boolean;
  ignoreHTTPSErrors: boolean;
  bypassCSP: boolean;
  javaScriptEnabled: boolean;
  acceptDownloads: boolean;
  actionTimeout: number;
  navigationTimeout: number;
  proxyServer?: string;
  trace: 'off' | 'on' | 'on-first-retry' | 'retain-on-failure' | 'on-all-retries';
  screenshot: 'off' | 'on' | 'only-on-failure';
  video: 'off' | 'on' | 'on-first-retry' | 'retain-on-failure' | 'on-all-retries';
  videoSize?: string;
  videoPath?: string;
  lighthousePerformance: number;
  lighthouseAccessibility: number;
  lighthouseBestPractices: number;
  lighthouseSEO: number;
  lighthousePWA: number;
  axeMaxViolations: number;
  axeTargets: AuditTarget[];
  lighthouseTargets: AuditTarget[];
}

export interface DataConfig {
  [key: string]: unknown;
}

export function getEnvironment(): DataConfig & { environment: EnvironmentConfig } {
  const config: EnvironmentConfig = {
    timeout: +environment('TIMEOUT')!,
    expectTimeout: +environment('EXPECT_TIMEOUT')!,
    workers: environment('WORKERS')!,
    retries: +environment('RETRIES')!,
    repeatEach: +environment('REPEAT_EACH')!,
    fullyParallel: !!environment('FULLY_PARALLEL'),
    forbidOnly: !!environment('FORBID_ONLY'),
    maxFailures: +environment('MAX_FAILURES')!,
    chromium: !!environment('CHROMIUM'),
    firefox: !!environment('FIREFOX'),
    webkit: !!environment('WEBKIT'),
    browserChannel: environment('BROWSER_CHANNEL'),
    headed: !!environment('HEADED'),
    slowMo: +environment('SLOW_MO')!,
    browserArgs: environment('BROWSER_ARGS'),
    viewportWidth: +environment('VIEWPORT_WIDTH')!,
    viewportHeight: +environment('VIEWPORT_HEIGHT')!,
    deviceScaleFactor: +environment('DEVICE_SCALE_FACTOR')!,
    userAgent: environment('USER_AGENT'),
    locale: environment('LOCALE'),
    timezoneId: environment('TIMEZONE_ID'),
    geolocation: environment('GEOLOCATION'),
    permissions: environment('PERMISSIONS'),
    colorScheme: environment('COLOR_SCHEME') as 'light' | 'dark' | 'no-preference' | undefined,
    reducedMotion: !!environment('REDUCED_MOTION'),
    forcedColors: !!environment('FORCED_COLORS'),
    hasTouch: !!environment('HAS_TOUCH'),
    isMobile: !!environment('IS_MOBILE'),
    ignoreHTTPSErrors: !!environment('IGNORE_HTTPS_ERRORS'),
    bypassCSP: !!environment('BYPASS_CSP'),
    javaScriptEnabled: !!environment('JAVASCRIPT_ENABLED'),
    acceptDownloads: !!environment('ACCEPT_DOWNLOADS'),
    actionTimeout: +environment('ACTION_TIMEOUT')!,
    navigationTimeout: +environment('NAVIGATION_TIMEOUT')!,
    proxyServer: environment('PROXY_SERVER'),
    trace: environment('TRACE')! as EnvironmentConfig['trace'],
    screenshot: environment('SCREENSHOT')! as EnvironmentConfig['screenshot'],
    video: (environment('VIDEO') || 'off') as EnvironmentConfig['video'],
    videoSize: environment('VIDEO_SIZE'),
    videoPath: environment('VIDEO_PATH'),
    lighthousePerformance: +environment('LIGHTHOUSE_PERFORMANCE')!,
    lighthouseAccessibility: +environment('LIGHTHOUSE_ACCESSIBILITY')!,
    lighthouseBestPractices: +environment('LIGHTHOUSE_BEST_PRACTICES')!,
    lighthouseSEO: +environment('LIGHTHOUSE_SEO')!,
    lighthousePWA: +environment('LIGHTHOUSE_PWA')!,
    axeMaxViolations: +environment('AXE_MAX_VIOLATIONS')!,
    axeTargets: [
      { name: 'w3c-bad', url: environment('BASE_URL_AXE_W3C_BAD')! },
      { name: 'w3c-after', url: environment('BASE_URL_AXE_W3C_AFTER')! },
      { name: 'deque-mars', url: environment('BASE_URL_AXE_DEQUE_MARS')! },
    ],
    lighthouseTargets: [
      { name: 'polymer-shop', url: environment('BASE_URL_LIGHTHOUSE_POLYMER')! },
      { name: 'w3c-bad', url: environment('BASE_URL_LIGHTHOUSE_W3C_BAD')! },
    ],
  };

  return {
    environment: config,
  };
}
