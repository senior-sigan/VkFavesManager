module.exports = function (grunt) {
  'use strict';

  // load all grunt tasks
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  var config = {
    platforms: ['win'],
    app: './app',
    build: './webkitbuilds',
    tmp: './tmp',
    dist: './dist'
  };

  grunt.initConfig({
    config: config,
    nodewebkit: {
      options: {
          platforms: config.platforms,
          buildDir: config.build,
      },
      src: ['<%= config.app %>/**/*']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: '<%= config.app %>/js/*.js'
    },
  });
};
