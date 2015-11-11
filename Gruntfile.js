'use strict';

module.exports = function (grunt)
{

    // Project configuration.
    grunt.initConfig(
        {
            env: {
                coverage: {
                    APP_DIR_FOR_CODE_COVERAGE: "../coverage/lib/"
                }
            },
            jshint: {
                options: {
                    jshintrc: '.jshintrc'
                },
                gruntfile: {
                    src: 'Gruntfile.js'
                },
                lib: {
                    src: ['lib/**/*.js']
                },
                test: {
                    src: ['test/**/*_test.js']
                },
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
                    ui: "bdd"
                },
                all: {
                    src: ['test/**/*_test.js']
                },
                coverage: {
                    src: ['test/**/*_test.js'],
                    options: {
                        reporter: "mocha-istanbul"
                    }
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
            }
        }
    );

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-env');

    // Default task.
    grunt.registerTask('default', ['jshint', "simplemocha:all"]);
    grunt.registerTask(
        'coverage',
        [
            'jshint',
            "env:coverage",
            "instrument",
            "simplemocha:coverage",
            "storeCoverage",
            "makeReport"
        ]
    );

};
