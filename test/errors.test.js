import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

import { startServer } from './support/server.js';

describe('error handling', () => {
  let server;

  before(async () => {
    server = await startServer();
  });

  after(async () => {
    await server.close();
  });

  it('responds with 404 for an unknown route', async () => {
    const res = await fetch(server.baseUrl + '/does-not-exist');

    assert.equal(res.status, 404);

    const body = await res.text();
    assert.match(body, /404/u);
  });

  it('renders the error page as HTML', async () => {
    const res = await fetch(server.baseUrl + '/nope');
    const body = await res.text();

    assert.match(res.headers.get('content-type') ?? '', /text\/html/u);
    assert.match(body, /<h1>/u);
  });
});
