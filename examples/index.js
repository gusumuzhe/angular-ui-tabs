/**
 * Created by zhang on 2017/6/6.
 */
angular.module('app', ['ui.tabs'])
    .controller('MyController', function ($scope, uiTabs) {
        var index = 0;

        $scope.$on('tabChangeStart', function (e, tab) {
            console.log(tab);
        });

        $scope.$on('tabChangeSuccess', function (e, tab) {
            console.log(tab);

            $scope.currentTab = uiTabs.current;
        });

        $scope.tabs = uiTabs.tabs;

        $scope.addTab = function () {
            uiTabs.open({
                name: 'index' + (++index),
                templateUrl: 'demo.html',
                controller: 'DemoController' + index,
                params: {
                    name: 'test'
                }
            });
        };

        $scope.closeTab = function (tab) {
            uiTabs.close(tab);
        };

        $scope.active = function (tab) {
            uiTabs.active(tab);
        };

        $scope.closeAll = function () {
            uiTabs.closeAll();
        }

    })
    .controller('DemoController1', function ($scope, uiTab, uiTabsParams) {
        $scope.tabs = [1];

        // $scope.$on('tabCloseStart', function(e){
        //     e.preventDefault();
        // });
        //
        // $scope.$on('tabCloseError', function(e, tab){
        //     console.log('close error ', tab.id);
        // });

        console.log(uiTabsParams);

        $scope.$on('$destroy', function (e) {
            console.log('destroy', uiTab.id);
        })
    })
    .controller('DemoController2', function ($scope, uiTab, uiTabsParams) {
        $scope.tabs = [1, 2];

        // $scope.$on('tabCloseStart', function(e){
        //     e.preventDefault();
        // });
        //
        // $scope.$on('tabCloseError', function(e, tab){
        //     console.log('close error ', tab.id);
        // });

        console.log(uiTabsParams);

        $scope.$on('$destroy', function (e) {
            console.log('destroy', uiTab.id);
        })
    })
    .controller('DemoController3', function ($scope, uiTab, uiTabsParams) {
        $scope.tabs = [1, 2, 3];

        // $scope.$on('tabCloseStart', function(e){
        //     e.preventDefault();
        // });
        //
        // $scope.$on('tabCloseError', function(e, tab){
        //     console.log('close error ', tab.id);
        // });

        console.log(uiTabsParams);

        $scope.$on('$destroy', function (e) {
            console.log('destroy', uiTab.id);
        })
    });