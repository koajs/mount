
/**
 * This example illustrates how middleware
 * may be mounted just like applications.j
 */

var mount = require('..');
var koa = require('koa');

function hello(next){
  return function *(){
    yield next;
    this.body = 'Hello';
  }
}

function world(next){
  return function *(){
    yield next;
    this.body = 'World';
  }
}

var app = koa();

app.use(mount('/hello', hello));
app.use(mount('/world', world));

app.listen(3000);
console.log('listening on port 3000');
