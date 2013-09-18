'use strict';

angular
    .module('chrisguttandin.consistent-contenteditable', [])
    .controller('cgConContentCtrl', function ($scope) {

        $scope.expectLineBreak = false;

    })
    .directive('cgConContent', function ($document) {

        function applyBindings($scope, html, text) {
            $scope.expectChange = false;

            if (!$scope.$root.$$phase) {
                $scope.$apply(function() {
                    $scope.html = html;
                    $scope.text = text;
                });
            } else {
                $scope.html = html;
                $scope.text = text;
            }
        }

        // little helper to create a new div
        function createDiv() {
            return $document[0].createElement('div');
        }

        function createDivWithBr() {
            var div = createDiv();

            //div.appendChild($document[0].createTextNode(''));
            div.appendChild($document[0].createElement('br'));

            return div;
        }

        // little helpers to increase readability
        function isText(node) {
            return node.nodeType === 3;
        }

        function isEmptyText(node) {
            return isText(node) && node.nodeValue === '';
        }

        function insertNodeAfter(node, child, referenceChild) {
            var nextSibling = referenceChild.nextSibling;

            if (nextSibling) {
                node.insertBefore(child, nextSibling);
            } else {
                node.appendChild(child);
            }
        }

        // little hepler to unify node names
        function nodeName(node) {
            return node.nodeName.toLowerCase();
        }

        function endsWithBr(node) {
            var currentChild = node.lastChild;

            while (currentChild) {
                if (nodeName(currentChild) === 'br') {
                    return true;
                } else if (isEmptyText(currentChild)) {
                    currentChild = currentChild.previousSibling;
                } else {
                    return false;
                }
            }

            return false;
        }

        // does not remove the last child, even if it is a br
        function removeBreaksAtEnd(node) {
            var lastChild = node.lastChild;

            while (lastChild && node.childNodes.length > 1) {
                if (isEmptyText(lastChild) || nodeName(lastChild) === 'br') {
                    node.removeChild(lastChild);
                    lastChild = node.lastChild;
                } else {
                    break;
                }
            }
        }

        // little hepler to select a node
        function selectNode(node, offset) {
            var range = $document[0].createRange(),
                selection = window.getSelection();

            range.setStart(node, offset);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        function escapeWhiteSpaceAtEnd(node) {
            if (node.nodeValue.match(/\s$/)) {
                node.nodeValue = node.nodeValue.slice(0, -1) + '\u00a0';
            }
        }

        function logChildren(node) {
            var child,
                children,
                i,
                length;

            children = node.childNodes;
            length = children.length;

            for (i = 0; i < length; i += 1) {
                child = children[i];
                console.log(child.nodeName, child.nodeValue);
                if (child.childNodes) {
                    logChildren(child);
                }
            }
        }

        function textValue(node) {
            var children,
                i,
                length,
                textValues;

            if (isText(node)) {
                return node.nodeValue;
            } else {
                children = node.childNodes;
                length = children.length;
                textValues = [];

                for (i = 0; i < length; i += 1) {
                    textValues.push(textValue(children[i]));
                }

                return textValues.join();
            }
        }

        function normalize($scope) {
            var child,
                children,
                div,
                htmlAfterwards,
                htmlBefore,
                i,
                lastGrandChild,
                length,
                lines,
                parent;

            //logChildren(parent);

            parent = this;
            children = parent.childNodes;
            htmlBefore = parent.innerHTML;
            length = children.length;
            lines = [];

            for (i = 0; i < length; i += 1) {
                child = children[i];
                if (isEmptyText(child)) {
                    // remove empty text nodes at top level
                    parent.removeChild(child);
                    length -= 1;
                    i -= 1;
                } else if (isText(child)) {
                    // wrap a top level text node into a div
                    escapeWhiteSpaceAtEnd(child);
                    div = createDiv();
                    parent.replaceChild(div, child);
                    div.appendChild(child);
                    selectNode(child, child.length);
                    lines.push(child.nodeValue);
                } else if (nodeName(child) === 'br') {
                    // wrap a br tag into a div
                    div = createDivWithBr();
                    parent.replaceChild(div, child);
                    selectNode(div, 0);
                    lines.push('');
                } else if (nodeName(child) !== 'div') {
                    // wrap all other tags into a div
                    if (child.previousSibling) {
                        child.previousSibling.appendChild(child);
                        lines[lines.length - 1] += textValue(child);
                        length -= 1;
                        i -= 1;
                    } else {
                        div = createDiv();
                        parent.replaceChild(div, child);
                        div.appendChild(child);
                        lines.push(textValue(child));
                    }
                } else if (endsWithBr(child)) {
                    if ($scope.expectLineBreak) {
                        if (child.childNodes.length > 1) {
                            $scope.expectLineBreak = false;
                            removeBreaksAtEnd(child);
                            div = createDivWithBr();
                            insertNodeAfter(parent, div, child);
                            length += 1;
                            i += 1;
                            selectNode(div, 0);
                        }
                        lines.push(child.firstChild.nodeValue);
                    } else {
                        if (child.childNodes.length > 1) {
                            removeBreaksAtEnd(child);
                            if (isText(child.lastChild)) {
                                escapeWhiteSpaceAtEnd(child.lastChild);
                                selectNode(child.lastChild, child.lastChild.length);
                                lines.push(child.firstChild.nodeValue);
                            } else {
                                lines.push('');
                            }
                        } else {
                            lines.push('');
                        }
                    }
                } else {
                    lines.push(child.lastChild.nodeValue);
                }
            }

            //logChildren(parent);

            htmlAfterwards = parent.innerHTML;

            if (htmlBefore !== htmlAfterwards || htmlBefore !== $scope.html) {
                console.log('start normalizing the following html structure: "' + htmlBefore + '"');
                console.log('normalized the following html structure: "' + htmlAfterwards + '"');
                applyBindings($scope, htmlAfterwards, lines.join('\n'));
            }
        }

        return {
            controller: 'cgConContentCtrl',
            link: function ($scope, element) {

                $scope.expectChange = false;

                function insertHtml (html) {
                    if (typeof html !== 'undefined') {
                        element[0].innerHTML = html;
                    }
                    normalize.call(element[0], $scope);
                }

                $scope.$watch('html', function(newValue, oldValue) {
                    if ($scope.expectChange &&
                            newValue !== oldValue) {
                        insertHtml(newValue);
                    }
                    $scope.expectChange = true;
                });

                element.bind('input', normalize.bind(element[0], $scope));

                insertHtml($scope.html);

                // binding keyup whould be to late
                element.bind('keydown', function (event) {
                    if (event.which === 13) {
                        $scope.expectLineBreak = true;
                    }
                });
            },
            restrict: 'A',
            scope: {
                html: '=',
                text: '='
            }
        };
    });
