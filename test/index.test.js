import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { createImageFile, startServer, uniqueName } from './support/server.js';

describe('GET /', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(async () => {
    await server.close();
  });

  it('responds with an HTML page', async () => {
    const res = await fetch(server.baseUrl + '/');

    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /text\/html/u);

    const body = await res.text();
    assert.match(body, /<!DOCTYPE html>/iu);
  });

  it('lists an image present in the images directory', async () => {
    const filename = uniqueName('listed', 'png');
    const cleanup = await createImageFile(filename, 'fake png');

    try {
      const res = await fetch(server.baseUrl + '/');
      const body = await res.text();

      assert.equal(res.status, 200);
      assert.ok(
        body.includes(filename),
        `expected the home page to mention ${filename}`
      );
      assert.ok(
        body.includes(`/images/${filename}`),
        'expected an <img> pointing at the uploaded image'
      );
    } finally {
      await cleanup();
    }
  });

  it('ignores files that are not images', async () => {
    const textName = uniqueName('notes', 'txt');
    const cleanup = await createImageFile(textName, 'not an image');

    try {
      const res = await fetch(server.baseUrl + '/');
      const body = await res.text();

      assert.ok(
        !body.includes(textName),
        `did not expect the non-image file ${textName} to be listed`
      );
    } finally {
      await cleanup();
    }
  });

  it('lists gif, jpg and png files', async () => {
    const names = [
      uniqueName('pic', 'gif'),
      uniqueName('pic', 'jpg'),
      uniqueName('pic', 'png')
    ];
    const cleanups = await Promise.all(
      names.map(name => createImageFile(name, 'fake'))
    );

    try {
      const res = await fetch(server.baseUrl + '/');
      const body = await res.text();

      for (const name of names) {
        assert.ok(body.includes(name), `expected ${name} to be listed`);
      }
    } finally {
      await Promise.all(cleanups.map(cleanup => cleanup()));
    }
  });

  it('does not list .jpeg files (the filter regex /je?pg/ misses "jpeg")', async () => {
    // Characterizes a real quirk: the index filter is /\.(?:gif|je?pg|png)$/u,
    // which matches "jpg" and "jepg" but not "jpeg". If the regex is ever
    // fixed to include jpeg, update this test to expect the file to be listed.
    const jpegName = uniqueName('pic', 'jpeg');
    const cleanup = await createImageFile(jpegName, 'fake');

    try {
      const res = await fetch(server.baseUrl + '/');
      const body = await res.text();

      assert.ok(
        !body.includes(jpegName),
        `the filter regex currently excludes ${jpegName}`
      );
    } finally {
      await cleanup();
    }
  });
});
