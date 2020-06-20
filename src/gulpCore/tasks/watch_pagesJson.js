const gulp = require('gulp')
const $ = require('gulp-load-plugins')()
const {cwd, target, env, targetPath} = require('../preset')
const {writeLastLine} = require('../utils')
const mergeToTargetJson = require('../mergeToTargetJson')
const {runPlugins} = require('../plugins')
gulp.task('watch:pagesJson', function () {
    return gulp.src('src/pages.json', {allowEmpty: true, cwd})
        .pipe($.if(env === 'dev', $.watch('src/pages.json', {cwd}, function (event) {
            // console.log('处理'+event.path)
            writeLastLine('处理' + event.relative + '......')
        })))
        .pipe(mergeToTargetJson('pagesJson'))
        .pipe($.rename('app.json'))
        .pipe($.replace(/[\s\S]*/, runPlugins(targetPath), {
            skipBinary: false
        }))
        .pipe(gulp.dest(target, {cwd}))
})
