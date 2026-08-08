'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');

const request = require('supertest');
const mount = require('..');
const Koa = require('koa');

describe('mount(app)', () => {
  it('should mount at /', async () => {
    const a = new Koa();
    const b = new Koa();

    a.use(async function (ctx, next) {
      await next();
      if (ctx.path === '/hello') ctx.body = 'Hello';
    });

    b.use(async function (ctx, next) {
      await next();
      if (ctx.path === '/world') ctx.body = 'World';
    });

    const app = new Koa();
    app.use(mount(a));
    app.use(mount(b));

    const server = app.listen();
    await request(server).get('/').expect(404);
    await request(server).get('/hello').expect('Hello');
    await request(server).get('/world').expect('World');
    server.close();
  });
});

describe('mount(path, app)', () => {
  it('should mount the app at the given path', async () => {
    const app = new Koa();
    const a = new Koa();
    const b = new Koa();

    a.use(async function (ctx, next) {
      await next();
      ctx.body = 'Hello';
    });

    b.use(async function (ctx, next) {
      await next();
      ctx.body = 'World';
    });

    app.use(mount('/hello', a));
    app.use(mount('/world', b));

    const server = app.listen();
    await request(server).get('/hello').expect('Hello');
    await request(server).get('/world').expect('World');
    await request(server).get('/').expect(404);
    server.close();
  });

  it('should cascade properly', async () => {
    const app = new Koa();
    const a = new Koa();
    const b = new Koa();
    const c = new Koa();

    a.use(async function (ctx, next) {
      await next();
      if (!ctx.body) ctx.body = 'foo';
    });

    b.use(async function (ctx, next) {
      await next();
      if (!ctx.body) ctx.body = 'bar';
    });

    c.use(async function (ctx, next) {
      await next();
      ctx.body = 'baz';
    });

    app.use(mount('/foo', a));
    a.use(mount('/bar', b));
    b.use(mount('/baz', c));

    const server = app.listen();
    await request(server).get('/').expect(404);
    await request(server).get('/foo').expect('foo');
    await request(server).get('/foo/bar').expect('bar');
    await request(server).get('/foo/bar/baz').expect('baz');
    server.close();
  });

  it('should restore prefix for mounted apps', async () => {
    const app = new Koa();
    const a = new Koa();
    const b = new Koa();
    const c = new Koa();

    a.use(async function (ctx, next) {
      ctx.body = 'foo';
      await next();
    });

    b.use(async function (ctx, next) {
      ctx.body = 'bar';
      await next();
    });

    c.use(async function (ctx, next) {
      ctx.body = 'baz';
      await next();
    });

    app.use(mount('/foo', a));
    app.use(mount('/foo/bar', b));
    app.use(mount('/foo/bar/baz', c));

    const server = app.listen();
    await request(server).get('/foo/bar').expect('bar');
    server.close();
  });

  it('should restore prefix for mounted middleware', async () => {
    const app = new Koa();

    app.use(
      mount('/foo', async function (ctx, next) {
        ctx.body = 'foo';
        await next();
      }),
    );

    app.use(
      mount('/foo/bar', async function (ctx, next) {
        ctx.body = 'bar';
        await next();
      }),
    );

    app.use(
      mount('/foo/bar/baz', async function (ctx, next) {
        ctx.body = 'baz';
        await next();
      }),
    );

    const server = app.listen();
    await request(server).get('/foo/bar').expect('bar');
    server.close();
  });

  it('should have the correct path', async () => {
    const app = new Koa();
    const a = new Koa();

    a.use(async function (ctx, next) {
      assert.strictEqual(ctx.path, '/');
      await next();
      assert.strictEqual(ctx.path, '/');
    });

    app.use(async function (ctx, next) {
      assert.strictEqual(ctx.path, '/foo');
      await next();
      assert.strictEqual(ctx.path, '/foo');
    });

    app.use(mount('/foo', a));

    const server = app.listen();
    await request(server).get('/foo');
    server.close();
  });

  describe('when errors occur', () => {
    it('should have the correct path', async () => {
      const app = new Koa();
      const a = new Koa();

      a.use(async function (ctx) {
        assert.strictEqual(ctx.path, '/');
        return ctx.throw(403, 'Forbidden');
      });

      app.use(async function (ctx, next) {
        assert.strictEqual(ctx.path, '/foo');

        try {
          await next();
        } catch (err) {
          assert.strictEqual(ctx.path, '/foo');
        }
      });

      app.use(mount('/foo', a));

      const server = app.listen();
      await request(server).get('/foo');
      server.close();
    });
  });

  describe('when middleware is passed', () => {
    it('should mount', async () => {
      async function hello(ctx, next) {
        await next();
        ctx.body = 'Hello';
      }

      async function world(ctx, next) {
        await next();
        ctx.body = 'World';
      }

      const app = new Koa();

      app.use(mount('/hello', hello));
      app.use(mount('/world', world));

      const server = app.listen();
      await request(server).get('/hello').expect('Hello');
      await request(server).get('/world').expect('World');
      server.close();
    });
  });
});

describe('mount(app, middleware)', () => {
  it('should mount the app', async () => {
    const calls = [];
    const app = new Koa();
    app.use(
      mount([
        async (ctx, next) => {
          calls.push(1);
          await next();
        },
        async (ctx, next) => {
          calls.push(2);
          ctx.body = 'Hello World';
        },
      ]),
    );

    const server = app.listen();
    await request(server).get('/').expect('Hello World').expect(200);
    server.close();

    assert.deepStrictEqual(calls, [1, 2]);
  });
});

describe('mount(/prefix)', () => {
  const app = new Koa();
  let server;

  before(() => {
    server = app.listen();
  });

  after(() => server?.close());

  app.use(
    mount('/prefix', function (ctx) {
      ctx.status = 204;
    }),
  );

  it('should not match /kljasdf', async () => {
    await request(server).get('/kljasdf').expect(404);
  });

  it('should not match /prefixlaksjdf', async () => {
    await request(server).get('/prefixlaksjdf').expect(404);
  });

  it('should match /prefix', async () => {
    await request(server).get('/prefix').expect(204);
  });

  it('should match /prefix/', async () => {
    await request(server).get('/prefix/').expect(204);
  });

  it('should match /prefix/lkjasdf', async () => {
    await request(server).get('/prefix/lkjasdf').expect(204);
  });
});

describe('mount(/prefix/)', () => {
  let server;

  before(() => {
    const app = new Koa();

    app.use(
      mount('/prefix/', function (ctx) {
        ctx.status = 204;
      }),
    );

    server = app.listen();
  });

  after(() => server?.close());

  it('should not match /kljasdf', async () => {
    await request(server).get('/kljasdf').expect(404);
  });

  it('should not match /prefixlaksjdf', async () => {
    await request(server).get('/prefixlaksjdf').expect(404);
  });

  it('should not match /prefix', async () => {
    await request(server).get('/prefix').expect(404);
  });

  it('should match /prefix/', async () => {
    await request(server).get('/prefix/').expect(204);
  });

  it('should match /prefix/lkjasdf', async () => {
    await request(server).get('/prefix/lkjasdf').expect(204);
  });
});

describe('mount(/prefix) multiple', () => {
  const app = new Koa();

  app.use(
    mount('/a', async (ctx) => {
      ctx.assert.equal('/a', ctx.path, 404);
      ctx.status = 204;
    }),
  );

  app.use(
    mount('/b', async (ctx) => {
      ctx.assert.equal('/b', ctx.path, 404);
      ctx.status = 204;
    }),
  );

  app.use(
    mount('/c', async (ctx) => {
      ctx.assert.equal('/c', ctx.path, 404);
      ctx.status = 204;
    }),
  );

  let server;
  before(() => {
    server = app.listen();
  });

  after(() => server?.close());

  it('should serve all the right mounted paths', async () => {
    await request(server).get('/a/a').expect(204);

    await request(server).get('/b/b').expect(204);

    await request(server).get('/c/c').expect(204);
  });

  it('should 404 on all the wrong paths', async () => {
    await request(server).get('/a/b').expect(404);

    await request(server).get('/b/c').expect(404);

    await request(server).get('/c/a').expect(404);
  });
});
