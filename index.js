
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

  return function(upstream){
    var downstream = app.middleware
      ? compose(app.middleware)
      : app;
 
    return function *(){
      var prev = this.path;
 
      // not a match
      if (0 != this.url.indexOf(path)) return yield upstream;
      
      // strip the path prefix
      this.path = replace(this.path, path);
      debug('enter %s -> %s', prev, this.path);
      yield downstream.call(this, upstream);
      debug('leave %s -> %s', prev, this.path);
 
      // restore prefix downstream
      this.path = prev;
    }
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