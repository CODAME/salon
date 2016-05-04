var fs           = require('fs')                       // file system, used to load the text content
		gulp         = require('gulp'),                    // gulp task runner
		sass         = require('gulp-sass'),               // compiles sass
		autoprefixer = require('gulp-autoprefixer'),       // applies CSS vendor prefixes
		rename       = require('gulp-rename'),             // renames files
		livereload   = require('gulp-livereload'),         // reload browser when files change
		concat       = require('gulp-concat'),             // concatenate scripts
		http         = require('http'),                    // node core module to serve data
		serveStatic  = require('serve-static'),            // serves static files
		finalhandler = require('finalhandler'),            // standardizes server response
		opn          = require('opn'),                     // opens the browser when we gulp
		jshint       = require('gulp-jshint'),             // catches errors in javascript
		stylish      = require('jshint-stylish'),          // makes lint errors look nicer
		plumber      = require('gulp-plumber'),            // keeps pipes working even when error happens
		notify       = require('gulp-notify'),             // system notification when error happens
		cache        = require('gulp-cache'),              // caches image optimizations
		del          = require('del')									  	 // deletes files. used in 'clean' task

var paths = {
	styles:   './src/scss/**/*',
	scripts:  './src/js/**/*',
	dist:     './'
}

/*

███████╗████████╗██╗   ██╗██╗     ███████╗███████╗
██╔════╝╚══██╔══╝╚██╗ ██╔╝██║     ██╔════╝██╔════╝
███████╗   ██║    ╚████╔╝ ██║     █████╗  ███████╗
╚════██║   ██║     ╚██╔╝  ██║     ██╔══╝  ╚════██║
███████║   ██║      ██║   ███████╗███████╗███████║
╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝╚══════╝

*****************************************************/

gulp.task('styles', ['clean'], function(){

	var sassError = function(err){
		notify.onError({
			title:    err.relativePath,
			subtitle: 'Line '+err.line,
			message:  '<%= error.messageOriginal %>'
		})(err)
		this.emit('end')
	}

	gulp.src('./src/scss/imports.scss')
		.pipe(plumber({
				errorHandler: sassError
		}))
		.pipe(sass({outputStyle: 'compressed'}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}))
		.pipe(rename('style.css'))
		.pipe(gulp.dest(paths.dist))
		.pipe(livereload())
})

/*

███████╗ ██████╗██████╗ ██╗██████╗ ████████╗███████╗
██╔════╝██╔════╝██╔══██╗██║██╔══██╗╚══██╔══╝██╔════╝
███████╗██║     ██████╔╝██║██████╔╝   ██║   ███████╗
╚════██║██║     ██╔══██╗██║██╔═══╝    ██║   ╚════██║
███████║╚██████╗██║  ██║██║██║        ██║   ███████║
╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   ╚══════╝

********************************************************/

gulp.task('scripts', ['lint','clean'], function(){
	return gulp.src(paths.scripts)
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.dist))
		.pipe(livereload())
})

gulp.task('lint',function(){
	return gulp.src(paths.scripts)
		.pipe(plumber())
		.pipe(jshint({
			'asi':true // allows missing semicolons
		}))
		.pipe(jshint.reporter('jshint-stylish'))
		.pipe(notify(function (file) {  // Use gulp-notify as jshint reporter
			if (file.jshint.success) {
				return false // Don't show something if success
			}
			var errors = file.jshint.results.map(function (data) {
				if (data.error) {
					return "(" + data.error.line + ':' + data.error.character + ') ' + data.error.reason
				}
			}).join("\n")
			return file.relative + " (" + file.jshint.results.length + " errors)\n" + errors
		}))
})


/*

███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗
██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝

****************************************************/

gulp.task('livereload-listen', function(){
	livereload.listen()
})

gulp.task('serve', function() {

	// Serve up distribution folder
	var serve = serveStatic(paths.dist)

	// Create server
	var server = http.createServer(function(req, res){
		var done = finalhandler(req, res)
		serve(req, res, done)
	})

	server.listen(3000) // Listen
})

// opens browser to the page
gulp.task('open',['serve'], function(){
	opn('http:/localhost:3000')
})

/*

██╗    ██╗ █████╗ ████████╗ ██████╗██╗  ██╗
██║    ██║██╔══██╗╚══██╔══╝██╔════╝██║  ██║
██║ █╗ ██║███████║   ██║   ██║     ███████║
██║███╗██║██╔══██║   ██║   ██║     ██╔══██║
╚███╔███╔╝██║  ██║   ██║   ╚██████╗██║  ██║
 ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝

**********************************************/

gulp.task('watch',['serve'], function(){
	gulp.watch(paths.styles,   ['styles'])
	gulp.watch(paths.scripts,  ['scripts'])
	gulp.watch('./index.html', ['reload'])
})

gulp.task('reload', function(){
	return gulp.src('./index.html')
	.pipe(livereload())
})

/*

██████╗  ██╗   ██╗ ██╗ ██╗      ██████╗
██╔══██╗ ██║   ██║ ██║ ██║      ██╔══██╗
██████╔╝ ██║   ██║ ██║ ██║      ██║  ██║
██╔══██╗ ██║   ██║ ██║ ██║      ██║  ██║
██████╔╝ ╚██████╔╝ ██║ ███████╗ ██████╔╝
╚═════╝   ╚═════╝  ╚═╝ ╚══════╝ ╚═════╝

**************************************/

gulp.task('clean',function(){
	 return del('./dist')
})

gulp.task('default', ['clean','styles','scripts','serve','watch','livereload-listen','open'])
