'use strict';

describe('angular-consistent-contenteditable', function () {

    var controllerScope,
        element,
        scope;

    function compile(html) {
        inject(function($rootScope, $compile) {
            element = angular.element('<div data-cg-con-content html="html" text="text">' + html + '</div>');
            scope = $rootScope;
            $compile(element)(scope);
            scope.$digest();
        });
    };

    angular
        .module('chrisguttandin.consistent-contenteditable')
        .controller('cgConContentCtrl', function ($scope) {

            $scope.expectLineBreak = controllerScope.expectLineBreak;
            controllerScope = $scope;

        });

    controllerScope = {
        expectLineBreak: false
    };

    beforeEach(module('chrisguttandin.consistent-contenteditable'));

    it('should contain no child nodes after initialization', function () {
        compile('');

        expect(element.children().length).toBe(0);
        expect(element.text()).toBe('');

        expect(scope.html).toBe('');
        expect(scope.text).toBe('');
    });

    it('should leave a single line text inside a div as it is', function () {
        compile('<div>text</div>');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div>text</div>');
        expect(scope.text).toBe('text');
    });

    it('should wrap a top level text node inside a div', function () {
        compile('text');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div>text</div>');
        expect(scope.text).toBe('text');
    });

    it('should handle webkit style line breaks', function () {
        compile('<br>');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('');

        expect(scope.html).toBe('<div><br></div>');
        expect(scope.text).toBe('');
    });

    it('should handle webkit style line breaks before text', function () {
        compile('<br><div>text</div>');

        expect(element.children().length).toBe(2);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div><br></div><div>text</div>');
        expect(scope.text).toBe('\ntext');
    });

    it('should handle firefox style line breaks before text', function () {
        controllerScope.expectLineBreak = true;

        compile('<div>text</div><div>text<br><br></div>');

        expect(element.children().length).toBe(3);
        expect(element.text()).toBe('texttext');

        expect(scope.html).toBe('<div>text</div><div>text</div><div><br></div>');
        expect(scope.text).toBe('text\ntext');
    });

    it('should handle firefox style line breaks on empty lines', function () {
        controllerScope.expectLineBreak = true;

        compile('<div>text</div><div><br><br></div>');

        expect(element.children().length).toBe(3);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div>text</div><div><br></div><div><br></div>');
        expect(scope.text).toBe('text\n');
    });

    it('should handle firefox style line breaks on empty lines with empty text nodes', function () {
        compile('');

        element.html('<div>text</div><div><br><br></div>');
        element.children().eq(1).append(document.createTextNode(''));
        controllerScope.expectLineBreak = true;
        element.triggerHandler('input');

        expect(element.children().length).toBe(3);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div>text</div><div><br></div><div><br></div>');
        expect(scope.text).toBe('text\n');
    });

    it('...', function () {
        compile('');

        element.html('<div>text</div><div><br></div><div>text</div>');
        element.children().eq(1).append(document.createTextNode(''));
        element.triggerHandler('input');

        expect(element.children().length).toBe(3);
        expect(element.text()).toBe('texttext');

        expect(scope.html).toBe('<div>text</div><div><br></div><div>text</div>');
        expect(scope.text).toBe('text\n\ntext');
    });

    it('....', function () {
        compile('');

        element.html('<div>text</div><div><br></div><div>text<br></div>');
        element.children().eq(1).append(document.createTextNode(''));
        element.children().eq(2).append(document.createTextNode(''));
        element.triggerHandler('input');

        expect(element.children().length).toBe(3);
        expect(element.text()).toBe('texttext');

        expect(scope.html).toBe('<div>text</div><div><br></div><div>text</div>');
        expect(scope.text).toBe('text\n\ntext');
    });

    it('.....', function () {
        compile('');

        element.html('<div></div>');
        element.children().eq(0).html('text <br>');
        element.triggerHandler('input');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('text ');

        expect(scope.html).toBe('<div>text&nbsp;</div>');
        expect(scope.text).toBe('text ');
    });

    it('should wrap top level elements (e.g. b) into a div', function () {
        compile('<b>text</b>');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div><b>text</b></div>');
        expect(scope.text).toBe('text');
    });

    it('should wrap top level elements (e.g. span) into a div', function () {
        compile('<span>text</span>');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('text');

        expect(scope.html).toBe('<div><span>text</span></div>');
        expect(scope.text).toBe('text');
    });

    it('should wrap multiple top level elements into single div', function () {
        compile('<span>text</span><span>text</span>');

        expect(element.children().length).toBe(1);
        expect(element.text()).toBe('texttext');

        expect(scope.html).toBe('<div><span>text</span><span>text</span></div>');
        expect(scope.text).toBe('texttext');
    });

});
