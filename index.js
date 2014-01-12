
/**
 * Module dependencies.
 */

var debug = require('debug')('koa-mount');
var compose = require('koa-compose');

/**
 * Expose `mount()`.
 */

module.exports = mount;

/**
 * Mount `app` to `path`, `app`
 * may be a Koa application or
 * middleware function.
 *
 * @param {String|Application|Function} path, app, or function
 * @param {Application|Function} [app or function]
 * @return {Function}
 * @api public
 */

function mount(path, app) {
  if ('string' != typeof path) {
    app = path;
    path = '/';
  }

  var name = app.name || 'unnamed';
  debug('mount %s %s', path, name);

  // compose
  var downstream = app.middleware
    ? compose(app.middleware)
    : app;

  return function *(upstream){
    var prev = this.path;

    // not a match
    if (0 != this.url.indexOf(path)) return yield upstream;

    // strip the path prefix
    var newPath = replace(this.path, path);
    this.path = newPath;
    debug('enter %s -> %s', prev, this.path);

    yield downstream.call(this, function *(){
      this.path = prev;
      yield upstream;
      this.path = newPath;
    }.call(this));

    debug('leave %s -> %s', prev, this.path);
    this.path = prev;
  }
}

/**
 * Replace `prefix` in `path`.
 *
 * @param {String} path
 * @param {String} prefix
 * @return {String}
 * @api private
 */

function replace(path, prefix) {
  path = path.replace(prefix, '') || '/';
  if ('/' != path[0]) path = '/' + path;
  return path;
}