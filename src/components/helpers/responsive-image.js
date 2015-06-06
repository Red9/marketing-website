'use strict';
var _ = require('lodash');


/**
 * Automatically calculates the sizes, srcset, and src attribute of an img tag.
 *
 * Make sure to use {{{triple no escape}}} braces.
 *
 * @todo: Make the imageSizes and breakpoints part of the passed in configuration.
 *
 *
 * @param file - the image reference. Will be adjust to add -xs, -sm, etc.
 * @param [xs] - Number of extra-small columns
 * @param [sm] - Number of small columns
 * @param [md] - Number of medium columns
 * @param [lg] - Number of large columns
 * @returns {string}
 */
module.exports.responsiveImage = function (file, xs, sm, md, lg) {

    var fileParts = file.split('.');
    var path = fileParts[0];
    var extension = _.rest(fileParts).join('.');

    if (!_.isNumber(xs)) {
        xs = 12;
    }
    if (!_.isNumber(sm)) {
        sm = xs;
    }
    if (!_.isNumber(md)) {
        md = sm;
    }
    if (!_.isNumber(lg)) {
        lg = md;
    }

    var columns = {
        sm: sm,
        md: md,
        lg: lg
    };

    var imageSizes = [
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
    ];

    var breakpoints = [
        {
            name: 'sm',
            'min-width': 768,
            column: 62
        },
        {
            name: 'md',
            'min-width': 992,
            column: 81
        },
        {
            name: 'lg',
            'min-width': 1200,
            column: 97
        }
        // xs is implicit.
    ];

    var sizes = 'sizes="' + _.chain(breakpoints)
            .sortBy(function (value) {
                return -value['min-width'];
            })
            .map(function (size) {
                return '(min-width: ' + size['min-width'] + 'px) ' + (size.column * columns[size.name]) + 'px';
            }).value().join(', ') + ', ' +
        Math.round(100 / 12 * xs) + 'vw"'; // xs size:


    var srcset = 'srcset="' + _.map(imageSizes, function (size) {
            return path + '-' + size.name + '.' + extension + ' ' + size.width + 'w'
        }).join(', ') + '"';

    var src = 'src="' + path + '-md.' + extension + '"';

    return src + ' ' + sizes + ' ' + srcset;
};


