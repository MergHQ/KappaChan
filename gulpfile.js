var jshint = require('gulp-jshint');
var watch = require('gulp-watch');
var gulp = require('gulp');
var map = require('map-stream');

var cb = map(function (file, cb) {
  if(!file.jshint.success) throw 'Error linting: ' + file.jshint.results[0].error.reason + ' at line ' + file.jshint.results[0].error.line + ' in ' + file.jshint.results[0].file; 
  console.log('Lint complete');
});


gulp.task('default', function () {
  return gulp.src('./src/**/*.js')
    .pipe(jshint({
        esversion: 6,
        node: true,
        globals: {App: true}
    }))
    .pipe(jshint.reporter('default'))
    .pipe(cb);
});

gulp.task('watch', function () {
  watch('./src/**/*.js', function () {
    gulp.src('./src/**/*.js')
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
  });
  console.log('Lint complete');
});