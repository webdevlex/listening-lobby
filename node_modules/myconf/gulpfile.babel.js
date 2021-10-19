import gulp from 'gulp'
import babel from 'gulp-babel'

gulp.task('babel', () => {
  gulp.src('./src/*.js')
    .pipe(babel({stage: 0}))
    .pipe(gulp.dest('./lib'))
})

gulp.task('watch', () => {
  gulp.watch('./src/*.js', ['babel'])
})

gulp.task('build', ['babel'])

gulp.task('default', ['build', 'watch'])
