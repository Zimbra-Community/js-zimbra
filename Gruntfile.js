'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig(
        {
            env: {
                coverage: {
                    APP_DIR_FOR_CODE_COVERAGE: '../coverage/lib/'
                }
            },
            eslint: {
                gruntfile: ['Gruntfile.js'],
                lib: ['lib/**/*.js'],
                test: ['test/**/*_test.js'],
                options: {
                    configFile: '.eslintrc'
                }
            },
            watch: {
                gruntfile: {
                    files: '<%= jshint.gruntfile.src %>',
                    tasks: ['jshint:gruntfile']
                },
                lib: {
                    files: '<%= jshint.lib.src %>',
                    tasks: ['jshint:lib', 'nodeunit']
                },
                test: {
                    files: '<%= jshint.test.src %>',
                    tasks: ['jshint:test', 'nodeunit']
                },
            },
            instrument: {
                files: 'lib/**/*.js',
                options: {
                    lazy: true,
                    basePath: 'coverage'
                }
            },
            simplemocha: {
                options: {
                    ui: 'bdd'
                },
                all: {
                    src: ['test/**/*_test.js']
                }
            },
            storeCoverage: {
                options: {
                    dir: 'out/coverage'
                }
            },
            makeReport: {
                src: 'out/coverage/**/*.json',
                options: {
                    type: 'lcov',
                    dir: 'out/coverage',
                    print: 'detail'
                }
            },
            'jsdoc-ng': {
                dist: {
                    src: ['lib/**/*.js'],
                    dest: 'doc',
                    options: {
                        opts: {
                            recurse: true,
                            readme: 'README.md',
                            template: 'node_modules/ljve-jsdoc-template'
                        },
                        plugins: ['plugins/markdown']
                    }
                }
            }
        }
    );

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('gruntify-eslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-jsdoc-ng');


    // Default task.
    grunt.registerTask('default', ['eslint', 'simplemocha:all']);

    // Test and generate coverage report
    grunt.registerTask(
        'coverage',
        [
            'eslint',
            'env:coverage',
            'instrument',
            'simplemocha:all',
            'storeCoverage',
            'makeReport'
        ]
    );

    // Create docs
    grunt.registerTask(
        'doc',
        [
            'jsdoc-ng'
        ]
    );

};
