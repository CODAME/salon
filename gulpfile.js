var gulp = require('gulp'),
	sass = require('gulp-sass'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	cssnano = require('gulp-cssnano'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	del = require('del'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync').create();

gulp.task('sass', function(){
	return gulp.src('app/scss/**/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({
			stream: true
		}));
});

gulp.task('images', function(){
	return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
	.pipe(cache(imagemin({
		interlaced: true
	})))
	.pipe(gulp.dest('dist/images'));
});

// gulp.task('fonts', function(){
// 	return gulp.src('app/fonts/**/*')
// 	.pipe(gulp.dest('dist/fonts'));
// });

gulp.task('useref', function(){
	return gulp.src('app/*.html')
		.pipe(useref())
	    .pipe(gulpif('*.js', uglify()))
	    .pipe(gulpif('*.css', cssnano()))
		.pipe(gulp.dest('dist'));
});

gulp.task('watch', ['browserSync', 'sass'], function(){
	gulp.watch('app/scss/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.warch('app/js/**/*.js', browserSync.reload);
});

gulp.task('clean:dist', function(){
	return del.sync('dist');
});

gulp.task('cache:clear', function (callback) {
	return cache.clearAll(callback)
});

gulp.task('browserSync', function(){
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
});

gulp.task('build', function (callback) {
	runSequence('clean:dist', ['sass', 'useref', 'images'], callback);
	console.log('Building files');
});

gulp.task('default', function (callback) {
	runSequence(['sass', 'browserSync', 'watch'], callback);
});


