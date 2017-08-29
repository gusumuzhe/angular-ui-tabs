/**
 * Created by zhang on 2017/5/26.
 */
import './angular-sortable-view';

var uiTabsModule = angular.module('ui.tabs', ['angular-sortable-view'])
    .provider('uiTabs', function () {
        var isDefined = angular.isDefined,
            isObject = angular.isObject,
            isString = angular.isString,
            isFunction = angular.isFunction,
            extend = angular.extend;

        var tabMinErr = angular.$$minErr('tab');

        var tabs = []; // 所有打开的tab集合
        var tabOptions = {}; // 所有tab的配置项

        /**
         * 配置tab项
         *
         * @param {string} name             tab名称，唯一
         * @param {object} option           tab配置
         *  @property {string} title            tab页标题
         *  @property {string} controller       controller名称
         *  @property {string} template         模板
         *  @property {string} templateUrl      模板地址
         *  @property          params           传递的参数，在打开的tab页中，会通过uiTabsParams 传入，如果open时，同时传入参数，可能被覆盖
         *  @property {object} resolve          传递的参数，通过注入的方式传入
         *  @property {boolean} reloadOnActive  在tab被重新激活时，是否重新加载
         * @return {*}
         */
        this.tab = function (name, option) {
            if (!option) {
                throw tabMinErr('nooption', 'tab functions must have option');
            }
            // 参数中必须有模版
            if (!option.template && !option.templateUrl) {
                throw tabMinErr('notemplate', 'tab options must have template or templateUrl property');
            }

            tabOptions[name] = angular.copy(option);

            return this;
        };

        /**
         * 配置当ui-tabs-view初始化时，没有打开的tab时，自动打开的一个默认tab
         *
         * @param {string} name tab名称，由this.tab 配置
         */
        this.otherwise = function (name) {
            tabOptions[null] = tabOptions[name];
        };

        this.$get = function ($rootScope, $q, $templateRequest, $injector) {
            var currentId = 1,
                uiTabs = {
                    tabs: tabs,

                    // /**
                    //  * 打开一个tab页
                    //  *
                    //  * @param {object} option
                    //  *  @property {string} name         新的tab页名称
                    //  *  @property {string} controller   controller名称
                    //  *  @property {string} template     模板
                    //  *  @property {string} templateUrl  模板地址
                    //  *  @property          params       传递的参数
                    //  */
                    // open: function (option) {
                    //     var lastTab = this.current,
                    //         tab = parseOption(option);
                    //
                    //     if (!$rootScope.$broadcast('tabOpenStart', tab, lastTab).defaultPrevented) {
                    //         tabs.push(tab);
                    //         uiTabs.current = tab;
                    //
                    //         $rootScope.$broadcast('tabOpenStarting', tab, lastTab);
                    //
                    //         return $q.resolve(tab.template).then(function (tpl) {
                    //             tab.template = tpl;
                    //
                    //             $rootScope.$broadcast('tabOpenSuccess', tab, lastTab);
                    //
                    //             return tpl;
                    //         }).catch(function () {
                    //             $rootScope.$broadcast('tabOpenError', tab, lastTab, {
                    //                 error: '2',
                    //                 message: 'template resolve error'
                    //             });
                    //
                    //             return {
                    //                 error: '2',
                    //                 message: 'template resolve error'
                    //             }
                    //         });
                    //     } else {
                    //         $rootScope.$broadcast('tabOpenError', tab, lastTab, {
                    //             error: '1',
                    //             message: 'prevented'
                    //         });
                    //
                    //         return $q.reject({
                    //             error: '1',
                    //             message: 'prevented'
                    //         });
                    //     }
                    // },

                    /**
                     * 打开tab页
                     *
                     * @param name 配置的tab名称
                     * @param params 传入的参数
                     * @return {*}
                     */
                    open: function (name, params) {
                        var lastTab = this.current,
                            tabOption = tabOptions[name],
                            tab;

                        // 没有默认配置项
                        if (name === null && !tabOptions[name]) {
                            return $q.reject({
                                error: '3',
                                message: 'no otherwise'
                            });
                        }

                        if (!tabOption) {
                            throw tabMinErr('notab', 'the tab ' + name + ' is not exist');
                        }

                        tab = parseOption(tabOption, params);

                        if (!$rootScope.$broadcast('tabOpenStart', tab, lastTab).defaultPrevented) {
                            tabs.push(tab);
                            uiTabs.current = tab;

                            $rootScope.$broadcast('tabOpenStarting', tab, lastTab);

                            return $q.resolve(tab.locals).then(function (locals) {
                                tab.locals = locals;

                                $rootScope.$broadcast('tabOpenSuccess', tab, lastTab);

                                return locals;
                            }).catch(function () {
                                $rootScope.$broadcast('tabOpenError', tab, lastTab, {
                                    error: '2',
                                    message: 'resolve error'
                                });
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
             * @param params
             * @return {Object}
             */
            function parseOption(option, params) {
                var tab = extend({
                    id: generatorTabId()
                }, option);

                tab.locals = resolveLocals(tab);

                if (isDefined(params)) {
                    if (!isObject(tab.params) || !isObject(params)) {
                        tab.params = params;
                    } else {
                        angular.extend(tab.params, params);
                    }
                }

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
             * 解析tab中的resolve
             *
             * @param tab
             */
            function resolveLocals(tab) {
                if (tab) {
                    var locals = angular.extend({}, tab.resolve);

                    angular.forEach(locals, function (value, key) {
                        locals[key] = isString(value) ?
                            $injector.get(value) :
                            $injector.invoke(value);
                    });

                    var template = getTemplateFor(tab);
                    if (isDefined(template)) {
                        locals['$template'] = template;
                    }

                    return $q.all(locals);
                }
            }

            /**
             * 获取模版
             *
             * @param tab
             * @return {promise}
             */
            function getTemplateFor(tab) {
                var template;

                if (isDefined(template = tab.template)) {
                    if (isFunction(template)) {
                        template = template(tab.params);
                    }
                } else if (isDefined(tab.templateUrl)) {
                    template = $templateRequest(tab.templateUrl);
                }

                return template;
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