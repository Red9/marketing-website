/*jslint node: true */
'use strict';

var pkg = require('./package.json');

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false // Faster, but more prone to watch failure
                },
                files: ['public/**/*.html', 'public/**/*.scss'],
                tasks: [] //all the tasks are run dynamically during the watch event handler
            }
        },
        connect: {
            development: {
                options: {
                    port: 8000,
                    base: 'public'
                }
            },
            dist: {
                options: {
                    port: 8000,
                    base: 'dist'
                }
            }
        },
        sass: {
            basic: {
                files: [{
                    expand: true,
                    cwd: 'public/scss/',
                    src: ['**/*.scss'],
                    dest: 'public/css/',
                    ext: '.css'
                }]
            }
        },
        clean: {
            before: {
                src: ['dist/', '.tmp/']
            },
            nonCompressed: {
                options: {
                    //    'no-write': true
                },
                src: ['dist/**/*.*', '!dist/**/*.gz', '!dist/img/**/*']
            }
        },
        copy: {
            index: {
                expand: true,
                cwd: 'public/',
                src: [
                    '**/*.html',
                    '**/*.css',
                    '**/*.js',
                    'img/**/*',
                    'fonts/**/*'
                ],
                dest: 'dist/'
            }
        },
        dom_munger: {
            update: {
                options: {  // Remove development scripts
                    remove: ['script[data-remove="true"]']
                },
                src: 'dist/**/*.html'
            }
        },
        useminPrepare: {
            html: 'dist/index.html',
            options: {
                dest: 'dist/',
                root: 'public/'
            }
        },
        usemin: {
            html: 'dist/index.html'
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: true
                }
            }
        },
        htmlmin: {
            target: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true
                },
                expand: true,
                cwd: 'dist/',
                src: '**/*.html',
                dest: 'dist/'
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'dist/',
                src: ['**/*', '!img/**/*'],
                dest: 'dist/',
                ext: function (ext) {
                    return ext + '.gz';
                }
            }
        },
        filerev: {
          options: {
              algorithm: 'md5',
              length: 8
          },
            assets: {
                src: ['dist/**/*.*', '!dist/index.html']
            }
        },
        aws: grunt.file.readJSON('private/preview.json'), // Read the file
        aws_s3: {
            options: {
                debug: true,
                accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
                region: '<%= aws.region %>',
                uploadConcurrency: 10, // 10 simultaneous uploads
                downloadConcurrency: 10, // 10 simultaneous downloads
                differential: true, // Only uploads the files that have changed
                gzipRename: 'ext' // when uploading a gz file, keep the original extension
            },

            previewDelete: {
                options: {
                    bucket: 'preview.redninesensor.com'
                },
                files: [{
                    action: 'delete',
                    differential: true,
                    dest: '/',
                    cwd: 'dist/'
                }]
            },
            previewUpload: {
                options: {
                    bucket: 'preview.redninesensor.com',
                },
                files: [{
                    action: 'upload',
                    expand: true,
                    cwd: 'dist/',
                    src: '**/*',
                    dest: ''
                }]
            }
        },
        invalidate_cloudfront: {
            options: {
                key: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secret: '<%= aws.AWSSecretKey %>', // You can also use env variables
                //distribution: '<%= aws.cloudfrontDistribution %>'
                distribution: 'TESTING'
            },
            preview: {
                expand: true,
                cwd: 'dist/',
                src: '<%= aws_s3.previewUpload.dirtyupload %>',
                dest: '',
                filter: 'isFile'
            }
        }

    });

    grunt.registerTask('serve', ['sass', 'connect:development', 'watch']);
    grunt.registerTask('serve-dist', ['build', 'connect:dist', 'watch']);
    grunt.registerTask('build', [
        'sass',
        'clean:before',
        'copy',
        'dom_munger:update',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('deploy-preview', [
        'build',
        'compress',
        'aws_s3:previewDelete',
        'clean:nonCompressed',
        'aws_s3:previewUpload',
        'build', // Rebuild, so that the distribution can create the files list correctly...
        'printParameter',
        'invalidate_cloudfront:preview'
    ]);

    grunt.registerTask('printParameter', 'test', function () {
        console.log('print parameter:');
        console.log(grunt.config.get('aws_s3.previewUpload.uploaddirty'));
        console.log(grunt.config.get('aws_s3.previewUpload.upload.dirty'));
        console.log(grunt.config.get('aws_s3.previewUpload.dirtyupload'));

        //console.log(grunt.config.get('aws_s3.previewUpload'));

    });

    grunt.event.on('watch', function (action, filepath) {
        //https://github.com/gruntjs/grunt-contrib-watch/issues/156

        var tasksToRun = [];

        if (filepath.lastIndexOf('.js') !== -1 && filepath.lastIndexOf('.js') === filepath.length - 3) {

            //lint the changed js file
            grunt.config('jshint.main.src', filepath);

            //find the appropriate unit test for the changed file
            var spec = filepath;
            if (filepath.lastIndexOf('-spec.js') === -1 || filepath.lastIndexOf('-spec.js') !== filepath.length - 8) {
                spec = filepath.substring(0, filepath.length - 3) + '-spec.js';
            }

            //if the spec exists then lets run it
            if (grunt.file.exists(spec)) {
                var files = [].concat(grunt.config('dom_munger.data.appjs'));
                files.push('bower_components/angular-mocks/angular-mocks.js');
                files.push(spec);
                grunt.config('karma.options.files', files);
                tasksToRun.push('karma:during_watch');
            }
        } else if (filepath.lastIndexOf('.scss') !== -1 && filepath.lastIndexOf('.scss') === filepath.length - 5) {
            tasksToRun.push('sass');
        }

        //if index.html changed, we need to reread the <script> tags so our next run of karma
        //will have the correct environment
        // SRLM: take this out for now, since it was stopping execution (no dom_munger)
        //if (filepath === 'index.html') {
        //    tasksToRun.push('dom_munger:read');
        //}

        grunt.config('watch.main.tasks', tasksToRun);

    });
};
