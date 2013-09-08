
var mount = require('..');
var koa = require('koa');

// GET /foo
// GET /foo/bar
// GET /foo/bar/baz

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

app.listen(3000);
console.log('listening on port 3000');
