import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import path from 'node:path';

export const W3C_BAD_ZIP_SHA256 =
  'fd538ed4a594eb397fd99e75ab25744d1419fceece961bbfe0bcee9785123216';

const vendorRoot = path.join(process.cwd(), 'tests/audit/vendor/w3c-bad-demo');
const zipPath = path.join(vendorRoot, 'bad.zip');
const siteRoot = path.join(vendorRoot, 'site');

async function sha256File(filePath: string): Promise<string> {
  return await new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

export function verifyW3cBadZipOnDisk(): void {
  if (!existsSync(zipPath)) {
    throw new Error(`Missing W3C demo archive at ${zipPath}`);
  }
}

export async function verifyW3cBadZipSha256(): Promise<void> {
  verifyW3cBadZipOnDisk();
  const digest = await sha256File(zipPath);
  if (digest !== W3C_BAD_ZIP_SHA256) {
    throw new Error(
      `W3C bad.zip sha256 mismatch (got ${digest}, expected ${W3C_BAD_ZIP_SHA256}).`,
    );
  }
}

export function extractW3cBadDemo(): void {
  verifyW3cBadZipOnDisk();
  if (existsSync(path.join(siteRoot, 'before', 'home.html'))) {
    return;
  }
  mkdirSync(siteRoot, { recursive: true });
  const unzipPath = '/usr/bin/unzip';
  execFileSync(unzipPath, ['-q', zipPath, '-d', siteRoot], { stdio: 'pipe' });
}

function contentTypeFor(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8';
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8';
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (filePath.endsWith('.png')) return 'image/png';
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg';
  if (filePath.endsWith('.gif')) return 'image/gif';
  if (filePath.endsWith('.php')) return 'text/html; charset=utf-8';
  return 'application/octet-stream';
}

export async function startW3cDemoServer(): Promise<{
  readonly baseUrl: string;
  readonly stop: () => Promise<void>;
}> {
  await verifyW3cBadZipSha256();
  extractW3cBadDemo();

  const server: Server = createServer((request, response) => {
    try {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
      const safePath = path
        .normalize(decodeURIComponent(requestUrl.pathname))
        .replace(/^(\.\.[/\\])+/, '');
      const filePath = path.join(siteRoot, safePath);
      if (!filePath.startsWith(siteRoot) || !existsSync(filePath)) {
        response.statusCode = 404;
        response.end('Not found');
        return;
      }
      response.statusCode = 200;
      response.setHeader('content-type', contentTypeFor(filePath));
      response.end(readFileSync(filePath));
    } catch (error) {
      response.statusCode = 500;
      response.end(error instanceof Error ? error.message : 'Server error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new TypeError('W3C demo server did not bind to a TCP port');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  return {
    baseUrl,
    stop: async () => {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
