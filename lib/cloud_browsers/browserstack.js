var fs = require('fs')
var request = require('request')
var purefun = require('purefun')
var log = require('winston')

function compareBy(){
    var props = arguments
    var numProps = arguments.length
    return function(one, other){
        for (var i = 0; i < numProps; i++){
            var asc = true
            var prop = props[i]
            if (typeof prop === 'string'){
                try{
                    if (prop.charAt(0) === '^') prop = prop.substring(1)
                    if (prop.charAt(0) === '_'){
                        asc = false
                        prop = prop.substring(1)
                    }
                    var oneProp = one[prop]
                    var otherProp = other[prop]
                    if (oneProp > otherProp) return asc ? 1 : -1
                    else if (oneProp < otherProp) return asc ? -1 : 1
                }catch(e){
                    log.info(e.message)
                    log.info(e.stack)
                }
            }else if (typeof prop === 'function'){
                var val = prop(one, other)
                if (val !== 0) return val
            }
        }
        return 0
    }
}

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
    var compareOsVersion = function(one, other){
        function byOrder(order){
            var i1 = order.indexOf(one.os_version)
            var i2 = order.indexOf(other.os_version)
            return i1 - i2
        }
        if (one.os === 'Windows'){
            return byOrder(['8', '7', 'XP'])
        }else if (one.os === 'OS X'){
            return byOrder(['Mountain Lion', 'Lion', 'Snow Leopard'])
        }else{
            return compareBy('_os_version')(one, other)
        }
    }
    var compareBrowser = compareBy('^browser', '_browser_version', '^os', compareOsVersion, '^device')
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


/*
describe('compareBy', function(){

    it('sorts one prop', function(){
        var browsers = [
            {name: 'Firefox'},
            {name: 'Chrome'}
        ]
        expect(browsers.sort(compareBy('name'))).to.deep.equal([
            {name: 'Chrome'},
            {name: 'Firefox'}
        ])
    })

    it('sorts ascending (also is default)', function(){
        var browsers = [
            {name: 'Firefox'},
            {name: 'Chrome'}
        ]
        expect(browsers.sort(compareBy('^name'))).to.deep.equal([
            {name: 'Chrome'},
            {name: 'Firefox'}
        ])
    })

    it('sorts descending (also is default)', function(){
        var browsers = [
            {name: 'Chrome'},
            {name: 'Firefox'}
        ]
        expect(browsers.sort(compareBy('_name'))).to.deep.equal([
            {name: 'Firefox'},
            {name: 'Chrome'}
        ])
    })

    it('sorts two props', function(){
        var browsers = [
            {name: 'Firefox', version: 15},
            {name: 'Chrome', version: 20},
            {name: 'Chrome', version: 14}
        ]
        expect(browsers.sort(compareBy('^name', '_version'))).to.deep.equal([
            {name: 'Chrome', version: 20},
            {name: 'Chrome', version: 14},
            {name: 'Firefox', version: 15}
        ])
    })

    it('can also accept functions in the chain', function(){
        var oses = [
            {name: 'Windows', version: '8'},
            {name: 'Windows', version: 'XP'},
            {name: 'Windows', version: '7'},
            {name: 'OS X', version: '10.7.5'},
            {name: 'OS X', version: '10.6.0'}
        ]
        function compareVersion(one, other){
            if (one.name === 'OS X'){
                // for OS X, just normal descending compare
                return compareBy('_version')(one, other)
            }else{
                // for Windows, use custom ordering
                var order = ['8', '7', 'XP']
                var oneIdx = order.indexOf(one.version)
                var otherIdx = order.indexOf(other.version)
                return oneIdx - otherIdx
            }
        }
        oses.sort(compareBy('^name', compareVersion))
        expect(oses).to.deep.equal([
            {name: 'OS X', version: '10.7.5'},
            {name: 'OS X', version: '10.6.0'},
            {name: 'Windows', version: '8'},
            {name: 'Windows', version: '7'},
            {name: 'Windows', version: 'XP'},
        ])

    })

})

*/

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
                //log.info(JSON.stringify(data, null, '  '))
                callback(null, formatBrowsers(data))
            })
        }
        function writeToFs(str){
            fs.writeFile(cacheFileName, str)
        }
        function formatBrowsers(data){
            var browsers = allBrowsers(data)
            browsers.forEach(addDisplayNameMethod)
            var mobile = mobileBrowsers(browsers)
            var desktop = desktopBrowsers(browsers)
            return {
                mobile: mobile
                , desktop: desktop
            }
        }
        function addDisplayNameMethod(browser){
            browser.displayName = function(){
                var browser = this
                if (browser.device){
                    return browser.browser + ' (' + browser.os + ' ' + browser.os_version + ') ' + browser.device
                }else{
                    return browser.browser + ' ' + browser.browser_version + ' (' + browser.os + ' ' + browser.os_version + ')'
                }
            }
        }
    }

    return bs

}

