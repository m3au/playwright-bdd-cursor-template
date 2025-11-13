import { describe, expect, test } from 'bun:test';

import { environment, getEnvironment } from '@utils';

describe('env', () => {
  describe('environment', () => {
    test('should return string value when variable exists', () => {
      process.env['TEST_VAR'] = 'test-value';
      expect(environment('TEST_VAR')).toBe('test-value');
      delete process.env['TEST_VAR'];
    });

    test('should return undefined when variable is empty', () => {
      process.env['TEST_VAR'] = '';
      expect(environment('TEST_VAR')).toBeUndefined();
      delete process.env['TEST_VAR'];
    });

    test('should throw error when variable is missing', () => {
      delete process.env['TEST_VAR'];
      expect(() => {
        environment('TEST_VAR');
      }).toThrow('TEST_VAR environment variable is required');
    });

    test('should throw error when variable is undefined', () => {
      process.env['TEST_VAR'] = undefined as unknown as string;
      expect(() => {
        environment('TEST_VAR');
      }).toThrow('TEST_VAR environment variable is required');
      delete process.env['TEST_VAR'];
    });

    test('should return string value for numeric environment variables', () => {
      process.env['TEST_NUM'] = '42';
      expect(environment('TEST_NUM')).toBe('42');
      expect(typeof environment('TEST_NUM')).toBe('string');
      delete process.env['TEST_NUM'];
    });

    test('should return string value for float environment variables', () => {
      process.env['TEST_FLOAT'] = '3.14';
      expect(environment('TEST_FLOAT')).toBe('3.14');
      expect(typeof environment('TEST_FLOAT')).toBe('string');
      delete process.env['TEST_FLOAT'];
    });
  });

  describe('getEnvironment', () => {
    test('should return environment config with all required variables', () => {
      const originalEnvironment = { ...process.env };
      try {
        process.env['BASE_URL_AXE_W3C_BAD'] = 'https://bad.example.com';
        process.env['BASE_URL_AXE_W3C_AFTER'] = 'https://after.example.com';
        process.env['BASE_URL_AXE_DEQUE_MARS'] = 'https://mars.example.com';
        process.env['BASE_URL_LIGHTHOUSE_POLYMER'] = 'https://polymer.example.com';
        process.env['BASE_URL_LIGHTHOUSE_W3C_BAD'] = 'https://lighthouse-bad.example.com';
        process.env['TIMEOUT'] = '30000';
        process.env['EXPECT_TIMEOUT'] = '10000';
        process.env['WORKERS'] = '4';
        process.env['RETRIES'] = '2';
        process.env['REPEAT_EACH'] = '1';
        process.env['FULLY_PARALLEL'] = '1';
        process.env['FORBID_ONLY'] = '';
        process.env['MAX_FAILURES'] = '5';
        process.env['CHROMIUM'] = '1';
        process.env['FIREFOX'] = '';
        process.env['WEBKIT'] = '';
        process.env['HEADED'] = '';
        process.env['SLOW_MO'] = '100';
        process.env['VIEWPORT_WIDTH'] = '1920';
        process.env['VIEWPORT_HEIGHT'] = '1080';
        process.env['DEVICE_SCALE_FACTOR'] = '2';
        process.env['REDUCED_MOTION'] = '';
        process.env['FORCED_COLORS'] = '';
        process.env['HAS_TOUCH'] = '';
        process.env['IS_MOBILE'] = '';
        process.env['IGNORE_HTTPS_ERRORS'] = '';
        process.env['BYPASS_CSP'] = '';
        process.env['JAVASCRIPT_ENABLED'] = '1';
        process.env['ACCEPT_DOWNLOADS'] = '1';
        process.env['ACTION_TIMEOUT'] = '5000';
        process.env['NAVIGATION_TIMEOUT'] = '10000';
        process.env['TRACE'] = 'on';
        process.env['SCREENSHOT'] = 'on';
        process.env['VIDEO'] = 'off';
        process.env['LIGHTHOUSE_PERFORMANCE'] = '0.9';
        process.env['LIGHTHOUSE_ACCESSIBILITY'] = '0.95';
        process.env['LIGHTHOUSE_BEST_PRACTICES'] = '0.85';
        process.env['LIGHTHOUSE_SEO'] = '0.8';
        process.env['LIGHTHOUSE_PWA'] = '0.75';
        process.env['AXE_MAX_VIOLATIONS'] = '10';

        const result = getEnvironment();

        expect(result.environment.timeout).toBe(30_000);
        expect(result.environment.expectTimeout).toBe(10_000);
        expect(result.environment.workers).toBe('4');
        expect(result.environment.retries).toBe(2);
        expect(result.environment.repeatEach).toBe(1);
        expect(result.environment.fullyParallel).toBe(true);
        expect(result.environment.forbidOnly).toBe(false);
        expect(result.environment.maxFailures).toBe(5);
        expect(result.environment.chromium).toBe(true);
        expect(result.environment.firefox).toBe(false);
        expect(result.environment.webkit).toBe(false);
        expect(result.environment.headed).toBe(false);
        expect(result.environment.slowMo).toBe(100);
        expect(result.environment.viewportWidth).toBe(1920);
        expect(result.environment.viewportHeight).toBe(1080);
        expect(result.environment.deviceScaleFactor).toBe(2);
        expect(result.environment.reducedMotion).toBe(false);
        expect(result.environment.forcedColors).toBe(false);
        expect(result.environment.hasTouch).toBe(false);
        expect(result.environment.isMobile).toBe(false);
        expect(result.environment.ignoreHTTPSErrors).toBe(false);
        expect(result.environment.bypassCSP).toBe(false);
        expect(result.environment.javaScriptEnabled).toBe(true);
        expect(result.environment.acceptDownloads).toBe(true);
        expect(result.environment.actionTimeout).toBe(5000);
        expect(result.environment.navigationTimeout).toBe(10_000);
        expect(result.environment.trace).toBe('on');
        expect(result.environment.screenshot).toBe('on');
        expect(result.environment.video).toBe('off');
        expect(result.environment.lighthousePerformance).toBe(0.9);
        expect(result.environment.lighthouseAccessibility).toBe(0.95);
        expect(result.environment.lighthouseBestPractices).toBe(0.85);
        expect(result.environment.lighthouseSEO).toBe(0.8);
        expect(result.environment.lighthousePWA).toBe(0.75);
        expect(result.environment.axeMaxViolations).toBe(10);
        expect(result.environment.axeTargets).toEqual([
          { name: 'w3c-bad', url: 'https://bad.example.com' },
          { name: 'w3c-after', url: 'https://after.example.com' },
          { name: 'deque-mars', url: 'https://mars.example.com' },
        ]);
        expect(result.environment.lighthouseTargets).toEqual([
          { name: 'polymer-shop', url: 'https://polymer.example.com' },
          { name: 'w3c-bad', url: 'https://lighthouse-bad.example.com' },
        ]);
      } finally {
        process.env = originalEnvironment;
      }
    });

    test('should handle optional variables as undefined', () => {
      const originalEnvironment = { ...process.env };
      try {
        process.env['BASE_URL_AXE_W3C_BAD'] = 'https://bad.example.com';
        process.env['BASE_URL_AXE_W3C_AFTER'] = 'https://after.example.com';
        process.env['BASE_URL_AXE_DEQUE_MARS'] = 'https://mars.example.com';
        process.env['BASE_URL_LIGHTHOUSE_POLYMER'] = 'https://polymer.example.com';
        process.env['BASE_URL_LIGHTHOUSE_W3C_BAD'] = 'https://lighthouse-bad.example.com';
        process.env['TIMEOUT'] = '30000';
        process.env['EXPECT_TIMEOUT'] = '10000';
        process.env['WORKERS'] = '4';
        process.env['RETRIES'] = '0';
        process.env['REPEAT_EACH'] = '0';
        process.env['FULLY_PARALLEL'] = '';
        process.env['FORBID_ONLY'] = '';
        process.env['MAX_FAILURES'] = '0';
        process.env['CHROMIUM'] = '';
        process.env['FIREFOX'] = '';
        process.env['WEBKIT'] = '';
        process.env['HEADED'] = '';
        process.env['SLOW_MO'] = '0';
        process.env['VIEWPORT_WIDTH'] = '0';
        process.env['VIEWPORT_HEIGHT'] = '0';
        process.env['DEVICE_SCALE_FACTOR'] = '1';
        process.env['REDUCED_MOTION'] = '';
        process.env['FORCED_COLORS'] = '';
        process.env['HAS_TOUCH'] = '';
        process.env['IS_MOBILE'] = '';
        process.env['IGNORE_HTTPS_ERRORS'] = '';
        process.env['BYPASS_CSP'] = '';
        process.env['JAVASCRIPT_ENABLED'] = '';
        process.env['ACCEPT_DOWNLOADS'] = '';
        process.env['ACTION_TIMEOUT'] = '0';
        process.env['NAVIGATION_TIMEOUT'] = '0';
        process.env['TRACE'] = 'off';
        process.env['SCREENSHOT'] = 'off';
        process.env['VIDEO'] = '';
        process.env['LIGHTHOUSE_PERFORMANCE'] = '0';
        process.env['LIGHTHOUSE_ACCESSIBILITY'] = '0';
        process.env['LIGHTHOUSE_BEST_PRACTICES'] = '0';
        process.env['LIGHTHOUSE_SEO'] = '0';
        process.env['LIGHTHOUSE_PWA'] = '0';
        process.env['AXE_MAX_VIOLATIONS'] = '0';

        const result = getEnvironment();

        expect(result.environment.browserChannel).toBeUndefined();
        expect(result.environment.browserArgs).toBeUndefined();
        expect(result.environment.userAgent).toBeUndefined();
        expect(result.environment.locale).toBeUndefined();
        expect(result.environment.timezoneId).toBeUndefined();
        expect(result.environment.geolocation).toBeUndefined();
        expect(result.environment.permissions).toBeUndefined();
        expect(result.environment.colorScheme).toBeUndefined();
        expect(result.environment.proxyServer).toBeUndefined();
        expect(result.environment.videoSize).toBeUndefined();
        expect(result.environment.videoPath).toBeUndefined();
        expect(result.environment.video).toBe('off');
      } finally {
        process.env = originalEnvironment;
      }
    });
  });
});
