/**
 * Created by zhang on 2017/5/26.
 */
import './angular-sortable-view';

var uiTabsModule = angular.module('ui.tabs', ['angular-sortable-view'])
    .provider('uiTabs', function () {
        var isDefined = angular.isDefined,
            isObject = angular.isObject,
            extend = angular.extend;

        var tabs = []; // 所有的tab集合

        this.$get = function ($rootScope, $q, $templateRequest) {
            var currentId = 1,
                uiTabs = {
                    tabs: tabs,

                    /**
                     * 打开一个tab页
                     *
                     * @param {object} option
                     *  @property {string} name         新的tab页名称
                     *  @property {string} controller   controller名称
                     *  @property {string} template     模板
                     *  @property {string} templateUrl  模板地址
                     *  @property          params       传递的参数
                     */
                    open: function (option) {
                        var lastTab = this.current,
                            tab = parseOption(option);

                        if (!$rootScope.$broadcast('tabOpenStart', tab, lastTab).defaultPrevented) {
                            tabs.push(tab);
                            uiTabs.current = tab;

                            $rootScope.$broadcast('tabOpenStarting', tab, lastTab);

                            return $q.resolve(tab.template).then(function (tpl) {
                                tab.template = tpl;

                                $rootScope.$broadcast('tabOpenSuccess', tab, lastTab);

                                return tpl;
                            }).catch(function () {
                                $rootScope.$broadcast('tabOpenError', tab, lastTab, {
                                    error: '2',
                                    message: 'template resolve error'
                                });

                                return {
                                    error: '2',
                                    message: 'template resolve error'
                                }
                            });
                        } else {
                            $rootScope.$broadcast('tabOpenError', tab, lastTab, {
                                error: '1',
                                message: 'prevented'
                            });

                            return $q.reject({
                                error: '1',
                                message: 'prevented'
                            });
                        }
                    },

                    /**
                     * 关闭tab
                     *
                     * @param {string|object} tab tab对象或者tab id
                     * @return {boolean} 是否关闭成功
                     */
                    close: function (tab) {
                        tab = getTab(tab);

                        return closeTab(tab);
                    },

                    /**
                     * 关闭所有tab页, 并且无法阻止
                     */
                    closeAll: function () {
                        while (tabs[0]) {
                            closeTab(tabs[0], true);
                        }
                    },

                    /**
                     * 激活tab
                     *
                     * @param {string|object} tab tab对象或者tab id
                     * @return {boolean} 切换tab页是否成功
                     */
                    active: function (tab) {
                        tab = getTab(tab);

                        return activeTab(tab);
                    },

                    /**
                     * 对该标签页刷新
                     *
                     * @param tab
                     */
                    refresh: function (tab) {
                        tab = getTab(tab);

                        if (tab) {
                            refreshTab(tab);
                        }
                    }
                };

            return uiTabs;


            /**
             * 刷新tab
             *
             * @param tab
             */
            function refreshTab(tab) {
                $rootScope.$broadcast('tabRefresh', tab);
            }

            /**
             * 关闭tab
             *
             * @param {object} tab
             * @param {boolean} [isForce] 是否强制关闭tab页，无法通过preventDefault阻止
             * @return {boolean}
             */
            function closeTab(tab, isForce) {
                var index = tabs.indexOf(tab),
                    isCurrentTab = tab === uiTabs.current,
                    isCloseSuccess = false,
                    nextTab;

                if (index >= 0) {
                    // 触发事件，如果被阻止了，则跳转到关闭的tab页，以显示必要的阻止关闭原因
                    if (!$rootScope.$broadcast('tabCloseStart', tab).defaultPrevented || isForce) {
                        // 如果关闭的tab为当前页，则需要激活下一个tab
                        if (isCurrentTab) {
                            nextTab = getNextTab();

                            activeTab(nextTab);
                        }

                        tabs.splice(index, 1);

                        $rootScope.$broadcast('tabCloseSuccess', tab);

                        isCloseSuccess = true;
                    } else {
                        isCurrentTab || activeTab(tab);

                        $rootScope.$broadcast('tabCloseError', tab, {
                            error: '1',
                            message: 'prevented'
                        });
                    }
                }

                return isCloseSuccess;
            }


            /**
             * 激活tab页
             *
             * @param {object} tab
             * @return {boolean}
             */
            function activeTab(tab) {
                var lastTab = uiTabs.current,
                    isActiveSuccess = false;

                if (!tab) {
                    return isActiveSuccess;
                }

                if (tab !== lastTab) {
                    // 触发事件，并且可以通过 preventDefault 阻止tab的切换
                    if (!$rootScope.$broadcast('tabChangeStart', tab, lastTab).defaultPrevented) {
                        uiTabs.current = tab;

                        $rootScope.$broadcast('tabChangeSuccess', tab, lastTab);

                        isActiveSuccess = true;
                    } else {
                        $rootScope.$broadcast('tabChangeError', tab, lastTab, {
                            error: '1',
                            message: 'prevented'
                        })
                    }
                }

                return isActiveSuccess;
            }

            /**
             * 解析配置，返回tab
             *
             * @param option
             * @return {Object}
             */
            function parseOption(option) {
                var tab = extend({
                    id: generatorTabId()
                }, option);

                tab.template = getTemplateFor(tab);
                tab.close = function () {
                    return closeTab(tab);
                };
                tab.refresh = function () {
                    refreshTab(tab);
                };

                return tab;
            }

            /**
             * 当当前的tab被关闭时, 下一个应该被激活的tab
             *
             * @return {object}
             */
            function getNextTab() {
                var index = tabs.indexOf(uiTabs.current);
                var nextIndex = index == 0 ? 1 : index - 1;

                return tabs[nextIndex];
            }

            /**
             * 生成一个唯一的tab Id
             * @return {string}
             */
            function generatorTabId() {
                return 'tab' + currentId++;
            }

            /**
             * 获取模版
             *
             * @param tab
             * @return {promise}
             */
            function getTemplateFor(tab) {
                var template;

                if (isDefined(tab.template)) {
                    template = tab.template;
                } else if (isDefined(tab.templateUrl)) {
                    template = $templateRequest(tab.templateUrl);
                }

                return $q.resolve(template);
            }

            /**
             * 根据tab Id 或者 tab 获取tab
             *
             * @param {string|object} tab
             */
            function getTab(tab) {
                if (isObject(tab) && tabs.indexOf(tab) >= 0) {
                    return tab;
                } else {
                    for (var i = 0; i < tabs.length; i++) {
                        if (tabs[i].id === tab) {
                            return tabs[i];
                        }
                    }
                }
            }
        };


    });

export default uiTabsModule;