
var request = require('supertest');
var mount = require('..');
var koa = require('koa');

describe('mount(app)', function(){
  it('should mount at /', function(done){
    var a = koa();
    var b = koa();

    a.use(function(next){
      return function *(){
        yield next;
        if ('/hello' == this.path) this.body = 'Hello';
      }
    });

    b.use(function(next){
      return function *(){
        yield next;
        if ('/world' == this.path) this.body = 'World';
      }
    });

    var app = koa();
    app.use(mount(a));
    app.use(mount(b));

    request(app.listen())
    .get('/')
    .expect(404)
    .end(function(err){
      if (err) return done(err);

      request(app.listen())
      .get('/hello')
      .expect('Hello')
      .end(function(err){
        if (err) return done(err);

        request(app.listen())
        .get('/world')
        .expect('World', done);
      });
    });
  })
})

describe('mount(path, app)', function(){
  it('should mount the app at the given path', function(done){
    var app = koa();
    var a = koa();
    var b = koa();

    a.use(function(next){
      return function *(){
        yield next;
        this.body = 'Hello';
      }
    });

    b.use(function(next){
      return function *(){
        yield next;
        this.body = 'World';
      }
    });

    app.use(mount('/hello', a));
    app.use(mount('/world', b));

    request(app.listen())
    .get('/hello')
    .expect('Hello')
    .end(function(err){
      if (err) return done(err);
      
      request(app.listen())
      .get('/world')
      .expect('World')
      .end(function(err){
        if (err) return done(err);

        request(app.listen())
        .get('/')
        .expect(404, done);
      });
    });
  })

  it('should cascade properly', function(done){
    var app = koa();
    var a = koa();
    var b = koa();
    var c = koa();

    a.use(function(next){
      return function *(){
        yield next;
        if (!this.body) this.body = 'foo';
      }
    });

    b.use(function(next){
      return function *(){
        yield next;
        if (!this.body) this.body = 'bar';
      }
    });

    c.use(function(next){
      return function *(){
        yield next;
        this.body = 'baz';
      }
    });

    app.use(mount('/foo', a));
    a.use(mount('/bar', b));
    b.use(mount('/baz', c));

    request(app.listen())
    .get('/')
    .expect(404)
    .end(function(err){
      if (err) return done(err);
      
      request(app.listen())
      .get('/foo')
      .expect('foo')
      .end(function(err){
        if (err) return done(err);

        request(app.listen())
        .get('/foo/bar')
        .expect('bar')
        .end(function(err){
          if (err) return done(err);

          request(app.listen())
          .get('/foo/bar/baz')
          .expect('baz', done);
        });
      });
    });
  })
})