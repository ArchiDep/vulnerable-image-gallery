import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import { join as joinPath } from 'node:path';
import { after, before, describe, it } from 'node:test';

import { imagesDir } from '../config.js';
import { createImageFile, startServer, uniqueName } from './support/server.js';

// A minimal PNG signature followed by a few arbitrary bytes. Enough to assert
// on exact contents without needing a real decoder.
const pngBytes = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02, 0x03, 0x04
]);

describe('GET /images/:image', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(async () => {
    await server.close();
  });

  it('returns the image contents with a matching content type', async () => {
    const filename = uniqueName('served', 'png');
    const cleanup = await createImageFile(filename, pngBytes);

    try {
      const res = await fetch(`${server.baseUrl}/images/${filename}`);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'image/png');

      const body = Buffer.from(await res.arrayBuffer());
      assert.deepEqual(body, pngBytes);
    } finally {
      await cleanup();
    }
  });

  it('derives the content type from the file extension', async () => {
    const filename = uniqueName('served', 'gif');
    const cleanup = await createImageFile(filename, 'GIF89a');

    try {
      const res = await fetch(`${server.baseUrl}/images/${filename}`);

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'image/gif');
    } finally {
      await cleanup();
    }
  });

  it('responds with a server error when the file does not exist', async () => {
    const res = await fetch(
      `${server.baseUrl}/images/${uniqueName('missing', 'png')}`
    );

    assert.equal(res.status, 500);
  });
});

describe('POST /images', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(async () => {
    await server.close();
  });

  it('stores an uploaded image and redirects to the home page', async () => {
    const filename = uniqueName('uploaded', 'png');
    const storedFile = joinPath(imagesDir, filename);

    const form = new FormData();
    form.set('image', new Blob([pngBytes], { type: 'image/png' }), filename);

    try {
      const res = await fetch(server.baseUrl + '/images', {
        method: 'POST',
        body: form,
        redirect: 'manual'
      });

      assert.equal(res.status, 302);
      assert.equal(res.headers.get('location'), '/');

      const stored = await fs.readFile(storedFile);
      assert.deepEqual(stored, pngBytes);
    } finally {
      await fs.rm(storedFile, { force: true });
    }
  });

  it('honours an explicit name field for the stored filename', async () => {
    const filename = uniqueName('renamed', 'png');
    const storedFile = joinPath(imagesDir, filename);

    const form = new FormData();
    // The name field is sent before the file so that multer populates
    // req.body.name before the destination/filename callbacks run.
    form.set('name', filename);
    form.set('image', new Blob([pngBytes], { type: 'image/png' }), 'other.png');

    try {
      const res = await fetch(server.baseUrl + '/images', {
        method: 'POST',
        body: form,
        redirect: 'manual'
      });

      assert.equal(res.status, 302);

      const stored = await fs.readFile(storedFile);
      assert.deepEqual(stored, pngBytes);
    } finally {
      await fs.rm(storedFile, { force: true });
    }
  });
});
