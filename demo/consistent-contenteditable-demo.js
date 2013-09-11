'use strict';

angular
    .module('consistent-contenteditable-demo', [
        'chrisguttandin.consistent-contenteditable'
    ])
    .controller('ConContentDemoCtrl', ['$scope', function($scope) {

        $scope.html = '';

        $scope.text = '';

    }])
    .filter('breakAtDiv', function() {
        return function(input) {
            return input.replace(/<\/div><div>/g, '</div>\n<div>');
        };
    })
    .filter('showLineBreaks', function() {
        return function(input) {
            return input.replace(/\n/g, '\\n\n');
        };
    });
