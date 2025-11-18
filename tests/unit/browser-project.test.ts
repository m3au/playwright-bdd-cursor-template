import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { getBrowserProject, type BrowserProject } from '@utils';

function getSlowMo(project: BrowserProject): number | undefined {
  return (project.use as { slowMo?: number })?.slowMo;
}

describe('browser-project', () => {
  const originalEnvironment: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of Object.keys(process.env)) {
      if (
        key.startsWith('VIEWPORT_') ||
        key.startsWith('DEVICE_') ||
        key.startsWith('GEOLOCATION') ||
        key.startsWith('PERMISSIONS') ||
        key.startsWith('VIDEO') ||
        key.startsWith('BROWSER_') ||
        key.startsWith('PROXY_') ||
        key.startsWith('USER_') ||
        key.startsWith('LOCALE') ||
        key.startsWith('TIMEZONE') ||
        key.startsWith('COLOR_') ||
        key.startsWith('HAS_') ||
        key.startsWith('IS_') ||
        key.startsWith('IGNORE_') ||
        key.startsWith('BYPASS_') ||
        key.startsWith('JAVASCRIPT_') ||
        key.startsWith('ACCEPT_') ||
        key.startsWith('ACTION_') ||
        key.startsWith('NAVIGATION_') ||
        key.startsWith('SLOW_')
      ) {
        originalEnvironment[key] = process.env[key];
      }
    }
    process.env['SLOW_MO'] = '0';
    process.env['VIEWPORT_WIDTH'] = '0';
    process.env['VIEWPORT_HEIGHT'] = '0';
    process.env['DEVICE_SCALE_FACTOR'] = '1';
    process.env['ACTION_TIMEOUT'] = '0';
    process.env['NAVIGATION_TIMEOUT'] = '0';
    process.env['USER_AGENT'] = '';
    process.env['LOCALE'] = '';
    process.env['TIMEZONE_ID'] = '';
    process.env['GEOLOCATION'] = '';
    process.env['PERMISSIONS'] = '';
    process.env['BROWSER_CHANNEL'] = '';
    process.env['BROWSER_ARGS'] = '';
    process.env['COLOR_SCHEME'] = '';
  });

  afterEach(() => {
    for (const key of Object.keys(originalEnvironment)) {
      if (originalEnvironment[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = originalEnvironment[key];
      }
    }
    for (const key of Object.keys(originalEnvironment)) delete originalEnvironment[key];
  });

  describe('getBrowserProject', () => {
    describe('browser configurations', () => {
      test('should return chromium project with device settings', () => {
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.name).toBe('chromium');
        expect(project.use?.viewport).toBeDefined();
        expect(project.use?.userAgent).toBeDefined();
      });

      test('should return firefox project with device settings', () => {
        const project = getBrowserProject('firefox', 'Desktop Firefox');

        expect(project.name).toBe('firefox');
        expect(project.use?.viewport).toBeDefined();
      });

      test('should return webkit project with device settings', () => {
        const project = getBrowserProject('webkit', 'Desktop Safari');

        expect(project.name).toBe('webkit');
        expect(project.use?.viewport).toBeDefined();
      });
    });

    describe('slowMo configuration', () => {
      test('should include slowMo when SLOW_MO is greater than 0', () => {
        process.env['SLOW_MO'] = '100';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(getSlowMo(project)).toBe(100);
      });

      test('should not include slowMo when SLOW_MO is 0', () => {
        process.env['SLOW_MO'] = '0';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(getSlowMo(project)).toBeUndefined();
      });

      test('should not include slowMo when SLOW_MO is empty', () => {
        process.env['SLOW_MO'] = '';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(getSlowMo(project)).toBeUndefined();
      });
    });

    describe('viewport options', () => {
      test('should include viewport when width and height are greater than 0', () => {
        process.env['VIEWPORT_WIDTH'] = '1920';
        process.env['VIEWPORT_HEIGHT'] = '1080';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.viewport).toEqual({ width: 1920, height: 1080 });
      });

      test('should not override device viewport when width is 0', () => {
        process.env['VIEWPORT_WIDTH'] = '0';
        process.env['VIEWPORT_HEIGHT'] = '1080';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.viewport).toBeDefined();
        expect(project.use?.viewport?.width).not.toBe(0);
      });

      test('should not override device viewport when height is 0', () => {
        process.env['VIEWPORT_WIDTH'] = '1920';
        process.env['VIEWPORT_HEIGHT'] = '0';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.viewport).toBeDefined();
        expect(project.use?.viewport?.height).not.toBe(0);
      });

      test('should include deviceScaleFactor when greater than 0 and not 1', () => {
        process.env['DEVICE_SCALE_FACTOR'] = '2';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.deviceScaleFactor).toBe(2);
      });

      test('should use device deviceScaleFactor when set to 1', () => {
        process.env['DEVICE_SCALE_FACTOR'] = '1';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.deviceScaleFactor).toBeDefined();
        expect(project.use?.deviceScaleFactor).toBe(1);
      });
    });

    describe('location options', () => {
      test('should include userAgent when set', () => {
        process.env['USER_AGENT'] = 'Custom User Agent';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.userAgent).toBe('Custom User Agent');
      });

      test('should include locale when set', () => {
        process.env['LOCALE'] = 'en-US';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.locale).toBe('en-US');
      });

      test('should include timezoneId when set', () => {
        process.env['TIMEZONE_ID'] = 'America/New_York';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.timezoneId).toBe('America/New_York');
      });

      test('should parse geolocation with latitude and longitude', () => {
        process.env['GEOLOCATION'] = '40.7128,-74.0060';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.geolocation).toEqual({ latitude: 40.7128, longitude: -74.006 });
      });

      test('should parse geolocation with accuracy', () => {
        process.env['GEOLOCATION'] = '40.7128,-74.0060,100';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.geolocation).toEqual({
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 100,
        });
      });

      test('should not include geolocation when invalid format', () => {
        process.env['GEOLOCATION'] = 'invalid';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.geolocation).toBeUndefined();
      });

      test('should parse permissions as array', () => {
        process.env['PERMISSIONS'] = 'geolocation,notifications';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.permissions).toEqual(['geolocation', 'notifications']);
      });

      test('should trim and filter empty permissions', () => {
        process.env['PERMISSIONS'] = 'geolocation, ,notifications,';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.permissions).toEqual(['geolocation', 'notifications']);
      });
    });

    describe('device options', () => {
      test('should include colorScheme when set', () => {
        process.env['COLOR_SCHEME'] = 'dark';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.colorScheme).toBe('dark');
      });

      test('should include hasTouch when set to 1', () => {
        process.env['HAS_TOUCH'] = '1';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.hasTouch).toBe(true);
      });

      test('should include isMobile when set to 1', () => {
        process.env['IS_MOBILE'] = '1';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.isMobile).toBe(true);
      });
    });

    describe('security options', () => {
      test('should include ignoreHTTPSErrors when set to 1', () => {
        process.env['IGNORE_HTTPS_ERRORS'] = '1';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.ignoreHTTPSErrors).toBe(true);
      });

      test('should include bypassCSP when set to 1', () => {
        process.env['BYPASS_CSP'] = '1';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.bypassCSP).toBe(true);
      });

      test('should include javaScriptEnabled when set to empty (false)', () => {
        process.env['JAVASCRIPT_ENABLED'] = '';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.javaScriptEnabled).toBe(false);
      });

      test('should include acceptDownloads when set to empty (false)', () => {
        process.env['ACCEPT_DOWNLOADS'] = '';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.acceptDownloads).toBe(false);
      });
    });

    describe('timeout options', () => {
      test('should include actionTimeout when greater than 0', () => {
        process.env['ACTION_TIMEOUT'] = '5000';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.actionTimeout).toBe(5000);
      });

      test('should include navigationTimeout when greater than 0', () => {
        process.env['NAVIGATION_TIMEOUT'] = '10000';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.navigationTimeout).toBe(10_000);
      });

      test('should not include actionTimeout when 0', () => {
        process.env['ACTION_TIMEOUT'] = '0';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.actionTimeout).toBeUndefined();
      });
    });

    describe('video options', () => {
      test('should include video when VIDEO is on', () => {
        process.env['VIDEO'] = 'on';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.video).toBe('on');
      });

      test('should include video with size when VIDEO_SIZE is set', () => {
        process.env['VIDEO'] = 'on';
        process.env['VIDEO_SIZE'] = '1280x720';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.video).toEqual({ mode: 'on', size: { width: 1280, height: 720 } });
      });

      test('should not include video when VIDEO is off', () => {
        process.env['VIDEO'] = 'off';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.video).toBeUndefined();
      });

      test('should not include video when VIDEO is empty', () => {
        process.env['VIDEO'] = '';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.video).toBeUndefined();
      });

      test('should not parse invalid VIDEO_SIZE format', () => {
        process.env['VIDEO'] = 'on';
        process.env['VIDEO_SIZE'] = 'invalid';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.video).toBe('on');
        expect((project.use?.video as { size?: unknown })?.size).toBeUndefined();
      });
    });

    describe('browser launch options', () => {
      test('should include browserChannel when set', () => {
        process.env['BROWSER_CHANNEL'] = 'chrome';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.channel).toBe('chrome');
      });

      test('should parse browserArgs as array', () => {
        process.env['BROWSER_ARGS'] = '--disable-blink-features=AutomationControlled,--no-sandbox';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.launchOptions?.args).toEqual([
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
        ]);
      });

      test('should trim and filter empty browserArgs', () => {
        process.env['BROWSER_ARGS'] = '--arg1, ,--arg2,';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.launchOptions?.args).toEqual(['--arg1', '--arg2']);
      });

      test('should include proxyServer when set', () => {
        process.env['PROXY_SERVER'] = 'http://proxy.example.com:8080';
        const project = getBrowserProject('chromium', 'Desktop Chrome');

        expect(project.use?.proxy).toEqual({ server: 'http://proxy.example.com:8080' });
      });
    });
  });
});
