const path = require('node:path');

const supertest = require('supertest');
const serve = require('koa-static');
const Koa = require('koa');

const mount = require('..');

const root = path.resolve(__dirname, '..');

const app = new Koa();

app.use(mount('/examples', serve(path.resolve(root, 'examples'))));
app.use(mount('/test', serve(path.resolve(root, 'test'))));

const request = supertest.agent(app.listen());

describe('Acceptance: Multiple Mounts', () => {
  it('should serve /examples', async () => {
    await request.get('/examples/cascade.js').expect(200);
  });

  it('should serve /test', async () => {
    await request.get('/test/errors.js').expect(200);
  });
});
