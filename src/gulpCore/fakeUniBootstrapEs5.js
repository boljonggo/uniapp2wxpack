// 静态方法，会被通过toString转换成字符串，直接es5
function fakeUniBootstrap (vueInit, packPath , appMode, platform) {
    if(!globalObject.__uniapp2wxpack) {
        globalObject.__uniapp2wxpack = {
            platform: platform
        }
    }

    if (!globalObject.onAppHide || !globalObject.onAppShow) {
        appMode = 'none'
        console.warn('uniapp2wxpack warn: ide不支持appMode设为relegation和top，所以转为none')
    }

    if (appMode === 'relegation' && !globalObject.onAppRoute) {
        appMode = 'top'
        console.warn('uniapp2wxpack warn: ide不支持appMode设为relegation，但是支持top，所以转为top')
    }

    var packObject = globalObject.__uniapp2wxpack[packPath.replace('/', '')] = {
        '__packInit': {}
    };
    if (vueInit) {
        for (var initProp in vueInit) {
            if (typeof vueInit[initProp] === 'function') {
                (function(initProp) {
                    packObject.__packInit[initProp] = function () {
                        return vueInit[initProp].apply(vueInit, arguments);
                    }
                }) (initProp);
                continue;
            }
            packObject.__packInit[initProp] = vueInit[initProp];
        }
    } else {
        vueInit = {}
    }

    if (appMode === 'none') {
        return
    }
    var oldPage = Page, oldComponent = Component;
    var lastPath='', first = 1, topFirst = 1;
    if (typeof vueInit.onError === 'function' && globalObject.onError) {
        globalObject.onError(function () {
            return vueInit.onError.apply(vueInit, arguments)
        });
    }
    if (typeof vueInit.onPageNotFound === 'function' && globalObject.onPageNotFound) {
        globalObject.onPageNotFound (function () {
            return vueInit.onPageNotFound.apply(vueInit, arguments)
        })
    }
    if (typeof vueInit.onUnhandledRejection === 'function' && globalObject.onUnhandledRejection){
        globalObject.onUnhandledRejection(function () {
            return vueInit.onUnhandledRejection.apply(vueInit, arguments)
        })
    }

    globalObject.onAppRoute && globalObject.onAppRoute(function (options) {
        if (appMode !== 'top') {
            if(('/' + options.path).indexOf(packPath + '/') !== 0){
                first = 1;
                vueInit.onHide.call(vueInit, globalObject.getLaunchOptionsSync())
            }
        }
        lastPath = options.path;
    })
    globalObject.onAppHide(function (option) {
        if (appMode === 'top') {
            if (!globalObject.getLaunchOptionsSync) {
                return vueInit.onHide.call(vueInit, option)
            }
            return vueInit.onHide.call(vueInit, globalObject.getLaunchOptionsSync())
        } else {
            var pages = getCurrentPages()
            var route = pages[pages.length-1].route == null ? pages[pages.length-1].__route__ : pages[pages.length-1].route
            if (('/' + route).indexOf(packPath+'/') === 0) {
                first = 1;
                lastPath = ''
                return vueInit.onHide.call(vueInit, globalObject.getLaunchOptionsSync())
            }
        }
    })

    globalObject.onAppShow(function (option) {
        if (appMode === 'top' && typeof vueInit.onShow === 'function') {
            if (!globalObject.getLaunchOptionsSync) {
                return vueInit.onShow.call(vueInit, option);
            }
            return vueInit.onShow.call(vueInit, globalObject.getLaunchOptionsSync());
        }
        if (topFirst) {
            if (getApp()) {
                if (!getApp().globalData) {
                    getApp().globalData = {}
                }
                Object.assign(getApp().globalData,vueInit.globalData || {})
            }
        }
        topFirst = 0;
    })

    if (appMode==='top' && topFirst && typeof vueInit.onLaunch === 'function') {
        if (globalObject.getLaunchOptionsSync) {
            vueInit.onLaunch.call(vueInit, globalObject.getLaunchOptionsSync());
        }
    }

    function intercept (params) {
        if (appMode === 'top') return
        var onShow = params.onShow;
        if (typeof vueInit.onShow === 'function' || typeof vueInit.onLaunch === 'function') {
            params.onShow = function(){
                var pages = getCurrentPages()
                var route = pages[pages.length-1].route == null ? pages[pages.length-1].__route__ : pages[pages.length-1].route
                if ((!lastPath || ('/' + lastPath).indexOf(packPath + '/') !== 0) && ('/' + route).indexOf(packPath + '/') === 0) {
                    if (first) {
                        first = 0;
                        vueInit.onLaunch.call(vueInit, globalObject.getLaunchOptionsSync());
                    }
                    vueInit.onShow.call(vueInit, globalObject.getLaunchOptionsSync());
                }

                if (typeof onShow === 'function') {
                    return onShow.apply(this,arguments);
                }
            }
        }
    }
    Page = function (params) {
        intercept(params);
        return oldPage.call(this, params);
    }

    Component = function (params) {
        intercept(params.methods || {});
        return oldComponent.call(this, params);
    }
}
module.exports = {
    fakeUniBootstrap,
    fakeUniBootstrapName: 'fakeUniBootstrap'
}
