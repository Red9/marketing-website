/*jslint node: true */
'use strict';

var pkg = require('./package.json');

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble');

    var rewriteModule = require('http-rewrite-middleware');

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,
        // ---------------------------------------------------------------------
        // Serve
        // ---------------------------------------------------------------------
        watch: {
            main: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false // Faster, but more prone to watch failure
                },
                files: ['src/**/*.*'],
                tasks: [] //all the tasks are run dynamically during the watch event handler
            }
        },
        connect: {
            options: {
                debug: true,
                livereload: true,
                // If it doesn't have a file extension then let's try serving
                // a .html file. Allows for vanity URLs.
                middleware: function (connect, options) {
                    var middlewares = [];

                    middlewares.push(rewriteModule.getMiddleware([
                        {
                            from: '(^((?!css|html|js|images|\/$).)*$)',
                            to: "$1.html"
                        }
                    ]));

                    if (!Array.isArray(options.base)) {
                        options.base = [options.base];
                    }

                    var directory = options.directory || options.base[options.base.length - 1];
                    options.base.forEach(function (base) {
                        // Serve static files.
                        middlewares.push(connect.static(base));
                    });

                    // Make directory browse-able.
                    middlewares.push(connect.directory(directory));

                    return middlewares;
                }
            },
            development: {
                options: {
                    port: 8000,
                    base: 'build'
                }
            },
            dist: {
                options: {
                    port: 8000,
                    base: 'dist'
                }
            }
        },
        // ---------------------------------------------------------------------
        // Setup
        // ---------------------------------------------------------------------
        clean: {
            prepare: {
                files: [{
                    expand: true,
                    cwd: './',
                    //src: ['dist/', '.tmp/', 'build/**/*.*', '!build/bower_components/**/*']
                    src: ['dist/', '.tmp/']
                }]
            }
        },
        wiredep: {
            build: {
                src: [
                    'build/**/*.html'
                ],
                options: {
                    overrides: {
                        bootstrap: { // We don't want the bootstrap JS, so we set main to just CSS
                            main: 'dist/css/bootstrap.css'
                        }
                    }
                }
            }
        },
        // ---------------------------------------------------------------------
        // Build
        // ---------------------------------------------------------------------
        assemble: {
            options: {
                //flatten: true,
                //ext: '',
                layout: 'default.hbs',
                layoutdir: 'src/components/layouts/',
                partials: ['src/components/partials/**/*.hbs']
            },
            pages: {
                files: [{
                    expand: true,
                    cwd: 'src/content',
                    src: ['**/*.hbs'],
                    dest: 'build/'
                }]
            }
        },
        sass: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/components/',
                    src: ['**/*.scss'],
                    dest: 'build/components/',
                    ext: '.css'
                }, {
                    expand: true,
                    cwd: 'src/content/',
                    src: ['**/*.scss'],
                    dest: 'build/',
                    ext: '.css'
                }]
            }
        },
        uncss: {
            build: {
                files: {}
            }
        },
        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/content/',
                    src: ['**/*.js'],
                    dest: 'build/'
                }
                    , {
                        expand: true,
                        cwd: 'src/images/',
                        src: ['**/*.*', '!backgrounds/**/*'],
                        dest: 'build/images/'
                    }
                ]
            },
            prepare: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: [
                        '**/*.html',
                        'images/**/*',
                        '!bower_components/**/*.*'
                    ],
                    dest: 'dist/'
                }]
            }
        },
        responsive_images: {
            build: {
                options: {
                    engine: 'im',
                    sizes: [
                        {
                            name: 'xs',
                            width: 767
                        },
                        {
                            name: 'sm',
                            width: 991
                        },
                        {
                            name: 'md',
                            width: 1200
                        },
                        {
                            name: 'lg',
                            width: 1700
                        },
                        {
                            name: 'xl',
                            width: 2400
                        }
                    ]
                },
                files: [{
                    expand: true,
                    cwd: 'src/images/backgrounds/',
                    src: ['**/*.*'],
                    dest: 'build/images/backgrounds/'
                }]
            }
        },
        imagemin: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'build/images/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'build/images/'
                }]
            }
        },
        // ---------------------------------------------------------------------
        // Prepare
        // ---------------------------------------------------------------------
        useminPrepare: {
            html: ['dist/**/*.html'],
            options: {
                dest: 'dist/',
                root: 'build/'
            }
        },
        usemin: {
            html: ['dist/**/*.html'],
            css: ['dist/**/*.css'],
            js: ['dist/**/*.js'],
            options: {
                assetsDirs: 'dist',
                patterns: {
                    css: [
                        // Primarily for background-image, but really for any image reference in our CSS.
                        [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the CSS to reference our revved images']
                    ]
                }
            }
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
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            assets: {
                src: ['dist/**/*.*', '!dist/**/*.html', '!dist/**/favicons/**/*']
            }
        },
        // ---------------------------------------------------------------------
        // Deploy
        // ---------------------------------------------------------------------
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'dist/',
                src: ['**/*', '!images/**/*'],
                dest: 'dist/',
                ext: function (ext) {
                    return ext + '.gz';
                }
            }
        },
        aws: grunt.file.readJSON('private/preview.json'), // Read the file
        aws_s3: {
            options: {
                //debug: true,
                accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
                region: '<%= aws.region %>',
                uploadConcurrency: 10, // 10 simultaneous uploads
                downloadConcurrency: 10, // 10 simultaneous downloads
                differential: true, // Only uploads the files that have changed
                gzipRename: 'ext' // when uploading a gz file, keep the original extension
            },
            previewUploadStatic: {
                options: {
                    bucket: 'preview.redninesensor.com',
                    params: {
                        CacheControl: 'no-transform, public, max-age=86400, s-maxage=86400'
                    }
                },
                files: [{
                    action: 'upload',
                    expand: true,
                    cwd: 'dist/',
                    src: ['**/*.gz', 'images/**/*', '!**/*.html.gz'],
                    dest: ''
                }]
            },
            previewUploadPages: {
                options: {
                    bucket: 'preview.redninesensor.com',
                    params: {
                        CacheControl: 'public, max-age=300, s-maxage=900'
                    }
                },
                files: [{
                    action: 'upload',
                    expand: true,
                    cwd: 'dist/',
                    src: '**/*.html.gz',
                    dest: '',
                    rename: function (err, src) {
                        console.log('src: ' + src);
                        return src.slice(0, -8); // Remove the known .html.gz extension.
                    }
                }]
            }
        },
        invalidate_cloudfront: {
            options: {
                key: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secret: '<%= aws.AWSSecretKey %>', // You can also use env variables
                distribution: '<%= aws.cloudfrontDistribution %>'
                //distribution: 'TESTING'
            },
            preview: {
                expand: true,
                cwd: 'dist/',
                src: '**/*.html',
                dest: '',
                filter: 'isFile',
                rename: function (err, src) {
                    return src.slice(0, -5); // Remove the known .html extension.
                }
            }
        }

    });

    grunt.registerTask('serve', ['build', 'connect:development', 'watch']);
    grunt.registerTask('serve-dist', ['prepare', 'connect:dist', 'watch']);

    grunt.registerTask('build', [
        'sass',
        'copy:build',
        'assemble',
        'wiredep:build',
        'responsive_images:build',
        'newer:imagemin:build'
    ]);

    grunt.registerTask('prepare', [
        'clean:prepare',
        'build',
        'copy:prepare',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('deploy-preview', [
        'prepare',
        'compress',
        'aws_s3:previewUploadStatic',
        'aws_s3:previewUploadPages',
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

        // A bit of hack, but I need to figure out how to do different actions based on which version of watch I'm running (build or prepare)
        tasksToRun.push('build');

        grunt.config('watch.main.tasks', tasksToRun);

    });
};
