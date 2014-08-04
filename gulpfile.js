/*
 * 
 * gulpfile.js */

var gulp = require('gulp'),
  sys = require('sys'),
  child_process = require('child_process'),
  fs = require('fs');

gulp.task('mocha-clean', [], function (cb) {
  "use strict";

  fs.exists('spec/mocha-phantomjs/tests', function (exists) {
    if (!exists) {
      fs.mkdir('spec/mocha-phantomjs/tests', function (error) {
        return error ? cb(error) :
            (fs.exists('spec/mocha-phantomjs/tests/mocha-bundle.js') &&
                fs.unlink('spec/mocha-phantomjs/tests/mocha-bundle.js',
                function (error) {
                  cb(error);
                }));
      });
    } else {
      if (fs.exists('spec/mocha-phantomjs/tests/mocha-bundle.js')) {
        fs.unlink('spec/mocha-phantomjs/tests/mocha-bundle.js',
          function (error) {
            cb(error);
          });
      } else {
        cb();
      }
    }
  });
});
gulp.task('mocha-bundle', ['mocha-clean'], function (cb) {
  "use strict";

  /* 
   * Can't seem to get browserifying multiple input files working
   * with gulp in a nice way...neither can anybody else apparently:
   *
   * https://github.com/gulpjs/plugins/issues/47
   *
   * This solution is a bit of a sledgehammer, but at least it works.
   */

  var exec = child_process.exec;
  exec('node node_modules/browserify/bin/cmd.js' +
    ' spec/tests/*.js' +
    ' -o spec/mocha-phantomjs/tests/mocha-bundle.js',
    function (error, stdout, stderr) {
      sys.print('stdout: ' + stdout + '\n');
      sys.print('stderr: ' + stderr + '\n');
      cb(error);
    });

});

gulp.task('mocha', ['mocha-bundle'], function (cb) {
  "use strict";

  var spawn = child_process.spawn,
    address = 'localhost',
    port = '8081',
    http,
    mocha_phantomjs;

  http = spawn('node_modules/http-server/bin/http-server',
    [ '-a', address, '-p', port], {
      stdio: "inherit"
    });

  mocha_phantomjs =
    spawn('node_modules/mocha-phantomjs/bin/mocha-phantomjs',
      ['http://' + address + ':' + port + '/spec/mocha-phantomjs'], {
        stdio: "inherit"
      });

  mocha_phantomjs.on('close', function (code) {
    http.kill(code ? 'SIGTERM' : 'SIGHUP');
  });

  http.on('close', function (code) {
    cb(code);
  });

});

