
/**
 * This example illustrates how you may
 * implement a cascading effect using
 * several mounted applications that
 * are not aware of where they are mounted:
 *
 * GET /foo
 * GET /foo/bar
 * GET /foo/bar/baz
 */

var mount = require('..');
var Koa = require('koa');

var app = new Koa();
var a = new Koa();
var b = new Koa();
var c = new Koa();

a.use(async function (ctx, next){
  await next();
  if (!ctx.body) ctx.body = 'foo';
});

b.use(async function (ctx, next){
  await next();
  if (!ctx.body) ctx.body = 'bar';
});

c.use(async function (ctx, next){
  await next();
  ctx.body = 'baz';
});

app.use(mount('/foo', a));
a.use(mount('/bar', b));
b.use(mount('/baz', c));

app.listen(3000);
console.log('listening on port 3000');
