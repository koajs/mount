
/**
 * Module dependencies.
 */

var compose = require('koa-compose');

/**
 * Expose `mount()`.
 */

module.exports = mount;

/**
 * Mount `app` to `path`.
 *
 * @param {String} path
 * @param {Application} app
 * @return {Function}
 * @api public
 */

function mount(path, app) {
  return function(upstream){
    var downstream = compose(app.middleware)(upstream);
 
    return function *(){
      var prev = this.path;
 
      // not a match
      if (0 != this.url.indexOf(path)) return yield upstream;
      
      // strip the path prefix
      this.path = this.path.replace(path, '') || '/';
      yield downstream;
 
      // restore prefix downstream
      this.path = prev;
    }
  }
}