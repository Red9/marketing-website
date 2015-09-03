/*jslint node: true */
'use strict';

var mozjpeg = require('imagemin-mozjpeg');
var pngquant = require('imagemin-pngquant');
var rewriteModule = require('http-rewrite-middleware');

var pkg = require('./package.json');

module.exports = function (grunt) {

    // load all grunt tasks
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('assemble');

    // Project configuration.
    grunt.initConfig({
        pkg: pkg,

        config: {
            images: require('./src/images/config.json')
        },


        // ---------------------------------------------------------------------
        // Serve
        // ---------------------------------------------------------------------
        watch: {
            service: {
                options: {
                    livereload: true,
                    livereloadOnError: false,
                    spawn: false // Faster, but more prone to watch failure
                },
                files: ['src/**/*.*'],
                tasks: ['<%= grunt.task.current.args[1] %>']
            }
        },
        connect: {
            options: {
                debug: false,
                livereload: true,
                // If it doesn't have a file extension then let's try serving
                // a .html file. Allows for vanity URLs.
                middleware: function (connect, options) {
                    var middlewares = [];

                    middlewares.push(rewriteModule.getMiddleware([
                        {
                            // This line is a bit fragile when you consider that we
                            // want to serve stuff from bower_components, and we
                            // don't have a
                            from: '(^((?!css|html|js|images|img|fonts|\/$).)*$)',
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
            },
            newer: {
                src: 'node_modules/grunt-newer/.cache/'
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
                        },
                        swipebox: {
                            main: [
                                'src/css/swipebox.min.css', // For some reason this doesn't work with the non-minified css
                                'src/js/jquery.swipebox.js'
                            ]
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
                partials: ['src/components/partials/**/*.hbs'],
                helpers: ['src/components/helpers/**/*.js']
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
        postcss: {
            options: {
                map: true, // Update the existing source map
                diff: false,
                processors: [
                    require('autoprefixer-core')({
                        browsers: 'last 3 versions, > 0.5%'
                    })
                ]
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'build/',
                    src: ['**/*.css', '!bower_components/**/*.css'],
                    dest: 'build/'
                }]
            }
        },
        copy: {
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/content/',
                    src: ['**/*.js'],
                    dest: 'build/'
                }, {
                    expand: true,
                    cwd: 'src/images/',
                    src: '<%= config.images.nonresponsive %>',
                    dest: 'build/images/'
                }]
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
                }, {
                    expand: true,
                    cwd: 'build/',
                    src: ['**/fonts/**/*.{woff,woff2,ttf,otf,eot,svg}'],
                    dest: 'dist/fonts/',
                    flatten: true
                }, {
                    // This is a terrible hack! Also affects the usemin pattern below.
                    // Should be something smarter... -SRLM
                    expand: true,
                    cwd: 'build/',
                    src: ['bower_components/swipebox/src/img/*.{png,svg,gif}'],
                    dest: 'dist/img/',
                    flatten: true
                }]
            }
        },
        responsive_images: {
            background: {
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
            },
            content: {
                options: {
                    engine: 'im',
                    sizes: [
                        {
                            name: 'xs',
                            width: 100
                        },
                        {
                            name: 'sm',
                            width: 300
                        },
                        {
                            name: 'md',
                            width: 600
                        },
                        {
                            name: 'lg',
                            width: 900
                        },
                        {
                            name: 'xl',
                            width: 1200
                        }
                    ]
                },
                files: [{
                    expand: true,
                    cwd: 'src/images/',
                    src: ['**/*.{png,jpg}',
                        '!backgrounds/**/*.*',
                        '<%= _.map(config.images.nonresponsive, function(path){return "!" + path}) %>'
                    ],
                    dest: 'build/images/'
                }]
            }
        },
        imagemin: {
            build: {
                options: {
                    optimizationLevel: 4, // png trials
                    use: [
                        mozjpeg({
                            quality: 80,
                            progressive: true
                        }),
                        pngquant({
                            quality: '75-80',
                            speed: 1
                        })
                    ]
                },
                files: [{
                    expand: true,
                    cwd: 'build/images/',
                    src: ['**/*.{png,jpg,gif}', '!favicons/**'],
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
                        // Primarily for background-image, but really for any image or fonts referenced in our CSS.
                        [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the CSS to reference our revved images'],

                        // A swipebox thing...: terrible hack, see above
                        //[/(img\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the CSS to reference our revved images'],

                        [/(fonts\/.*?\.(?:woff2|woff|ttf|otf|eot|svg))/gm, 'Update the CSS to reference our revved fonts']
                    ],
                    html: [
                        [/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the HTML to reference our revved images'],
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
                    drop_console: false
                }
            }
        },
        uncss: {
            prepare: {
                options: {
                    csspath: '../',
                    stylesheets: ['.tmp/concat/css/site.css'],
                    // ignore list taken from: ???
                    ignore: [
                        ///(#|\.)fancybox(\-[a-zA-Z]+)?/,
                        // Bootstrap selectors added via JS
                        /\w\.in/,
                        ".fade",
                        ".collapse",
                        ".collapsing",
                        /(#|\.)navbar(\-[a-zA-Z]+)?/,
                        /(#|\.)dropdown(\-[a-zA-Z]+)?/,
                        /(#|\.)(open)/,
                        // currently only in a IE conditional, so uncss doesn't see it (? SRLM)
                        ".close",
                        ".alert-dismissible",
                        ".animated",
                        '.swipebox-video',
                        /(#|\.)swipebox(\-[a-zA-Z]+)?/
                    ]
                },
                files: {
                    // Yes, this is a special case. Remove CSS rules from the
                    // sitewide css file if that rule is not used in any HTML
                    // file.
                    '.tmp/concat/css/site.css': 'dist/**/*.html'

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
                src: ['dist/**/*.*', '!dist/**/*.html', '!dist/**/favicons/**/*',

                    '!dist/img/**/*.*' // A terrible hack for swipebox!
                ]
            }
        },
        // ---------------------------------------------------------------------
        // Deploy
        // ---------------------------------------------------------------------
        compress: {
            deploy: {
                options: {
                    mode: 'gzip'
                },
                files: [{
                    expand: true,
                    cwd: 'dist/',
                    src: ['**/*', '!images/**/*'],
                    dest: 'dist/',
                    ext: function (ext) {
                        return ext + '.gz';
                    }
                }]
            }
        },
        aws: {
            preview: grunt.file.readJSON('private/preview.json'),
            production: grunt.file.readJSON('private/production.json')
        },
        aws_s3: {
            options: {
                //debug: true,
                accessKeyId: '<%= aws.preview.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.preview.AWSSecretKey %>', // You can also use env variables
                region: '<%= aws.preview.region %>',
                uploadConcurrency: 10, // 10 simultaneous uploads
                downloadConcurrency: 10, // 10 simultaneous downloads
                differential: true, // Only uploads the files that have changed
                displayChangesOnly: true,
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
                    src: ['**/*.gz', 'images/**/*', 'fonts/**/*', '!**/*.html.gz'],
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
            preview: {
                options: {
                    key: '<%= aws.preview.AWSAccessKeyId %>', // Use the variables
                    secret: '<%= aws.preview.AWSSecretKey %>', // You can also use env variables
                    distribution: '<%= aws.preview.cloudfrontDistribution %>'
                    //distribution: 'TESTING'
                },
                expand: true,
                cwd: 'dist/',
                src: '**/*.html',
                dest: '',
                filter: 'isFile',
                rename: function (err, src) {
                    return src.slice(0, -5); // Remove the known .html extension.
                }
            },
            production: {
                options: {
                    key: '<%= aws.production.AWSAccessKeyId %>', // Use the variables
                    secret: '<%= aws.production.AWSSecretKey %>', // You can also use env variables
                    distribution: '<%= aws.production.cloudfrontDistribution %>'
                    //distribution: 'TESTING'
                },
                expand: true,
                cwd: 'dist/',
                src: '**/*.html',
                dest: '',
                filter: 'isFile',
                rename: function (err, src) {
                    return src.slice(0, -5); // Remove the known .html extension.
                }
            }
        },
        shell: {
            launch: {
                options: {
                    env: {
                        // I'm pretty sure that these keys don't actually help.
                        // I think that it's pulling from my already installed
                        // credentials, and not using these. But I'll leave this
                        // in, because at some point this is what we'll have to do.
                        AWS_ACCESS_KEY_ID: '<%= aws.production.AWSAccessKeyId %>',
                        AWS_SECRET_ACCESS_KEY: '<%= aws.production.AWSSecretKey %>'
                    }
                },
                command: 'aws s3 sync s3://preview.redninesensor.com/ s3://redninesensor.com/ --acl public-read --exclude robots.txt'
                // --dryrun
            }
        }
    });

    grunt.registerTask('serve', ['build', 'connect:development', 'watch:service:build']);
    grunt.registerTask('serve-dist', ['prepare', 'connect:dist', 'watch:service:prepare']);

    grunt.registerTask('build', [
        'sass',
        'postcss:build',
        'copy:build',
        'assemble',
        'wiredep:build',
        'newer:responsive_images:background',
        'newer:responsive_images:content',
        'newer:imagemin:build'
    ]);

    grunt.registerTask('prepare', [
        'clean:prepare',
        'build',
        'copy:prepare',
        'useminPrepare',
        'concat:generated',
        'uncss:prepare',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('deploy-preview', [
        //'clean:newer',
        'prepare',
        'compress:deploy',
        'aws_s3:previewUploadStatic',
        'aws_s3:previewUploadPages',
        'invalidate_cloudfront:preview'
    ]);

    grunt.registerTask('deploy-production', [
        'shell:launch',
        'invalidate_cloudfront:production'
    ]);
};
