
var mount = require('./');
var koa = require('koa');

// hello

var a = koa();

a.use(function(next){
  return function *(){
    yield next;
    this.body = 'Hello';
  }
});

// world

var b = koa();

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

app.listen(3000);
console.log('listening on port 3000');
