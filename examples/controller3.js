/**
 * Created by zhang on 2017/8/15.
 */
angular.module('app')
    .controller('DemoController3', function ($scope, uiTab, uiTabsParams) {
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