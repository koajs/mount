
# koa-mount

  Mount other Koa applications as middleware. The `path` passed to `mount()` is stripped
  from the URL temporarily until the stack unwinds. This is useful for creating entire 
  apps or middleware that will function correctly regardless of which path segment(s)
  they should operate on.

## Installation

```js
$ npm install koa-mount
```

## Example

```js

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
```

  Try the following requests:

```
$ GET /
Not Found

$ GET /hello
Hello

$ GET /world
World
```

## License

  MIT