var gulp = require('gulp');
var del = require('del');
var gutil = require("gulp-util");
var jsdoc2md = require("gulp-jsdoc-to-markdown");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var uglify = require('gulp-uglify');
var ngannotate = require('gulp-ng-annotate');
var stripDebug = require('gulp-strip-debug');
var iife = require('gulp-iife');
var fs = require("fs");
var webserver = require('gulp-webserver');
var bower = require('gulp-bower');
var replace = require('gulp-string-replace');
var runSequence = require('run-sequence');

var config = {
     srcPath: './app',
    destPath: './dist',
     bowerDir: './bower_components' ,
    publishPath: '/srv/www/test'
}

gulp.task('dev', function() {
  runSequence('bower', ['templates', 'html', 'images', 'css', 'js', 'bowerjs', 'bowercss', 'bowerfonts'], ['webserver', 'watch']);
})


gulp.task('jenkins-build', function() {
  runSequence('bower', ['templates', 'html', 'images', 'css', 'js', 'bowerjs', 'bowercss', 'bowerfonts'], 'publish');
})

gulp.task('travis-build', function() {
  runSequence('bower', ['templates', 'html', 'images', 'css', 'js', 'bowerjs', 'bowercss', 'bowerfonts']);
})

gulp.task('webserver', function() {
  gulp.src(config.destPath)
    .pipe(webserver({
      livereload: true,
      // fallback: 'index.html'
    }));
});

gulp.task('publish', function() {
  gulp.src(config.destPath + '/**/*')
    .pipe(gulp.dest(config.publishPath))
})

gulp.task('bower', function() { 
    return bower()
         .pipe(gulp.dest(config.bowerDir)) 
});

gulp.task('bowercss', function() {
  gulp.src([
    config.bowerDir + '/bootstrap/dist/css/bootstrap.min.css',
    config.bowerDir + '/bootstrap/dist/css/bootstrap.min.css.map',
    config.bowerDir + '/angular-xeditable/dist/css/xeditable.css'
  ])
  .pipe(replace('border-bottom: dashed 1px #428bca;', ''))
  .pipe(gulp.dest(config.destPath + '/css'))
});

gulp.task('bowerfonts', function() {
  gulp.src([
    config.bowerDir + '/bootstrap/dist/fonts/*',
  ])
  .pipe(gulp.dest(config.destPath + '/fonts'))
});

gulp.task('bowerjs', function() {
  gulp.src([
    config.bowerDir + '/angular/angular.min.js',
    config.bowerDir + '/angular/angular.js',
    config.bowerDir + '/angular/angular.min.js.map',
    config.bowerDir + '/angular-route/angular-route.min.js',
    config.bowerDir + '/angular-route/angular-route.js',
    config.bowerDir + '/angular-route/angular-route.min.js.map',
    config.bowerDir + '/jquery/dist/jquery.min.js',
    config.bowerDir + '/bootstrap/dist/js/bootstrap.min.js',
    config.bowerDir + '/firebase/firebase.js',
    config.bowerDir + '/angularfire/dist/angularfire.min.js',
    config.bowerDir + '/angular-local-storage/dist/angular-local-storage.min.js',
    config.bowerDir + '/angular-local-storage/dist/angular-local-storage.js',
    config.bowerDir + '/angular-local-storage/dist/angular-local-storage.min.js.map',
    config.bowerDir + '/angular-xeditable/dist/js/xeditable.min.js'
  ])
  .pipe(gulp.dest(config.destPath + '/js'))
});

gulp.task('js', function () {
    return gulp.src([
      config.srcPath + '/js/tdapp.js',
      config.srcPath + '/js/controller/*.js',
      config.srcPath + '/js/directive/*.js',
      config.srcPath + '/js/service/*.js',
      config.srcPath + '/js/tdapp_firebase.js'
    ])
        .pipe(concat('drtodolittle.js'))
        .pipe(ngannotate())
        .pipe(iife())
        .pipe(gulp.dest(config.destPath + '/js/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest(config.destPath + '/js/'))
});

gulp.task('css', function() {
    return gulp.src(config.srcPath + '/css/**/*')
        .pipe(gulp.dest(config.destPath + '/css'));
});

gulp.task('images', function() {
    return gulp.src(config.srcPath + '/images/**/*')
        .pipe(gulp.dest(config.destPath + '/images'));
});

gulp.task('templates', function() {
    return gulp.src(config.srcPath + '/templates/**/*')
        .pipe(gulp.dest(config.destPath + '/templates'));
});

gulp.task('html', function() {
    return gulp.src([config.srcPath + '/*.html', config.srcPath + '/favicon.ico'])
        .pipe(gulp.dest(config.destPath));
});

gulp.task('build', function() {
    gulp.start( 'templates', 'html', 'images', 'css', 'js', 'bowerjs', 'bowercss', 'bowerfonts');
});

gulp.task('clean', function () {
    return del(config.destPath);
});

gulp.task('default', function() {
    gulp.start('build');
});

gulp.task('watch', function() {
  gulp.watch(config.srcPath + "/**/*",['build'])
});
