
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
 * Mount `app` to `path`.
 *
 * @param {String|Application} path or app
 * @param {Application} [app]
 * @return {Function}
 * @api public
 */

function mount(path, app) {
  if ('string' != typeof path) {
    app = path;
    path = '/';
  }

  return function(upstream){
    var downstream = compose(app.middleware)(upstream);
 
    return function *(){
      var prev = this.path;
 
      // not a match
      if (0 != this.url.indexOf(path)) return yield upstream;
      
      // strip the path prefix
      this.path = replace(this.path, path);
      yield downstream;
 
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