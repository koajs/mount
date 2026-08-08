const path = require('node:path');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const supertest = require('supertest');
const serve = require('koa-static');
const Koa = require('koa');

const mount = require('..');

const root = path.resolve(__dirname, '..');


describe('Acceptance: Multiple Mounts', () => {
  let server;
  let request;

  before(() => {
    const app = new Koa();

    app.use(mount('/examples', serve(path.join(root, 'examples'))));
    app.use(mount('/test', serve(path.join(root, 'test'))));

    server = app.listen();
    request = supertest(server);
  });

  after(() => server.close());

  it('serves examples', async () => {
    const response = await request.get('/examples/cascade.js');
    assert.strictEqual(response.status, 200);
  });

  it('serves test', async () => {
    const response = await request.get('/test/errors.js');
    assert.strictEqual(response.status, 200);
  });
});
