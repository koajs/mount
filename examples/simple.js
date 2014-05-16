
/**
 * This example illustrates the typical
 * pattern of mounting an application
 * to a given pathname prefix.
 *
 * GET /hello
 * GET /world
 */

var mount = require('./');
var koa = require('koa');

// hello

var a = koa();

a.use(function *(next){
    yield next;
    this.body = 'Hello';
  }
);

// world

var b = koa();

b.use(function *(next){
    yield next;
    this.body = 'World';
  }
);

// app

var app = koa();

app.use(mount('/hello', a));
app.use(mount('/world', b));

app.listen(3000);
console.log('listening on port 3000');
