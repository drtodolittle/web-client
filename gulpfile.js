var gulp = require('gulp');
var del = require('del');
var gutil = require("gulp-util");
var jsdoc2md = require("gulp-jsdoc-to-markdown");
var rename = require("gulp-rename");
var concat = require("gulp-concat");
var uglify = require('gulp-uglify');
var ngannotate = require('gulp-ng-annotate');
var stripDebug = require('gulp-strip-debug');
var karma = require('karma').Server;
var iife = require('gulp-iife');
var fs = require("fs");

gulp.task('js', function () {
    gulp.src([
      'src/main/resources/js/tdapp.js',
      'src/main/resources/js/controller/*.js',
      'src/main/resources/js/directive/*.js',
      'src/main/resources/js/service/*.js',
      'src/main/resources/js/tdapp_firebase.js'
    ])
        .pipe(concat('drtodolittle.js'))
        .pipe(ngannotate())
        .pipe(iife())
        .pipe(gulp.dest('src/main/resources/js/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(stripDebug())
        .pipe(uglify())
        .pipe(gulp.dest('src/main/resources/js/'))
});

gulp.task('doc', ['clean'], function() {
    return gulp.src("src/**/*.js")
        //.pipe(concat("README.md"))
        //.pipe(jsdoc2md({ template: fs.readFileSync("./readme.hbs", "utf8") }))
        .pipe(jsdoc2md())
        .on("error", function(err){
            gutil.log("jsdoc2md failed:", err.message);
        })
        .pipe(rename(function(path){
            path.extname = ".md";
        }))
        .pipe(gulp.dest('./dist/doc'));
});

gulp.task('css', function() {
    return gulp.src("src/css/**/*")
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('images', function() {
    return gulp.src("src/images/**/*")
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('templates', function() {
    return gulp.src("src/templates/**/*")
        .pipe(gulp.dest('./dist/templates'));
});

gulp.task('html', function() {
    return gulp.src(["src/index.html", "src/favicon.ico"])
        .pipe(gulp.dest('./dist'));
});

gulp.task('test', function(done) {
    new karma({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('build', function() {
    gulp.start('clean', 'templates', 'html', 'images', 'css', 'js', 'doc');
});

gulp.task('clean', function () {
    return del([
        'dist/',
        'doc/'
    ]);
});

gulp.task('default', function() {
    gulp.start('build');
});

gulp.watch([
  'src/main/resources/js/tdapp.js',
  'src/main/resources/js/controller/*.js',
  'src/main/resources/js/directive/*.js',
  'src/main/resources/js/service/*.js',
  'src/main/resources/js/tdapp_firebase.js'
], ['js']);
