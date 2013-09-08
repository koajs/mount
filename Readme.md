
# koa-mount

  Mount other Koa applications as middleware. The `path` passed to `mount()` is stripped
  from the URL temporarily until the stack unwinds. This is useful for creating entire 
  apps or middleware that will function correctly regardless of which path segment(s)
  they should operate on.

## Installation

```js
$ npm install koa-mount
```

## Examples

  View the [./examples](blob/master/examples) directory for working examples.

### Mounting Applications

  Entire applications mounted at specific paths. For example you could mount
  a blog application at "/blog", with a router that matches paths such as
  "GET /", "GET /posts", and will behave properly for "GET /blog/posts" etc
  when mounted.

```js
var mount = require('koa-mount');
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

### Mounting Middleware

  Mount middleware at specific paths, allowing them to operate independently
  of the prefix, as they're not aware of it.

```js
var mount = require('koa-mount');
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
```

### Optional Paths

  The path argument is optional, defaulting to "/":

```js
app.use(mount(a));
app.use(mount(b));
```

## License

  MIT