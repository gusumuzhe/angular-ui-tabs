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
                reopen: true,
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'controller1.js']);
                        }]
                },
                params: {tab:1}
            })
            .tab('tab2', {
                title: 'tab2',
                controller: 'DemoController2',
                templateUrl: 'demo.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'controller2.js']);
                        }]
                },
                params: {tab:2}
            })
            .tab('tab3', {
                title: 'tab3',
                controller: 'DemoController3',
                templateUrl: 'demo.html',
                resolve: {
                    deps: ['$ocLazyLoad',
                        function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'controller3.js']);
                        }]
                },
                params: {tab:3}
            });

        uiTabsProvider.otherwise('tab2');
        uiTabsProvider.setOptions({reopen: false});
    })
    .controller('MyController', function ($scope, uiTabs) {

        $scope.$on('tabChangeStart', function (e, tab) {
            console.log(tab);
        });

        $scope.$on('tabChangeSuccess', function (e, tab) {
            console.log(tab);

            $scope.currentTab = uiTabs.current;
        });

        $scope.tabs = uiTabs.tabs;

        $scope.addTab = function (index) {
            uiTabs.open('tab' + index, {title: 'tab' + index});
        };

        $scope.closeTab = function (tab) {
            uiTabs.close(tab);
        };

        $scope.active = function (tab) {
            uiTabs.active(tab);
        };

        $scope.closeAll = function () {
            uiTabs.closeAll();
            uiTabs.open('tab3');
        }

    });
