/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

__webpack_require__(6);

var uiTabsModule = angular.module('ui.tabs', ['angular-sortable-view']).provider('uiTabs', function () {
    var isDefined = angular.isDefined,
        isObject = angular.isObject,
        isString = angular.isString,
        isFunction = angular.isFunction,
        extend = angular.extend;

    var tabMinErr = angular.$$minErr('tab');

    var tabs = []; // 所有打开的tab集合
    var tabOptions = {}; // 所有tab的配置项

    var defaultOptions = { // 默认配置
        reloadOnActive: false,
        reopen: true
    };

    var maxTabs = 20; // 允许打开的最大数量的tab

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
     *  @property {boolean} reloadOnActive  在tab被重新激活时，是否重新加载 默认 false
     *  @property {boolean} reopen          是否允许重复打开相同的tab
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
        tabOptions[null] = name;
    };

    /**
     * 设置默认配置
     *
     * @param {Object} options 配置
     *  @property {boolean} reloadOnActive
     *  @property {boolean} reopen
     */
    this.setOptions = function (options) {
        if (isObject(options)) {
            extend(defaultOptions, options);
        } else {
            throw tabMinErr('typeerror', 'options must object');
        }
    };

    /**
     * 设置最大数量的打开的tab
     *
     * @param max
     */
    this.setMaxTabs = function (max) {
        maxTabs = max;
    };

    this.$get = function ($rootScope, $q, $templateRequest, $injector) {
        var currentId = 1,
            uiTabs = {
            tabs: tabs,

            /**
             * 打开tab页
             *
             * @param name 配置的tab名称
             * @param params 传入的参数
             * @return {*}
             */
            open: function open(name, params) {
                var lastTab = this.current,
                    tab,
                    openedTab;

                if (name === null && !(name = tabOptions[name])) {
                    return $q.reject({
                        error: '5',
                        message: 'no default tab'
                    });
                }

                tab = parseTab(name, params);

                if (!tab) {
                    return $q.reject({
                        error: '3',
                        message: 'default tab is not exists'
                    });
                }

                // 不允许重复打开时，则跳转到该tab
                if (!tab.reopen && (openedTab = getTabByName(name))) {
                    return $q.resolve(activeTab(openedTab));
                }

                // 不允许打开过多tab
                if (tabs.length >= maxTabs) {
                    return $q.reject({
                        error: '5',
                        message: 'tab numbers limit'
                    });
                }

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
            close: function close(tab) {
                tab = getTab(tab);

                return closeTab(tab);
            },

            /**
             * 关闭所有tab页, 并且无法阻止
             */
            closeAll: function closeAll() {
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
            active: function active(tab) {
                tab = getTab(tab);

                return activeTab(tab);
            },

            /**
             * 对该标签页刷新
             *
             * @param tab
             */
            refresh: function refresh(tab) {
                tab = getTab(tab);

                if (tab) {
                    refreshTab(tab);
                }
            }
        };

        return uiTabs;

        /**
         * 获取相同name的tab
         *
         * @param name
         * @return {*}
         */
        function getTabByName(name) {
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].name === name) {
                    return tabs[i];
                }
            }
        }

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
                    });
                }
            }

            return isActiveSuccess;
        }

        /**
         * 解析配置，返回tab
         *
         * @param name
         * @param params
         * @return {Object|undefined}
         */
        function parseTab(name, params) {
            var option = tabOptions[name],
                tab;

            if (!option) {
                throw tabMinErr('notab', 'the tab ' + name + ' is not exist');
            }

            tab = extend({
                id: generatorTabId(),
                name: name
            }, defaultOptions, option);

            tab.locals = resolveLocals(tab);

            if (isDefined(params)) {
                if (!isObject(tab.params) || !isObject(params)) {
                    tab.params = params;
                } else {
                    tab.params = angular.extend({}, tab.params, params);
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
                    locals[key] = isString(value) ? $injector.get(value) : $injector.invoke(value);
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
}); /**
     * Created by zhang on 2017/5/26.
     */
exports.default = uiTabsModule;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(12);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);

	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _uiTabs = __webpack_require__(0);

var _uiTabs2 = _interopRequireDefault(_uiTabs);

var _menu = __webpack_require__(10);

var _menu2 = _interopRequireDefault(_menu);

__webpack_require__(11);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_uiTabs2.default.directive('uiTabsMenu', function () {
    var $document = angular.element(document),
        $body = angular.element(document.body),
        $menu = angular.element(_menu2.default),
        width,
        currentScope,
        expression;

    $document.on('mousedown', closeMenu);
    $body.append($menu);
    $menu.on('mousedown', itemSelect);

    return {
        restrict: 'CA',
        link: function link(scope, element, attr) {

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
}); /**
     * Created by zhang on 2017/6/8.
     */

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = "<div class=\"ui-tabs\" ng-show=\"tabs.length > 0\">\n  <ul class=\"ui-tabs-nav\" sv-root sv-part=\"tabs\">\n    <li ng-repeat=\"tab in tabs track by tab.id\" ng-class=\"{active: tab === current}\" sv-element=\"opts\" ng-mousedown=\"activeTab(tab)\" ng-mousedown=\"mouseDown($event)\" ui-tabs-menu=\"menuSelect(tab, action)\">\n      <i class=\"ui-tabs-loading-icon\" ng-show=\"tab.loading\"></i>\n      <span>{{tab.title}}</span>\n      <i class=\"ui-tabs-close-icon\" ng-mousedown=\"close($event, tab)\"></i>\n    </li>\n  </ul>\n  <div class=\"ui-tabs-container\">\n    <div class=\"ui-tabs-page\" id=\"ui-tabs-{{tab.id}}\" ng-show=\"tab === current\" ng-repeat=\"tab in tabs track by tab.id\"></div>\n  </div>\n</div>";

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(9);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--1-1!../../node_modules/postcss-loader/lib/index.js!../../node_modules/sass-loader/lib/loader.js!./ui-tabs.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--1-1!../../node_modules/postcss-loader/lib/index.js!../../node_modules/sass-loader/lib/loader.js!./ui-tabs.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//
// Copyright Kamil Pękala http://github.com/kamilkp
// angular-sortable-view v0.0.15 2015/01/18
//

;(function (window, angular) {
	'use strict';
	/* jshint eqnull:true */
	/* jshint -W041 */
	/* jshint -W030 */

	var module = angular.module('angular-sortable-view', []);
	module.directive('svRoot', [function () {
		function shouldBeAfter(elem, pointer, isGrid) {
			return isGrid ? elem.x - pointer.x < 0 : elem.y - pointer.y < 0;
		}
		function getSortableElements(key) {
			return ROOTS_MAP[key];
		}
		function removeSortableElements(key) {
			delete ROOTS_MAP[key];
		}

		var sortingInProgress;
		var ROOTS_MAP = Object.create(null);
		// window.ROOTS_MAP = ROOTS_MAP; // for debug purposes

		return {
			restrict: 'A',
			controller: ['$scope', '$attrs', '$interpolate', '$parse', function ($scope, $attrs, $interpolate, $parse) {
				var mapKey = $interpolate($attrs.svRoot)($scope) || $scope.$id;
				if (!ROOTS_MAP[mapKey]) ROOTS_MAP[mapKey] = [];

				var that = this;
				var candidates; // set of possible destinations
				var $placeholder; // placeholder element
				var options; // sortable options
				var $helper; // helper element - the one thats being dragged around with the mouse pointer
				var $original; // original element
				var $target; // last best candidate
				var isGrid = false;
				var onSort = $parse($attrs.svOnSort);

				// ----- hack due to https://github.com/angular/angular.js/issues/8044
				$attrs.svOnStart = $attrs.$$element[0].attributes['sv-on-start'];
				$attrs.svOnStart = $attrs.svOnStart && $attrs.svOnStart.value;

				$attrs.svOnStop = $attrs.$$element[0].attributes['sv-on-stop'];
				$attrs.svOnStop = $attrs.svOnStop && $attrs.svOnStop.value;
				// -------------------------------------------------------------------

				var onStart = $parse($attrs.svOnStart);
				var onStop = $parse($attrs.svOnStop);

				this.sortingInProgress = function () {
					return sortingInProgress;
				};

				if ($attrs.svGrid) {
					// sv-grid determined explicite
					isGrid = $attrs.svGrid === "true" ? true : $attrs.svGrid === "false" ? false : null;
					if (isGrid === null) throw 'Invalid value of sv-grid attribute';
				} else {
					// check if at least one of the lists have a grid like layout
					$scope.$watchCollection(function () {
						return getSortableElements(mapKey);
					}, function (collection) {
						isGrid = false;
						var array = collection.filter(function (item) {
							return !item.container;
						}).map(function (item) {
							return {
								part: item.getPart().id,
								y: item.element[0].getBoundingClientRect().top
							};
						});
						var dict = Object.create(null);
						array.forEach(function (item) {
							if (dict[item.part]) dict[item.part].push(item.y);else dict[item.part] = [item.y];
						});
						Object.keys(dict).forEach(function (key) {
							dict[key].sort();
							dict[key].forEach(function (item, index) {
								if (index < dict[key].length - 1) {
									if (item > 0 && item === dict[key][index + 1]) {
										isGrid = true;
									}
								}
							});
						});
					});
				}

				this.$moveUpdate = function (opts, mouse, svElement, svOriginal, svPlaceholder, originatingPart, originatingIndex) {
					var svRect = svElement[0].getBoundingClientRect();
					if (opts.tolerance === 'element') mouse = {
						x: ~~(svRect.left + svRect.width / 2),
						y: ~~(svRect.top + svRect.height / 2)
					};

					sortingInProgress = true;
					candidates = [];
					if (!$placeholder) {
						if (svPlaceholder) {
							// custom placeholder
							$placeholder = svPlaceholder.clone();
							$placeholder.removeClass('ng-hide');
						} else {
							// default placeholder
							$placeholder = svOriginal.clone();
							$placeholder.addClass('sv-visibility-hidden');
							$placeholder.addClass('sv-placeholder');
							$placeholder.css({
								'height': svRect.height + 'px',
								'width': svRect.width + 'px'
							});
						}

						svOriginal.after($placeholder);
						svOriginal.addClass('ng-hide');

						// cache options, helper and original element reference
						$original = svOriginal;
						options = opts;
						$helper = svElement;

						onStart($scope, {
							$helper: { element: $helper },
							$part: originatingPart.model(originatingPart.scope),
							$index: originatingIndex,
							$item: originatingPart.model(originatingPart.scope)[originatingIndex]
						});
						$scope.$root && $scope.$root.$$phase || $scope.$apply();
					}

					// ----- move the element
					$helper[0].reposition({
						x: mouse.x + document.body.scrollLeft - mouse.offset.x * svRect.width,
						y: mouse.y + document.body.scrollTop - mouse.offset.y * svRect.height
					});

					// ----- manage candidates
					getSortableElements(mapKey).forEach(function (se, index) {
						if (opts.containment != null) {
							// TODO: optimize this since it could be calculated only once when the moving begins
							if (!elementMatchesSelector(se.element, opts.containment) && !elementMatchesSelector(se.element, opts.containment + ' *')) return; // element is not within allowed containment
						}
						var rect = se.element[0].getBoundingClientRect();
						var center = {
							x: ~~(rect.left + rect.width / 2),
							y: ~~(rect.top + rect.height / 2)
						};
						if (!se.container && ( // not the container element
						se.element[0].scrollHeight || se.element[0].scrollWidth)) {
							// element is visible
							candidates.push({
								element: se.element,
								q: (center.x - mouse.x) * (center.x - mouse.x) + (center.y - mouse.y) * (center.y - mouse.y),
								view: se.getPart(),
								targetIndex: se.getIndex(),
								after: shouldBeAfter(center, mouse, isGrid)
							});
						}
						if (se.container && !se.element[0].querySelector('[sv-element]:not(.sv-placeholder):not(.sv-source)')) {
							// empty container
							candidates.push({
								element: se.element,
								q: (center.x - mouse.x) * (center.x - mouse.x) + (center.y - mouse.y) * (center.y - mouse.y),
								view: se.getPart(),
								targetIndex: 0,
								container: true
							});
						}
					});
					var pRect = $placeholder[0].getBoundingClientRect();
					var pCenter = {
						x: ~~(pRect.left + pRect.width / 2),
						y: ~~(pRect.top + pRect.height / 2)
					};
					candidates.push({
						q: (pCenter.x - mouse.x) * (pCenter.x - mouse.x) + (pCenter.y - mouse.y) * (pCenter.y - mouse.y),
						element: $placeholder,
						placeholder: true
					});
					candidates.sort(function (a, b) {
						return a.q - b.q;
					});

					candidates.forEach(function (cand, index) {
						if (index === 0 && !cand.placeholder && !cand.container) {
							$target = cand;
							cand.element.addClass('sv-candidate');
							if (cand.after) cand.element.after($placeholder);else insertElementBefore(cand.element, $placeholder);
						} else if (index === 0 && cand.container) {
							$target = cand;
							cand.element.append($placeholder);
						} else cand.element.removeClass('sv-candidate');
					});
				};

				this.$drop = function (originatingPart, index, options) {
					if (!$placeholder) return;

					if (options.revert) {
						var placeholderRect = $placeholder[0].getBoundingClientRect();
						var helperRect = $helper[0].getBoundingClientRect();
						var distance = Math.sqrt(Math.pow(helperRect.top - placeholderRect.top, 2) + Math.pow(helperRect.left - placeholderRect.left, 2));

						var duration = +options.revert * distance / 200; // constant speed: duration depends on distance
						duration = Math.min(duration, +options.revert); // however it's not longer that options.revert

						['-webkit-', '-moz-', '-ms-', '-o-', ''].forEach(function (prefix) {
							if (typeof $helper[0].style[prefix + 'transition'] !== "undefined") $helper[0].style[prefix + 'transition'] = 'all ' + duration + 'ms ease';
						});
						setTimeout(afterRevert, duration);
						$helper.css({
							'top': placeholderRect.top + document.body.scrollTop + 'px',
							'left': placeholderRect.left + document.body.scrollLeft + 'px'
						});
					} else afterRevert();

					function afterRevert() {
						sortingInProgress = false;
						$placeholder.remove();
						$helper.remove();
						$original.removeClass('ng-hide');

						candidates = void 0;
						$placeholder = void 0;
						options = void 0;
						$helper = void 0;
						$original = void 0;

						// sv-on-stop callback
						onStop($scope, {
							$part: originatingPart.model(originatingPart.scope),
							$index: index,
							$item: originatingPart.model(originatingPart.scope)[index]
						});

						if ($target) {
							$target.element.removeClass('sv-candidate');
							var spliced = originatingPart.model(originatingPart.scope).splice(index, 1);
							var targetIndex = $target.targetIndex;
							if ($target.view === originatingPart && $target.targetIndex > index) targetIndex--;
							if ($target.after) targetIndex++;
							$target.view.model($target.view.scope).splice(targetIndex, 0, spliced[0]);

							// sv-on-sort callback
							if ($target.view !== originatingPart || index !== targetIndex) onSort($scope, {
								$partTo: $target.view.model($target.view.scope),
								$partFrom: originatingPart.model(originatingPart.scope),
								$item: spliced[0],
								$indexTo: targetIndex,
								$indexFrom: index
							});
						}
						$target = void 0;

						$scope.$root && $scope.$root.$$phase || $scope.$apply();
					}
				};

				this.addToSortableElements = function (se) {
					getSortableElements(mapKey).push(se);
				};
				this.removeFromSortableElements = function (se) {
					var elems = getSortableElements(mapKey);
					var index = elems.indexOf(se);
					if (index > -1) {
						elems.splice(index, 1);
						if (elems.length === 0) removeSortableElements(mapKey);
					}
				};
			}]
		};
	}]);

	module.directive('svPart', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: '^svRoot',
			controller: ['$scope', function ($scope) {
				$scope.$ctrl = this;
				this.getPart = function () {
					return $scope.part;
				};
				this.$drop = function (index, options) {
					$scope.$sortableRoot.$drop($scope.part, index, options);
				};
			}],
			scope: true,
			link: function link($scope, $element, $attrs, $sortable) {
				if (!$attrs.svPart) throw new Error('no model provided');
				var model = $parse($attrs.svPart);
				if (!model.assign) throw new Error('model not assignable');

				$scope.part = {
					id: $scope.$id,
					element: $element,
					model: model,
					scope: $scope
				};
				$scope.$sortableRoot = $sortable;

				var sortablePart = {
					element: $element,
					getPart: $scope.$ctrl.getPart,
					container: true
				};
				$sortable.addToSortableElements(sortablePart);
				$scope.$on('$destroy', function () {
					$sortable.removeFromSortableElements(sortablePart);
				});
			}
		};
	}]);

	module.directive('svElement', ['$parse', function ($parse) {
		return {
			restrict: 'A',
			require: ['^svPart', '^svRoot'],
			controller: ['$scope', function ($scope) {
				$scope.$ctrl = this;
			}],
			link: function link($scope, $element, $attrs, $controllers) {
				var sortableElement = {
					element: $element,
					getPart: $controllers[0].getPart,
					getIndex: function getIndex() {
						return $scope.$index;
					}
				};
				$controllers[1].addToSortableElements(sortableElement);
				$scope.$on('$destroy', function () {
					$controllers[1].removeFromSortableElements(sortableElement);
				});

				var handle = $element;
				handle.on('mousedown touchstart', onMousedown);
				$scope.$watch('$ctrl.handle', function (customHandle) {
					if (customHandle) {
						handle.off('mousedown touchstart', onMousedown);
						handle = customHandle;
						handle.on('mousedown touchstart', onMousedown);
					}
				});

				var helper;
				$scope.$watch('$ctrl.helper', function (customHelper) {
					if (customHelper) {
						helper = customHelper;
					}
				});

				var placeholder;
				$scope.$watch('$ctrl.placeholder', function (customPlaceholder) {
					if (customPlaceholder) {
						placeholder = customPlaceholder;
					}
				});

				var body = angular.element(document.body);
				var html = angular.element(document.documentElement);

				var moveExecuted;

				function onMousedown(e) {
					touchFix(e);

					if ($controllers[1].sortingInProgress()) return;
					if (e.button != 0 && e.type === 'mousedown') return;

					moveExecuted = false;
					var opts = $parse($attrs.svElement)($scope);
					opts = angular.extend({}, {
						tolerance: 'pointer',
						revert: 200,
						containment: 'html'
					}, opts);
					if (opts.containment) {
						var containmentRect = closestElement.call($element, opts.containment)[0].getBoundingClientRect();
					}

					var target = $element;
					var clientRect = $element[0].getBoundingClientRect();
					var clone;

					if (!helper) helper = $controllers[0].helper;
					if (!placeholder) placeholder = $controllers[0].placeholder;
					if (helper) {
						clone = helper.clone();
						clone.removeClass('ng-hide');
						clone.css({
							'left': clientRect.left + document.body.scrollLeft + 'px',
							'top': clientRect.top + document.body.scrollTop + 'px'
						});
						target.addClass('sv-visibility-hidden');
					} else {
						clone = target.clone();
						clone.addClass('sv-helper').css({
							'left': clientRect.left + document.body.scrollLeft + 'px',
							'top': clientRect.top + document.body.scrollTop + 'px',
							'width': clientRect.width + 'px'
						});
					}

					clone[0].reposition = function (coords) {
						var targetLeft = coords.x;
						var targetTop = coords.y;
						var helperRect = clone[0].getBoundingClientRect();

						var body = document.body;

						if (containmentRect) {
							if (targetTop < containmentRect.top + body.scrollTop) // top boundary
								targetTop = containmentRect.top + body.scrollTop;
							if (targetTop + helperRect.height > containmentRect.top + body.scrollTop + containmentRect.height) // bottom boundary
								targetTop = containmentRect.top + body.scrollTop + containmentRect.height - helperRect.height;
							if (targetLeft < containmentRect.left + body.scrollLeft) // left boundary
								targetLeft = containmentRect.left + body.scrollLeft;
							if (targetLeft + helperRect.width > containmentRect.left + body.scrollLeft + containmentRect.width) // right boundary
								targetLeft = containmentRect.left + body.scrollLeft + containmentRect.width - helperRect.width;
						}
						this.style.left = targetLeft - body.scrollLeft + 'px';
						this.style.top = targetTop - body.scrollTop + 'px';
					};

					var pointerOffset = {
						x: (e.clientX - clientRect.left) / clientRect.width,
						y: (e.clientY - clientRect.top) / clientRect.height
					};
					html.addClass('sv-sorting-in-progress');
					html.on('mousemove touchmove', onMousemove).on('mouseup touchend touchcancel', function mouseup(e) {
						html.off('mousemove touchmove', onMousemove);
						html.off('mouseup touchend touchcancel', mouseup);
						html.removeClass('sv-sorting-in-progress');
						if (moveExecuted) {
							$controllers[0].$drop($scope.$index, opts);
						}
						$element.removeClass('sv-visibility-hidden');
					});

					// onMousemove(e);
					function onMousemove(e) {
						touchFix(e);
						if (!moveExecuted) {
							$element.parent().prepend(clone);
							moveExecuted = true;
						}
						$controllers[1].$moveUpdate(opts, {
							x: e.clientX,
							y: e.clientY,
							offset: pointerOffset
						}, clone, $element, placeholder, $controllers[0].getPart(), $scope.$index);
					}
				}
			}
		};
	}]);

	module.directive('svHandle', function () {
		return {
			require: '?^svElement',
			link: function link($scope, $element, $attrs, $ctrl) {
				if ($ctrl) $ctrl.handle = $element.add($ctrl.handle); // support multiple handles
			}
		};
	});

	module.directive('svHelper', function () {
		return {
			require: ['?^svPart', '?^svElement'],
			link: function link($scope, $element, $attrs, $ctrl) {
				$element.addClass('sv-helper').addClass('ng-hide');
				if ($ctrl[1]) $ctrl[1].helper = $element;else if ($ctrl[0]) $ctrl[0].helper = $element;
			}
		};
	});

	module.directive('svPlaceholder', function () {
		return {
			require: ['?^svPart', '?^svElement'],
			link: function link($scope, $element, $attrs, $ctrl) {
				$element.addClass('sv-placeholder').addClass('ng-hide');
				if ($ctrl[1]) $ctrl[1].placeholder = $element;else if ($ctrl[0]) $ctrl[0].placeholder = $element;
			}
		};
	});

	angular.element(document.head).append(['<style>' + '.sv-helper{' + 'position: fixed !important;' + 'z-index: 99999;' + 'margin: 0 !important;' + '}' + '.sv-candidate{' + '}' + '.sv-placeholder{' +
	// 'opacity: 0;' +
	'}' + '.sv-sorting-in-progress{' + '-webkit-user-select: none;' + '-moz-user-select: none;' + '-ms-user-select: none;' + 'user-select: none;' + '}' + '.sv-visibility-hidden{' + 'visibility: hidden !important;' + 'opacity: 0 !important;' + '}' + '</style>'].join(''));

	function touchFix(e) {
		if (!('clientX' in e) && !('clientY' in e)) {
			var touches = e.touches || e.originalEvent.touches;
			if (touches && touches.length) {
				e.clientX = touches[0].clientX;
				e.clientY = touches[0].clientY;
			}
			e.preventDefault();
		}
	}

	function getPreviousSibling(element) {
		element = element[0];
		if (element.previousElementSibling) return angular.element(element.previousElementSibling);else {
			var sib = element.previousSibling;
			while (sib != null && sib.nodeType != 1) {
				sib = sib.previousSibling;
			}return angular.element(sib);
		}
	}

	function insertElementBefore(element, newElement) {
		var prevSibl = getPreviousSibling(element);
		if (prevSibl.length > 0) {
			prevSibl.after(newElement);
		} else {
			element.parent().prepend(newElement);
		}
	}

	var dde = document.documentElement,
	    matchingFunction = dde.matches ? 'matches' : dde.matchesSelector ? 'matchesSelector' : dde.webkitMatches ? 'webkitMatches' : dde.webkitMatchesSelector ? 'webkitMatchesSelector' : dde.msMatches ? 'msMatches' : dde.msMatchesSelector ? 'msMatchesSelector' : dde.mozMatches ? 'mozMatches' : dde.mozMatchesSelector ? 'mozMatchesSelector' : null;
	if (matchingFunction == null) throw 'This browser doesn\'t support the HTMLElement.matches method';

	function elementMatchesSelector(element, selector) {
		if (element instanceof angular.element) element = element[0];
		if (matchingFunction !== null) return element[matchingFunction](selector);
	}

	var closestElement = angular.element.prototype.closest || function (selector) {
		var el = this[0].parentNode;
		while (el !== document.documentElement && !el[matchingFunction](selector)) {
			el = el.parentNode;
		}if (el[matchingFunction](selector)) return angular.element(el);else return angular.element();
	};

	/*
 	Simple implementation of jQuery's .add method
  */
	if (typeof angular.element.prototype.add !== 'function') {
		angular.element.prototype.add = function (elem) {
			var i,
			    res = angular.element();
			elem = angular.element(elem);
			for (i = 0; i < this.length; i++) {
				res.push(this[i]);
			}
			for (i = 0; i < elem.length; i++) {
				res.push(elem[i]);
			}
			return res;
		};
	}
})(window, window.angular);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _uiTabs = __webpack_require__(0);

var _uiTabs2 = _interopRequireDefault(_uiTabs);

var _uiTabs3 = __webpack_require__(4);

var _uiTabs4 = _interopRequireDefault(_uiTabs3);

__webpack_require__(5);

__webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import './ui-tabs-drag';

/**
 * Created by zhang on 2017/6/7.
 */
_uiTabs2.default.directive('uiTabsView', function ($timeout, $controller, $compile, uiTabs) {
    return {
        restrict: 'EAC',
        priority: 400,
        scope: true,
        replace: true,
        template: _uiTabs4.default,
        link: function link(scope, element) {

            scope.tabs = uiTabs.tabs;
            scope.current = uiTabs.current;

            scope.$on('tabOpenStarting', tabOpenStarting);
            scope.$on('tabOpenSuccess', tabOpenSuccess);
            scope.$on('tabOpenError', tabOpenError);
            scope.$on('tabCloseSuccess', tabCloseSuccess);
            scope.$on('tabChangeSuccess', tabChangeSuccess);
            scope.$on('tabRefresh', tabRefresh);
            scope.$on('$destroy', uiTabs.closeAll); // 指令销毁时，清楚所有tab

            // 如果不存在打开的tab，则打开默认的tab
            if (!scope.current) {
                uiTabs.open(null);
            }

            // 关闭tab
            scope.close = function (e, tab) {
                tab.close();
                e.stopPropagation();
            };

            // 切换到tab页
            scope.activeTab = function (tab) {
                uiTabs.active(tab);
            };

            // 右键菜单选中
            scope.menuSelect = function (tab, action) {

                switch (action) {
                    case 'refresh':
                        tab.refresh();
                        break;
                    case 'current':
                        tab.close();
                        break;
                    case 'left':
                        closeLeft(tab);
                        break;
                    case 'right':
                        closeRight(tab);
                        break;
                    case 'other':
                        closeLeft(tab);
                        closeRight(tab);
                        break;
                }
            };

            // 设置可拖动区域
            scope.opts = {
                containment: '.ui-tabs-nav'
            };

            /**
             * 关闭左侧标签
             * @param tab
             */
            function closeLeft(tab) {
                var closeIndex = 0,
                    closeTab;

                while ((closeTab = uiTabs.tabs[closeIndex]) !== tab) {
                    if (!closeTab.close()) {
                        // 关闭失败时，则关闭下一个
                        closeIndex++;
                    }
                }
            }

            /**
             * 关闭右侧标签
             * @param tab
             */
            function closeRight(tab) {
                var closeIndex = uiTabs.tabs.length - 1,
                    closeTab;

                while ((closeTab = uiTabs.tabs[closeIndex]) !== tab) {
                    closeTab.close();
                    closeIndex--;
                }
            }

            /**
             * 当tab打开时，加载动画
             *
             * @param e
             * @param tab
             */
            function tabOpenStarting(e, tab) {
                scope.current = uiTabs.current;
                tab.loading = true;
            }

            /**
             * 当tab成功打开时，建立生成tab页页面内容，并且加载controller
             *
             * @param e
             * @param tab
             * @param preTab
             */
            function tabOpenSuccess(e, tab, preTab) {
                var newScope, link, pageNode, container;

                tab.loading = false; // 取消加载动画

                newScope = tab.$scope = element.parent().scope().$new();
                newScope.$tab = tab;

                link = $compile(tab.locals['$template']);
                pageNode = tab.$node = link(newScope);

                if (tab.controller) {
                    // 实例controller，并且传入uiTabsParams 和 uiTab 参数
                    $controller(tab.controller, angular.extend({
                        $scope: newScope,
                        uiTabsParams: tab.params || {},
                        uiTab: tab
                    }, tab.locals));
                }

                $timeout(function () {
                    container = angular.element(element[0].querySelector('#ui-tabs-' + tab.id));
                    container.append(pageNode);

                    broadcastTabActivated(tab, preTab);
                });
            }

            /**
             * 当tab加载失败，则取消动画
             *
             * @param e
             * @param tab
             */
            function tabOpenError(e, tab) {
                tab.loading = false;
            }

            /**
             * 当tab切换成功，则变更当前的tab页
             */
            function tabChangeSuccess(e, tab, preTab) {
                scope.current = uiTabs.current;

                if (tab.reloadOnActive) {
                    if (tab.$scope) {
                        tab.$scope.$destroy();
                    }
                    if (tab.$node) {
                        tab.$node.remove();
                    }

                    tabOpenSuccess(e, tab, preTab);
                } else {
                    broadcastTabActivated(tab, preTab);
                }
            }

            /**
             * 只对该tab页广播 tabActivated 事件
             * @param tab 被打开的tab
             * @param preTab 前一个tab
             */
            function broadcastTabActivated(tab, preTab) {
                tab.$scope.$broadcast('tabActivated', preTab);
                //
                // $timeout(function () {
                //
                // });
            }

            /**
             * 当tab关闭时，销毁作用域，移除页面内容
             *
             * @param e
             * @param tab
             */
            function tabCloseSuccess(e, tab) {
                tab.$scope.$destroy();
                tab.$node.remove();
            }

            /**
             * 刷新tab页
             *
             * @param e
             * @param tab
             */
            function tabRefresh(e, tab) {
                if (tab.$scope) {
                    tab.$scope.$destroy();
                }
                if (tab.$node) {
                    tab.$node.remove();
                }

                tabOpenSuccess(e, tab);
            }
        }
    };
});

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, "ul.ui-tabs-menu {\n  position: absolute;\n  z-index: 999;\n  left: -999px;\n  margin: 0;\n  padding: 5px 0;\n  list-style: none;\n  background: #f5f5f5;\n  border: 1px solid #999;\n  border-radius: 5px;\n  font-size: 0.8em;\n  cursor: default;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none; }\n  ul.ui-tabs-menu li {\n    padding: 4px 12px; }\n    ul.ui-tabs-menu li:hover {\n      color: #fff;\n      background: #0091ea; }\n", ""]);

// exports


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(undefined);
// imports


// module
exports.push([module.i, ".ui-tabs {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column; }\n  .ui-tabs ul.ui-tabs-nav {\n    -ms-flex-negative: 0;\n        flex-shrink: 0;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    margin: 10px 0 0;\n    padding: 0 10px;\n    list-style: none;\n    border-bottom: 1px solid #999; }\n    .ui-tabs ul.ui-tabs-nav li {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-flex: 1;\n          -ms-flex-positive: 1;\n              flex-grow: 1;\n      margin: 0 -1px -1px -0;\n      max-width: 200px;\n      padding: 3px 5px;\n      border: 1px solid #999;\n      background: #efefef;\n      cursor: default;\n      font-size: 0.8em;\n      -webkit-box-sizing: border-box;\n              box-sizing: border-box; }\n      .ui-tabs ul.ui-tabs-nav li span {\n        margin: 0 6px;\n        -webkit-box-flex: 1;\n            -ms-flex-positive: 1;\n                flex-grow: 1;\n        -ms-flex-negative: 1;\n            flex-shrink: 1;\n        -ms-flex-preferred-size: 20px;\n            flex-basis: 20px;\n        width: 20px;\n        overflow: hidden;\n        -webkit-user-select: none;\n           -moz-user-select: none;\n            -ms-user-select: none;\n                user-select: none;\n        white-space: nowrap; }\n      .ui-tabs ul.ui-tabs-nav li.active {\n        background: #fcfcfc;\n        border-bottom: 1px solid transparent;\n        -webkit-transition: none;\n        transition: none; }\n      .ui-tabs ul.ui-tabs-nav li:hover {\n        background: #fcfcfc;\n        -webkit-transition: background 0.4s;\n        transition: background 0.4s; }\n  .ui-tabs .ui-tabs-container {\n    position: relative;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    overflow: auto; }\n    .ui-tabs .ui-tabs-container > div {\n      overflow: hidden; }\n\n.ui-tabs-close-icon {\n  position: relative;\n  display: inline-block;\n  height: 15px;\n  width: 15px;\n  border-radius: 50%;\n  vertical-align: middle; }\n  .ui-tabs-close-icon:before, .ui-tabs-close-icon:after {\n    content: \"\";\n    position: absolute;\n    top: 7px;\n    left: 2px;\n    width: 11px;\n    height: 1px;\n    border-radius: 1px;\n    background: #777; }\n  .ui-tabs-close-icon:before {\n    -webkit-transform: rotate(45deg);\n            transform: rotate(45deg); }\n  .ui-tabs-close-icon:after {\n    -webkit-transform: rotate(-45deg);\n            transform: rotate(-45deg); }\n  .ui-tabs-close-icon:hover {\n    background: red; }\n  .ui-tabs-close-icon:hover:after, .ui-tabs-close-icon:hover:before {\n    background: #fff; }\n\n.ui-tabs-loading-icon {\n  display: inline-block;\n  height: 15px;\n  width: 15px;\n  border: 3px solid #5677fc;\n  border-right: 3px solid transparent;\n  border-radius: 50%;\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  vertical-align: middle;\n  -webkit-animation: rotate-animate 1.5s infinite;\n          animation: rotate-animate 1.5s infinite; }\n\n@-webkit-keyframes rotate-animate {\n  from {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  to {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n\n@keyframes rotate-animate {\n  from {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg); }\n  to {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg); } }\n", ""]);

// exports


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = "<ul class=\"ui-tabs-menu\">\n  <li data-action=\"refresh\">重新加载</li>\n  <li data-action=\"current\">关闭标签页</li>\n  <li data-action=\"other\">关闭其它标签页</li>\n  <li data-action=\"left\">关闭左侧标签页</li>\n  <li data-action=\"right\">关闭右侧标签页</li>\n</ul>";

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(2)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js??ref--1-1!../../node_modules/postcss-loader/lib/index.js!../../node_modules/sass-loader/lib/loader.js!./ui-tabs-menu.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js??ref--1-1!../../node_modules/postcss-loader/lib/index.js!../../node_modules/sass-loader/lib/loader.js!./ui-tabs-menu.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 12 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ })
/******/ ]);