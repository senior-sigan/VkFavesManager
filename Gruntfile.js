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
    shell: {
      start: {
        command: 'nodewebkit <%= config.app %>'
      }
    },
    nodewebkit: {
      options: {
          platforms: config.platforms,
          buildDir: config.build
      },
      src: ['<%= config.app %>/**/*']
    },
    babel: {
      options: {
        sourceMap: true,
        modules: 'common'
      },
      build: {
        files: [{
          expand: true,
          dest: '<%= config.tmp %>',
          cwd: '<%= config.app %>',
          ext: '.js',
          src: ['**/*.es6']
        }]
      }
    },
    clean: {
      dist: ['<%= config.dist %>', '<%= config.tmp %>']
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: '<%= config.app %>/js/*.js'
    }
  });
};
