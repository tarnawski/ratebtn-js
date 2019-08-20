const { src, dest, parallel } = require('gulp');
const minify = require('gulp-minify');
const clean = require('gulp-clean-css');

function js() {
  return src('scripts/*.js')
      .pipe(minify())
      .pipe(dest('dist'))
}

function css() {
  return src('styles/*.css')
      .pipe(clean())
      .pipe(dest('dist'))
}

exports.js = js;
exports.css = css;
exports.default = parallel(js, css);