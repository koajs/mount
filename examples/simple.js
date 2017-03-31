
/**
 * This example illustrates the typical
 * pattern of mounting an application
 * to a given pathname prefix.
 *
 * GET /hello
 * GET /world
 */

const mount = require('..')
const Koa = require('koa')

// hello

const a = new Koa()

a.use(async function (ctx, next) {
  await next()
  ctx.body = 'Hello'
})

// world

const b = new Koa()

b.use(async function (ctx, next) {
  await next()
  ctx.body = 'World'
})

// app

const app = new Koa()

app.use(mount('/hello', a))
app.use(mount('/world', b))

app.listen(3000)
console.log('listening on port 3000')
