'use strict'

var request = require('supertest')
var mount = require('..')
var Koa = require('koa')
require('should')

describe('when throwing custom error in mounted app', function () {
  it('should keep same class', function (done) {
    var a = new Koa()

    a.use(async function (ctx, next) {
      throw new CustomError(400)
    })

    var app = new Koa()
    app.use(async function (ctx, next) {
      try {
        await next()
        ctx.status = 200
      } catch (e) {
        ctx.body = e instanceof CustomError
        ctx.status = e.status
      }
    })
    app.use(mount(a))

    request(app.listen())
      .get('/')
      .expect(400)
      .expect('true')
      .end(done)
  })
})

class CustomError extends Error {
  constructor (status, message) {
    super(message)
    this.status = status
    Error.captureStackTrace(this, CustomError)
  }
}
