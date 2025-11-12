import { devices, type PlaywrightTestConfig } from '@playwright/test';

import { environment } from '@utils';

export interface BrowserProject {
  name: string;
  use: PlaywrightTestConfig['use'];
}

function parseGeolocation(
  value: string | undefined,
): { latitude: number; longitude: number; accuracy?: number } | undefined {
  if (!value) {
    return undefined;
  }
  const parts = value.split(',');
  if (parts.length < 2) {
    return undefined;
  }
  return {
    latitude: Number.parseFloat(parts[0]!),
    longitude: Number.parseFloat(parts[1]!),
    accuracy: parts[2] ? Number.parseFloat(parts[2]!) : undefined,
  };
}

function parsePermissions(value: string | undefined): string[] | undefined {
  if (!value) {
    return undefined;
  }
  return value
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseVideoSize(value: string | undefined): { width: number; height: number } | undefined {
  if (!value) {
    return undefined;
  }
  const parts = value.split('x');
  if (parts.length !== 2) {
    return undefined;
  }
  return {
    width: Number.parseInt(parts[0]!, 10),
    height: Number.parseInt(parts[1]!, 10),
  };
}

function buildViewportOptions(): Partial<PlaywrightTestConfig['use']> {
  const viewportWidth = +environment('VIEWPORT_WIDTH')!;
  const viewportHeight = +environment('VIEWPORT_HEIGHT')!;
  const deviceScaleFactor = +environment('DEVICE_SCALE_FACTOR')!;

  return {
    ...(viewportWidth > 0 && viewportHeight > 0
      ? { viewport: { width: viewportWidth, height: viewportHeight } }
      : {}),
    ...(deviceScaleFactor > 0 && deviceScaleFactor !== 1 ? { deviceScaleFactor } : {}),
  };
}

function buildLocationOptions(): Partial<PlaywrightTestConfig['use']> {
  const userAgent = environment('USER_AGENT');
  const locale = environment('LOCALE');
  const timezoneId = environment('TIMEZONE_ID');
  const geolocation = parseGeolocation(environment('GEOLOCATION'));
  const permissions = parsePermissions(environment('PERMISSIONS'));

  return {
    ...(userAgent ? { userAgent } : {}),
    ...(locale ? { locale } : {}),
    ...(timezoneId ? { timezoneId } : {}),
    ...(geolocation ? { geolocation } : {}),
    ...(permissions ? { permissions } : {}),
  };
}

function buildDeviceOptions(): Partial<PlaywrightTestConfig['use']> {
  const colorScheme = environment('COLOR_SCHEME') as 'light' | 'dark' | 'no-preference' | undefined;
  const hasTouch = !!environment('HAS_TOUCH');
  const isMobile = !!environment('IS_MOBILE');

  return {
    ...(colorScheme ? { colorScheme } : {}),
    ...(hasTouch ? { hasTouch } : {}),
    ...(isMobile ? { isMobile } : {}),
  };
}

function buildSecurityOptions(): Partial<PlaywrightTestConfig['use']> {
  const ignoreHTTPSErrors = !!environment('IGNORE_HTTPS_ERRORS');
  const bypassCSP = !!environment('BYPASS_CSP');
  const javaScriptEnabled = !!environment('JAVASCRIPT_ENABLED');
  const acceptDownloads = !!environment('ACCEPT_DOWNLOADS');

  return {
    ...(ignoreHTTPSErrors ? { ignoreHTTPSErrors } : {}),
    ...(bypassCSP ? { bypassCSP } : {}),
    ...(javaScriptEnabled === false ? { javaScriptEnabled } : {}),
    ...(acceptDownloads === false ? { acceptDownloads } : {}),
  };
}

function buildTimeoutOptions(): Partial<PlaywrightTestConfig['use']> {
  const actionTimeout = +environment('ACTION_TIMEOUT')!;
  const navigationTimeout = +environment('NAVIGATION_TIMEOUT')!;

  return {
    ...(actionTimeout > 0 ? { actionTimeout } : {}),
    ...(navigationTimeout > 0 ? { navigationTimeout } : {}),
  };
}

function buildContextOptions(): Partial<PlaywrightTestConfig['use']> {
  return {
    ...buildViewportOptions(),
    ...buildLocationOptions(),
    ...buildDeviceOptions(),
    ...buildSecurityOptions(),
    ...buildTimeoutOptions(),
  };
}

function buildVideoOptions(): Partial<PlaywrightTestConfig['use']> {
  const videoEnvironment = environment('VIDEO');
  const videoSize = parseVideoSize(environment('VIDEO_SIZE'));

  if (!videoEnvironment || videoEnvironment === 'off') {
    return {};
  }

  const videoOption = videoSize
    ? {
        mode: videoEnvironment as 'on' | 'on-first-retry' | 'retain-on-failure',
        size: videoSize,
      }
    : (videoEnvironment as 'on' | 'on-first-retry' | 'retain-on-failure');

  return {
    video: videoOption,
  };
}

function buildBrowserLaunchOptions(): Partial<PlaywrightTestConfig['use']> {
  const slowMo = +environment('SLOW_MO')!;
  const browserChannel = environment('BROWSER_CHANNEL');
  const browserArguments = environment('BROWSER_ARGS');
  const proxyServer = environment('PROXY_SERVER');

  return {
    ...(slowMo > 0 ? { slowMo } : {}),
    ...(browserChannel ? { channel: browserChannel } : {}),
    ...(browserArguments
      ? {
          launchOptions: {
            args: browserArguments
              .split(',')
              .map((argument) => argument.trim())
              .filter(Boolean),
          },
        }
      : {}),
    ...(proxyServer ? { proxy: { server: proxyServer } } : {}),
  };
}

export function getBrowserProject(
  name: 'chromium' | 'firefox' | 'webkit',
  device: keyof typeof devices,
): BrowserProject {
  const use: PlaywrightTestConfig['use'] = {
    ...devices[device],
    ...buildContextOptions(),
    ...buildVideoOptions(),
    ...buildBrowserLaunchOptions(),
  };

  return {
    name,
    use,
  };
}
