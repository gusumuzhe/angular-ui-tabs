/**
 * Created by zhang on 2017/6/6.
 */
var app = angular.module('app', ['ui.tabs', 'oc.lazyLoad'])
    .config(
        ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$qProvider',
            function ($controllerProvider,   $compileProvider,   $filterProvider,   $provide, $qProvider) {

                // lazy controller, directive and service
                app.controller = $controllerProvider.register;
                app.directive  = $compileProvider.directive;
                app.filter     = $filterProvider.register;
                app.factory    = $provide.factory;
                app.service    = $provide.service;
                app.constant   = $provide.constant;
                app.value      = $provide.value;

                $qProvider.errorOnUnhandledRejections(false);
            }
        ])
    .config(function (uiTabsProvider) {
        uiTabsProvider
            .tab('tab1', {
                title: 'tab1',
                controller: 'DemoController1',
                templateUrl: 'demo.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'controller.js']);
                        }]
                },
                params: {b:2}
            })
            .tab('tab2', {
                title: 'tab2',
                controller: 'DemoController1',
                templateUrl: 'demo.html'
            })
            .tab('tab3', {
                title: 'tab3',
                controller: 'DemoController1',
                templateUrl: 'demo.html'
            });

        // uiTabsProvider.otherwise('tab2');
        // uiTabsProvider.setOptions({reopen: false});
    })
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
            // uiTabs.open({
            //     name: 'index' + (++index),
            //     templateUrl: 'demo.html',
            //     controller: 'DemoController' + index,
            //     params: {
            //         name: 'test'
            //     }
            // });
            uiTabs.open('tab1', {title: 'tab' + (++index)});
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
    .controller('DemoController4', function ($scope, uiTab, uiTabsParams) {
        $scope.tabs = uiTabsParams;

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
