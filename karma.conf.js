'use strict';

module.exports = function(config) {

    config.set({

        browsers: [
            'Chrome',
            'Firefox'
        ],

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'src/consistent-contenteditable.js',
            'test/spec/consistent-contenteditable.js'
        ],

        frameworks: [
            'jasmine'
        ]

    });

};
