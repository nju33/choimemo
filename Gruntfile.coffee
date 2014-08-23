module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)
  grunt.initConfig
    src:
      sass: 'src/sass'
      coffee: 'src/coffee'
    dev:
      root: 'dev'
      css: 'dev/css'
      js: 'dev/js'
    dist:
     root: 'dist'
     css: 'dist/css'
     js: 'dist/js'
    config: 'config'

    copy:
      dist:
        expand: true
        cwd: '<%= dev.root %>'
        src: '**/*'
        dest: '<%= dist.root %>'

    compress:
      options: archive: 'choimemo.zip'
      dist:
        files: [
          {
            expand: true
            cwd: '<%= dist.root %>'
            src: '**/*'
          }
        ]

    imagemin:
      watch:
        expand: true
        src: '<%= dist.root %>/**/*.{png,jpg,jpeg,gif}'


    htmlmin:
      options:
        removeComments: true
        collapseWhitespace: true
        collapseBooleanAttributes: true
        minifyJS: true
        minifyCSS: true
      build: { expand: true, src: '<%= dist.root %>**/*.html' }


    sass:
      options:
        style: 'expanded'
        loadPath: '/.web/sass'
      watch:
        expand: true
        src: '<%= src.sass %>/**/*.{sass,scss}'
        dest: '<%= dev.css %>'
        ext: '.css'
        flatten: true

    cmq:
      options: log: true
      build:
        src: '<%= dist.css %>/*.css'
        dest: '<%= dist.css %>'

    csscomb:
      build:
        expand: true
        src: '<%= cmq.build.src %>'

    csso:
      build:
        expand: true
        src: '<%= cmq.build.src %>'


    coffee:
      no:
        expand: true
        src: ['<%= src.coffee %>/*.coffee', '!<%= src.coffee %>/*.ng.coffee']
        dest: '<%= dev.js %>'
        ext: '.js'
        flatten: true
      ng:
        expand: true
        src: '<%= src.coffee %>/*.ng.coffee'
        dest: '<%= dev.js %>'
        ext: '.ng.js'
        flatten: true

    browserify:
      options:
        transform: ['coffeeify', 'debowerify']
        browserifyOptions:
          extensions: ['.coffee']
          debug: true

      dev:
        files: [
          '<%= dev.js %>/background.js': '<%= src.coffee %>/background.coffee'
          '<%= dev.js %>/newtab.js': '<%= src.coffee %>/newtab.coffee'
          '<%= dev.js %>/option.js': '<%= src.coffee %>/option.coffee'
          '<%= dev.js %>/contentscript.js': '<%= src.coffee %>/contentscript.coffee'
        ]


    ngmin: build: { expand: true, src: '<%= dist.js %>/*.ng.js' }

    uglify:
      no:
        expand: true
        cwd: '<%= dist.js %>'
        src: ['**/*.js', '!**/*.ng.js']
        dest: '<%= dist.js %>'
      ng:
        options: mangle: false
        build: {expand: true, src: '<%= ngmin.build.src %>'}


    watch:
      sass: {files: '<%= sass.watch.src %>', tasks: 'sass'}
      # coffee: {files: '<%= coffee.no.src %>', tasks: 'coffee:no'}
      coffee: {files: '<%= src.coffee %>/**/*.coffee', tasks: 'browserify'}
      ng: {files: '<%= coffee.ng.src %>', tasks: 'coffee:ng'}


  grunt.registerTask 'default', ['watch']
  grunt.registerTask 'dist', ['copy', 'htmlmin', 'cmq', 'csscomb', 'csso', 'ngmin', 'uglify', 'imagemin', 'compress']
  grunt.registerTask 'all', ['sass', 'browserify' ,'copy', 'htmlmin', 'cmq', 'csscomb', 'csso', 'ngmin', 'uglify', 'imagemin', 'compress']
