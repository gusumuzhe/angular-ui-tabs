# angular ui-tabs
实现类似于浏览器的tab页功能

## Demo
Click [here](http://plnkr.co/edit/6nctNU?p=preview)

## 安装
引入库文件

```html
	<script src="ui-tabs.js">
```

添加模块依赖

```javascript
	angular.module('myModule', ['ui.tabs'])
```

## uiTabsProvider - provider
配置tab页

### tab(name, option)
该方法设置配置所有的tab页

#### Parameters
1. name `string` tab的名称
2. option `object` tab的配置
  - title `string` tab的标题名称
  - controller  `string` controller名称
  - template `string` 模版
  - templateUrl `string` 模版地址，template和templateUrl选一
  - resolve `object` 传递的参数，通过注入的方式传入controller
  - reloadOnActive `boolean` 在切换到该tab时，是否重新加载 默认 false
  - reopen `boolean` 是否允许重复打开相同的tab， 默认 true
  - params `any` 默认传递的参数，当tab页的controller加载时，通过uiTabsParams注入

#### returns
`object` uiTabsProvider

#### examples
```javascript
app.config(function (uiTabsProvider) {
    uiTabsProvider
        .tab('tab1', {
            title: 'tab1',
            controller: 'DemoController1',
            templateUrl: 'demo1.html',
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
            templateUrl: 'demo2.html',
            resolve: {
                deps: ['$ocLazyLoad',
                    function ($ocLazyLoad) {
                        return $ocLazyLoad.load([
                            'controller2.js']);
                    }]
            },
            params: {tab:2}
        });
})
```

### otherwise(name)
指令加载时，如果该项设置，会默认打开一个tab页

#### Parameters
1. name `string` tab的名称

#### examples
```javascript
app.config(function (uiTabsProvider) {
    uiTabsProvider.otherwise('tab1');
})
```

### setOptions(options)
设置全局的默认配置项

#### Parameters
1. options
  - reloadOnActive `boolean` 切换到该tab页时，是否重新加载该tab，默认 false
  - reopen `boolean` 相同name的tab是否允许重复打开，默认 true

#### examples
```javascript
app.config(function (uiTabsProvider) {
    uiTabsProvider. setOptions({
    	reloadOnActive: false,
    	reopen: false
    });
})
```

### setMaxTabs(maxTabs)
设置允许打开的最大tab数量，默认 20

#### Parameters
1. maxTabs `int` 最大数量

#### examples
```javascript
app.config(function (uiTabsProvider) {
    uiTabsProvider. setMaxTabs(10);
})
```

## uiTabs - service
该服务用于打开，关闭，刷新，激活tab页

### open(name, params)
用于打开一个tab页，所打开的controller中，可以注入`uiTabsParams` `uiTab`两个参数，`uiTabsParams`表示打开时，传入的参数，`uiTab`表示目前打开的tab页

##### Parameters
1. name `string` tab的名称，与通过 `uiTabsProvider.tab` 中的配置相匹配 
2. params `any` 打开tab时，传入的参数 
  - name tab页名称
  - controller controller名称
  - template 模版
  - templateUrl 模版地址，template和templateUrl选一
  - params 传递的参数，当tab页的controller加载时，通过uiTabsParams注入

#### returns
`Promise` 打开tab页时，返回 promise

#### events
1. tabOpenStart
  
  当tab刚被打开时，此时触发`tabOpenStart`事件，此时可以通过`preventDefault`方法阻止tab的打开
  
2. tabOpenStarting

  当开始加载tab页内容时，此时触发`tabOpenStarting`事件，此时已经无法阻止tab的打开

3. tabOpenSuccess

  当tab页打开成功时，触发`tabOpenSuccess`事件
  
4. tabOpenError
  
  当tab页加载templateUrl时，或者用户在`tabOpenStart`时，通过`preventDefault`阻止tab打开时，触发`tabOpenError`事件
 
#### examples 
```javascript
app.controller('MyController', function($scope, uiTabs){

	$scope.$on('tabOpenSuccess', function(event, tab, lastTab){
		console.log(tab.name);
	});
	
	uiTabs.open('tab1', {
		transfer: 'transfer'
	});
});

app.controller('TabController', function($scope, uiTabsParams, uiTab){

	console.log(uiTabsParams.transfer);
	console.log(uiTab.name);
	
})
```

### close(tab)
用于关闭一个tab页

#### Parameters
1. tab `Object|string` tab页实例，或者该tab页的id

#### returns
`boolean` 是否关闭成功

#### events
1. tabCloseStart

  当tab开始关闭时，触发`tabCloseStart`, 并且可以通过`preventDefault`方法阻止tab页的关闭

2. tabCloseSuccess

  当tab关闭成功时，触发`tabCloseSuccess`

3. tabCloseError

  当通过`preventDefault`阻止tab关闭时，触发`tabCloseError`事件
  
#### examples
```javascript
app.controller('MyController', function($scope, uiTabs){
  uiTabs.close('tab1');
})
```

### closeAll()
用于关闭所有tab页，并且每一个的tab页的关闭，都会触发`tabCloseStart` `tabCloseSuccess `或者`tabCloseError`事件，且无法阻止tab页的关闭

#### examples
```javascript
app.controller('MyController', function($scope, uiTabs){
  uiTabs.closeAll();
})
```

### active(tab)
用于切换当前tab页

#### Parameters
1. tab `Object|string` tab页实例，或者该tab页的id

#### returns
`boolean` 切换是否成功

#### events
1. tabChangeStart

  当切换当前tab页时，触发`tabChangeStart`, 并且可以通过`preventDefault`方法阻止tab页的切换

2. tabChangeSuccess

  当当前tab页切换成功时，触发`tabChangeSuccess`

3. tabChangeError

  当通过`preventDefault`阻止tab切换时，触发`tabChangeError`事件
  
#### examples
```javascript
app.controller('MyController', function($scope, uiTabs){
  uiTabs.active('tab1');
})
```

### refresh(tab)
刷新tab页

#### Parameters
1. tab `Object|string` tab页实例，或者该tab页的id

#### events
1. tabRefresh

  当刷新tab页时，触发`tabRefresh`, 无法阻止刷新
  
#### examples
```javascript
app.controller('MyController', function($scope, uiTabs){
  uiTabs.refresh('tab1');
})
```

## uiTabsView - directive
tab页放置的容器，当通过页面操作造成的刷新，关闭，当前页的切换都会触发相应的事件

#### examples
```html
<ui-tabs-view></ui-tabs-view>
```




