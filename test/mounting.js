
var request = require('supertest');
var mount = require('..');
var koa = require('koa');

describe('mount(path, app)', function(){
  it('should mount the app at the given path', function(done){
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

    // app

    var app = koa();

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
})