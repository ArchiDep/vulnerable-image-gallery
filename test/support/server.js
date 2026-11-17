import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { join as joinPath } from 'node:path';
import log4js from 'log4js';

import app from '../../app.js';
import { imagesDir } from '../../config.js';

// Silence the request logger so the test output stays readable.
log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: 'off' } }
});

/**
 * Starts the gallery application on an ephemeral port and returns its base URL
 * along with a close function.
 */
export async function startServer() {
  const server = createServer(app);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close() {
      return new Promise((resolve, reject) =>
        server.close(err => (err ? reject(err) : resolve()))
      );
    }
  };
}

/**
 * Returns a filename that is unique to the current test run, so that test
 * files running in parallel do not clobber each other's fixtures in the shared
 * images directory.
 */
export function uniqueName(prefix, extension) {
  return `${prefix}-${randomBytes(6).toString('hex')}.${extension}`;
}

/**
 * Writes a fixture file directly into the gallery's images directory and
 * returns a cleanup function that removes it again.
 */
export async function createImageFile(filename, contents) {
  const file = joinPath(imagesDir, filename);
  await fs.writeFile(file, contents);
  return () => fs.rm(file, { force: true });
}
