var fs = require('fs')
var request = require('request')
var purefun = require('purefun')

with(purefun){
    var isMobile = function(browser){
        return !!browser.device
    }
    var isDesktop = compose(isMobile, not)
    var browsersUnderOs = function(byOsVersion){
        return foldr(function(all, browsers, os_version){
            return concat(all, apply(concat, map(function(browser){
                if (browser.devices){
                    return map(function(device){
                        return merge(
                            {device: device, os_version: os_version}, 
                            {browser: browser.browser, browser_version: browser.browser_version})
                    }, browser.devices)
                }else{
                    return [merge({os_version: os_version}, 
                        {browser: browser.browser, browser_version: browser.browser_version})]
                }
            }, browsers)))
        }, [], byOsVersion)
    }
    var compareBrowser = function(one, other){
        var b1 = one.browser.toLowerCase()
        var b2 = other.browser.toLowerCase()
        if (b1 > b2) return 1
        else if (b1 === b2) {
            var os1 = one.os.toLowerCase()
            var os2 = other.os.toLowerCase()
            if (os1 > os2) return 1
            else if (os1 === os2){
                var osv1 = one.os_version.toLowerCase()
                var osv2 = other.os_version.toLowerCase()
                if (osv1 > osv2) return 1
                else if (osv1 === osv2){
                    var v1 = one.browser_version
                    var v2 = other.browser_version
                    if (v1 > v2) return 1
                    else if (v1 === v2) return 0
                    else return -1
                }else return -1
            }else return -1
        }
        else return -1
    }
    var allBrowsers = function(menu){
        return foldr(function(all, byOsVersion, os){
            return concat(all, map(function(browser){
                return merge({os: os}, browser)
            }, browsersUnderOs(byOsVersion, os)))
        }, [], menu)
    }
    var mobileBrowsers = function(browsers){
        return sortBy(compareBrowser, filter(isMobile, browsers))
    }
    var desktopBrowsers = function(browsers){
        return sortBy(compareBrowser, filter(isDesktop, browsers))
    }
}

module.exports = function(config){

    var bs = {}

    bs.config = config

    bs.getBrowsers = function getBrowsers(callback){
        var cacheFileName = 'browserstack.browsers.json'
        fs.stat(cacheFileName, function(err, stat){
            if (err) fetchFromRemote()
            else readFromFs()
        })
        function fetchFromRemote(){
            var url = 'http://api.browserstack.com/3/browsers'
            var username = config.username
            var password = config.password
            var authHeader = "Basic " + new Buffer(username + ":" + password).toString( "base64" )
            var options = {
                headers: { authorization: authHeader }
            }
            request(url, options, function(err, resp, body){
                if (err) return callback(err, null)
                var data = JSON.parse(body)
                callback(null, formatBrowsers(data))
                writeToFs(JSON.stringify(data, null, '  '))
            })
        }
        function readFromFs(){
            fs.readFile(cacheFileName, function(err, body){
                if (err) return callback(err, null)
                var data = JSON.parse('' + body)
                callback(null, formatBrowsers(data))
            })
        }
        function writeToFs(str){
            fs.writeFile(cacheFileName, str)
        }
        function formatBrowsers(data){
            var browsers = allBrowsers(data)
            var mobile = mobileBrowsers(browsers)
            var desktop = desktopBrowsers(browsers)
            return {
                mobile: mobile
                , desktop: desktop
            }
        }
    }

    return bs

}

