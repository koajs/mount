
/**
 * This example illustrates how application
 * "error" events propagate upstream for
 * centralized logging etc.
 */

var mount = require('..');
var koa = require('koa');

var a = koa();
var b = koa();
var c = koa();

a.use(function(next){
  return function *(){
    yield next;
  }
});

b.use(function(next){
  return function *(){
    yield next;
  }
});

c.use(function(next){
  return function *(){
    yield next;
    this.socket.emit('error', new Error('tobi has escaped'));
  }
});

a.use(mount(b));
b.use(mount(c));

// prevent stderr if you want
a.outputErrors = false;

// errors will propagate to the upstream app,
// however you can still use the "error" listener
// in subapps more specific behaviour, just keep
// in mind that it should be used in an unobtrusive way,
// since most decisions should be made by the parent app.

a.on('error', function(err){
  console.log('sending error "%s" to alert service', err.message);
  // do stuff
});

a.listen(3000);
console.log('listening on port 3000');
