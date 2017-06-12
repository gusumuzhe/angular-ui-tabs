/**
 * Created by zhang on 2017/6/8.
 */
import uiTabsModule from './ui-tabs';
import menuHtml from '../tpls/menu.html';
import '../scss/ui-tabs-menu.scss';

uiTabsModule.directive('uiTabsMenu', function () {
    var $document = angular.element(document),
        $body = angular.element(document.body),
        $menu = angular.element(menuHtml),
        width, currentScope, expression;

    $document.on('mousedown', closeMenu);
    $body.append($menu);
    $menu.on('mousedown', itemSelect);

    return {
        restrict: 'CA',
        link: function (scope, element, attr) {

            // 监听右键事件，自制系统事件，并且弹出自定义右键菜单
            element.on('contextmenu', function (e) {
                var bodyWidth = document.body.offsetWidth,
                    scrollTop = document.body.scrollTop,
                    scrollLeft = document.body.scrollLeft;

                if (bodyWidth - e.clientX < width) {
                    $menu.css('left', e.clientX - width + scrollLeft + 'px');
                } else {
                    $menu.css('left', e.clientX + scrollLeft + 'px');
                }

                $menu.css('top', e.clientY + scrollTop + 'px');
                $menu.css('display', 'block');

                expression = attr.uiTabsMenu;
                currentScope = scope;

                e.preventDefault();
            });
        }
    };

    function closeMenu() {
        if (!width) {
            width = $menu.prop('offsetWidth');
        }

        $menu.css('display', 'none');
    }

    function itemSelect(e) {
        var target = e.target;

        if (target.tagName.toLowerCase() === 'li' && expression && currentScope) {
            currentScope.$apply(function () {
                currentScope.$eval(expression, {
                    action: target.dataset.action
                });
            });
        }
    }
});