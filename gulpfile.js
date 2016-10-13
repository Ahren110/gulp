/*
 *全局环境 npm install --global gulp browser-sync
 *需要安装gulp插件
 *npm install --save-dev gulp gulp-htmlmin gulp-ruby-sass gulp-autoprefixer gulp-minify-css jshint gulp-jshint gulp-uglify gulp-imagemin gulp-rename gulp-clean gulp-concat gulp-notify gulp-cache gulp-cheerio gulp-babel babel-preset-es2015 browser-sync
 *anthor:dullBear
 *site:dullBear.com
 *time 2016-10-13
 */
// 载入依赖
var gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'), //html压缩
    sass = require('gulp-ruby-sass'), //编译sass
    autoprefixer = require('gulp-autoprefixer'), //添加css浏览器前缀
    minifycss = require('gulp-minify-css'), //缩小化(minify)CSS
    jshint = require('gulp-jshint'), //JS语法检测
    uglify = require('gulp-uglify'), //js压缩
    imagemin = require('gulp-imagemin'), //图片压缩
    rename = require('gulp-rename'), //文件重命名
    clean = require('gulp-clean'), //清理文档
    concat = require('gulp-concat'), //文件合并
    notify = require('gulp-notify'), //更动通知 
    cache = require('gulp-cache'), //图片快取，只有更改过得图片会进行压缩
    cheerio = require('gulp-cheerio'), //替换link script链接
    babel = require('gulp-babel'), //编译es6 7为es5
    browserSync = require('browser-sync').create();

var OPENPATH = 'www/dev/',
    OUTPATH = 'www/dist/';

//退换link script链接
gulp.task('replace', function() {
    return gulp
        .src([OPENPATH + '/**' + '*.html', OPENPATH + '/**' + '*.shtml', OPENPATH + '/**' + '*.htm'])
        .pipe(cheerio(function($, file) {
            // Each file will be run through cheerio and each corresponding `$` will be passed here.
            // `file` is the gulp file object
            // Make all h1 tags uppercase

            //退换link href链接为.min.css 添加随机数
            $('link').each(function() {
                var link = $(this),
                    href = link.attr('href'),
                    reg = /.min.css$/;

                if (!reg.test(href)) {
                    href = href.replace(/.css$/, '.min.css') + '?' + Math.random();
                } else {
                    href = href + '?' + Math.random();
                }
                console.log(href);
                link.attr('href', href);
            });

            //退换script src 链接为.min.js 添加随机数
            $('script').each(function() {
                var script = $(this),
                    src = script.attr('src'),
                    reg = /.min.js$/;

                if (!reg.test(src)) {
                    src = src.replace(/^delete/, 'script').replace(/.js$/, '.min.js') + '?' + Math.random();
                } else {
                    src = src.replace(/^delete/, 'script') + '?' + Math.random();
                }
                script.attr('src', src);
            });

        }))
        .pipe(gulp.dest(OUTPATH))
});

// 压缩html
gulp.task('html', ['replace'], function() {
    return gulp.src([OUTPATH + '/**' + '*.html', OUTPATH + '/**' + '*.shtml', OUTPATH + '/**' + '*.htm'])
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(OUTPATH))
        .pipe(notify({
            message: 'html压缩 task ok'
        }));

});

// sass
gulp.task('sass', function() {
    return sass(OPENPATH + 'sass/**/*.scss')
        .on('error', function(err) {
            console.error('Error!', err.message);
        })
        .pipe(gulp.dest(OPENPATH + '/styles'))
        .pipe(notify({
            message: 'sass task complete'
        }));
});

// 样式
gulp.task('styles', function() {
    return gulp.src(OPENPATH + '/styles/**/*.css')
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        // .pipe(gulp.dest('www/dist/styles'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest(OUTPATH + '/styles'))
        .pipe(notify({
            message: '样式 task complete'
        }));
});

// 脚本
gulp.task('jsLib', function() {
    return gulp.src(OPENPATH + '/lib/**/*.min.js')
        .pipe(gulp.dest(OUTPATH + '/lib'))
        .pipe(notify({
            message: '公共库 task complete'
        }));
});

gulp.task('scripts', function() {
    return gulp.src(OPENPATH + '/script/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest(OPENPATH + '/delete'))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        //.pipe(concat('main.js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(OUTPATH + '/script'))
        .pipe(notify({
            message: '脚本 task complete'
        }));
});

// 图片
gulp.task('images', function() {
    return gulp.src(OPENPATH + '/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest(OUTPATH + '/images'))
        .pipe(notify({
            message: '图片 task complete'
        }));
});

// 清理
gulp.task('clean', function() {
    return gulp.src(OUTPATH, {
            read: false
        })
        .pipe(clean());
});

// 预设任务
gulp.task('default', ['clean'], function() {
    gulp.start('html', 'sass', 'styles', 'scripts', 'jsLib', 'images');
});

// 监听生产环境
gulp.task('dev', function() {

    // 建立浏览器自动刷新服务器
    browserSync.init({
        server: {
            baseDir: OPENPATH
        }
    });

    // 监听所有.scss档
    gulp.watch([OPENPATH + '/**' + '*.html', OPENPATH + '/**' + '*.shtml', OPENPATH + '/**' + '*.htm'], ['html']);

    // 监听所有.scss档
    gulp.watch(OPENPATH + '/sass/**/*.scss', ['sass']);

    // 监听所有css档
    gulp.watch(OPENPATH + '/styles/**/*.css', ['styles']);

    // 监听所有.js档
    gulp.watch(OPENPATH + '/script/**/*.js', ['scripts']);

    // 监听所有图片档
    gulp.watch(OPENPATH + '/images/**/*', ['images']);

    // 自动刷新
    gulp.watch(OPENPATH + '/**', function() {
        browserSync.reload();
    });

});

// 监听准生产环境
gulp.task('dist', function() {

    // 建立浏览器自动刷新服务器
    browserSync.init({
        server: {
            baseDir: OUTPATH
        }
    });

    // 监听所有.scss档
    gulp.watch([OPENPATH + '/**' + '*.html', OPENPATH + '/**' + '*.shtml', OPENPATH + '/**' + '*.htm'], ['html']);

    // 监听所有.scss档
    gulp.watch(OPENPATH + '/sass/**/*.scss', ['sass']);

    // 监听所有css档
    gulp.watch(OPENPATH + '/styles/**/*.css', ['styles']);

    // 监听所有.js档
    gulp.watch(OPENPATH + '/script/**/*.js', ['scripts']);

    // 监听所有图片档
    gulp.watch(OPENPATH + '/images/**/*', ['images']);

    // 自动刷新
    gulp.watch(OUTPATH + '/**', function() {
        browserSync.reload();
    });

});