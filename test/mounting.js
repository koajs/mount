
'use strict'

var request = require('supertest')
var mount = require('..')
var Koa = require('koa')
require('should')

describe('mount(app)', function () {
  it('should mount at /', function (done) {
    var a = new Koa()
    var b = new Koa()

    a.use(async function (ctx, next) {
      await next()
      if (ctx.path === '/hello') ctx.body = 'Hello'
    })

    b.use(async function (ctx, next) {
      await next()
      if (ctx.path === '/world') ctx.body = 'World'
    })

    var app = new Koa()
    app.use(mount(a))
    app.use(mount(b))

    request(app.listen())
    .get('/')
    .expect(404)
    .end(function (err) {
      if (err) return done(err)

      request(app.listen())
      .get('/hello')
      .expect('Hello')
      .end(function (err) {
        if (err) return done(err)

        request(app.listen())
        .get('/world')
        .expect('World', done)
      })
    })
  })
})

describe('mount(path, app)', function () {
  it('should mount the app at the given path', function (done) {
    var app = new Koa()
    var a = new Koa()
    var b = new Koa()

    a.use(async function (ctx, next) {
      await next()
      ctx.body = 'Hello'
    })

    b.use(async function (ctx, next) {
      await next()
      ctx.body = 'World'
    })

    app.use(mount('/hello', a))
    app.use(mount('/world', b))

    request(app.listen())
    .get('/hello')
    .expect('Hello')
    .end(function (err) {
      if (err) return done(err)

      request(app.listen())
      .get('/world')
      .expect('World')
      .end(function (err) {
        if (err) return done(err)

        request(app.listen())
        .get('/')
        .expect(404, done)
      })
    })
  })

  it('should cascade properly', function (done) {
    var app = new Koa()
    var a = new Koa()
    var b = new Koa()
    var c = new Koa()

    a.use(async function (ctx, next) {
      await next()
      if (!ctx.body) ctx.body = 'foo'
    })

    b.use(async function (ctx, next) {
      await next()
      if (!ctx.body) ctx.body = 'bar'
    })

    c.use(async function (ctx, next) {
      await next()
      ctx.body = 'baz'
    })

    app.use(mount('/foo', a))
    a.use(mount('/bar', b))
    b.use(mount('/baz', c))

    request(app.listen())
    .get('/')
    .expect(404)
    .end(function (err) {
      if (err) return done(err)

      request(app.listen())
      .get('/foo')
      .expect('foo')
      .end(function (err) {
        if (err) return done(err)

        request(app.listen())
        .get('/foo/bar')
        .expect('bar')
        .end(function (err) {
          if (err) return done(err)

          request(app.listen())
          .get('/foo/bar/baz')
          .expect('baz', done)
        })
      })
    })
  })

  it('should restore prefix for mounted apps', function (done) {
    var app = new Koa()
    var a = new Koa()
    var b = new Koa()
    var c = new Koa()

    a.use(async function (ctx, next) {
      ctx.body = 'foo'
      await next()
    })

    b.use(async function (ctx, next) {
      ctx.body = 'bar'
      await next()
    })

    c.use(async function (ctx, next) {
      ctx.body = 'baz'
      await next()
    })

    app.use(mount('/foo', a))
    app.use(mount('/foo/bar', b))
    app.use(mount('/foo/bar/baz', c))

    request(app.listen())
    .get('/foo/bar')
    .expect('bar', done)
  })

  it('should restore prefix for mounted middleware', function (done) {
    var app = new Koa()

    app.use(mount('/foo', async function (ctx, next) {
      ctx.body = 'foo'
      await next()
    }))

    app.use(mount('/foo/bar', async function (ctx, next) {
      ctx.body = 'bar'
      await next()
    }))

    app.use(mount('/foo/bar/baz', async function (ctx, next) {
      ctx.body = 'baz'
      await next()
    }))

    request(app.listen())
    .get('/foo/bar')
    .expect('bar', done)
  })

  it('should have the correct path', function (done) {
    var app = new Koa()
    var a = new Koa()

    a.use(async function (ctx, next) {
      ctx.path.should.equal('/')
      await next()
      ctx.path.should.equal('/')
    })

    app.use(async function (ctx, next) {
      ctx.path.should.equal('/foo')
      await next()
      ctx.path.should.equal('/foo')
    })

    app.use(mount('/foo', a))

    request(app.listen())
    .get('/foo')
    .end(done)
  })

  describe('when middleware is passed', function () {
    it('should mount', function (done) {
      async function hello (ctx, next) {
        await next()
        ctx.body = 'Hello'
      }

      async function world (ctx, next) {
        await next()
        ctx.body = 'World'
      }

      var app = new Koa()

      app.use(mount('/hello', hello))
      app.use(mount('/world', world))

      request(app.listen())
      .get('/hello')
      .expect('Hello')
      .end(function (err) {
        if (err) return done(err)

        request(app.listen())
        .get('/world')
        .expect('World', done)
      })
    })
  })
})

describe('mount(/prefix)', function () {
  var app = new Koa()

  app.use(mount('/prefix', function (ctx) {
    ctx.status = 204
  }))

  var server = app.listen()

  it('should not match /kljasdf', function (done) {
    request(server)
    .get('/kljasdf')
    .expect(404, done)
  })

  it('should not match /prefixlaksjdf', function (done) {
    request(server)
    .get('/prefixlaksjdf')
    .expect(404, done)
  })

  it('should match /prefix', function (done) {
    request(server)
    .get('/prefix')
    .expect(204, done)
  })

  it('should match /prefix/', function (done) {
    request(server)
    .get('/prefix/')
    .expect(204, done)
  })

  it('should match /prefix/lkjasdf', function (done) {
    request(server)
    .get('/prefix/lkjasdf')
    .expect(204, done)
  })
})

describe('mount(/prefix/)', function () {
  var app = new Koa()

  app.use(mount('/prefix/', function (ctx) {
    ctx.status = 204
  }))

  var server = app.listen()

  it('should not match /kljasdf', function (done) {
    request(server)
    .get('/kljasdf')
    .expect(404, done)
  })

  it('should not match /prefixlaksjdf', function (done) {
    request(server)
    .get('/prefixlaksjdf')
    .expect(404, done)
  })

  it('should not match /prefix', function (done) {
    request(server)
    .get('/prefix')
    .expect(404, done)
  })

  it('should match /prefix/', function (done) {
    request(server)
    .get('/prefix/')
    .expect(204, done)
  })

  it('should match /prefix/lkjasdf', function (done) {
    request(server)
    .get('/prefix/lkjasdf')
    .expect(204, done)
  })
})

describe('mount(/prefix, app, preserve=true)', () => {
  it('should find its context props', async () => {
    const mounted = new Koa()
    mounted.context.a = 1
    mounted.use(async (ctx) => {
      ctx.a.should.equal(1)
      ctx.status = 204
    })

    const app = new Koa()
    app.context.a = 2
    app.use(mount('/a', mounted, true))
    app.use(async (ctx) => {
      ctx.a.should.equal(2)
      ctx.status = 200
    })

    const server = app.listen()

    await request(server)
    .get('/a/b')
    .expect(204)

    await request(server)
    .get('/c/d')
    .expect(200)
  })
})

describe('mount(/prefix) multiple', () => {
  const app = new Koa()

  app.use(mount('/a', async (ctx) => {
    ctx.assert.equal('/a', ctx.path, 404)
    ctx.status = 204
  }))

  app.use(mount('/b', async (ctx) => {
    ctx.assert.equal('/b', ctx.path, 404)
    ctx.status = 204
  }))

  app.use(mount('/c', async (ctx) => {
    ctx.assert.equal('/c', ctx.path, 404)
    ctx.status = 204
  }))

  const server = app.listen()

  it('should serve all the right mounted paths', async () => {
    await request(server)
    .get('/a/a')
    .expect(204)

    await request(server)
    .get('/b/b')
    .expect(204)

    await request(server)
    .get('/c/c')
    .expect(204)
  })

  it('should 404 on all the wrong paths', async () => {
    await request(server)
    .get('/a/b')
    .expect(404)

    await request(server)
    .get('/b/c')
    .expect(404)

    await request(server)
    .get('/c/a')
    .expect(404)
  })
})
