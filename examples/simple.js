
/**
 * This example illustrates the typical
 * pattern of mounting an application
 * to a given pathname prefix.
 *
 * GET /hello
 * GET /world
 */

var mount = require('./');
var Koa = require('koa');

// hello

var a = new Koa();

a.use(async function (ctx, next){
  await next();
  ctx.body = 'Hello';
});

// world

var b = new Koa();

b.use(async function (ctx, next){
  await next();
  ctx.body = 'World';
});

// app

var app = new Koa();

app.use(mount('/hello', a));
app.use(mount('/world', b));

app.listen(3000);
console.log('listening on port 3000');
