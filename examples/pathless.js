
/**
 * This example illustrates how applications
 * may be mounted without a pathname prefix
 * if you simply wish to combine behaviours.
 */

var mount = require('..');
var koa = require('koa');

// GET /hello

var a = koa();

a.use(function *(next){
    yield next;
    if ('/hello' == this.path) this.body = 'Hello';
});

// GET /world

var b = koa();

b.use(function *(next){
    yield next;
    if ('/world' == this.path) this.body = 'World';
});

// app

var app = koa();

app.use(mount(a));
app.use(mount(b));

app.listen(3000);
console.log('listening on port 3000');
