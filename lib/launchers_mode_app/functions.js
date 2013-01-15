var purefun = require('purefun')
var chars = require('../chars')
var StyledString = require('styled_string')
var log = require('winston')

with(purefun){
    
    {
        // App logic
        var numBrowsers = function(app){
            return sum(map(function(section){ return section.launchers.length }, app.launchers))
        }
        var selectNext = function(app){
            if (app.selection + 1 < numBrowsers(app)){
                return merge(app, {selection: app.selection + 1})
            }else{
                return app
            }
        }
        var selectPrevious = function(app){
            if (app.selection - 1 >= 0){
                return merge(app, {selection: app.selection - 1})
            }else{
                return app
            }
        }
        var uniqueAdd = function(arr, item){
            if (member(arr, item)) return arr
            else return concat(arr, [item])
        }
        var checkCurrent = function(app){
            var checked = member(app.checked, app.selection) ?
                without(app.checked, app.selection) :
                uniqueAdd(app.checked, app.selection)
            return merge(app, {checked: checked})
        }
        var chr = function(buf){
            return String(buf).charAt(0)
        }
        var i = function(buf){ return chr(buf).charCodeAt(0) }
        var key = function(buf){
            return (buf[0] === 27 && buf[1] === 91) ? buf[2] : null
        }
        var isRightArrow = compose(key, curry(eq, 67))
        var isLeftArrow = compose(key, curry(eq, 68))
        var isDownArrow = compose(key, curry(eq, 66))
        var isUpArrow = compose(key, curry(eq, 65))
        var isEnter = exports.isEnter = compose(i, curry(eq, 13))

        var step = exports.step = function(app, input){
            if (isDownArrow(input)) return selectNext(app)
            if (isUpArrow(input)) return selectPrevious(app)
            if (isEnter(input)) return checkCurrent(app)
        }
    }

    {
        // Rendering
        var displayBrowser = exports.displayBrowser = function(browser){
            if (browser.device){
                return browser.browser + ' (' + browser.os + ' ' + browser.os_version + ') ' + browser.device
            }else{
                return browser.browser + ' ' + browser.browser_version + ' (' + browser.os + ' ' + browser.os_version + ')'
            }
        }
        var renderLauncher = function(launcher, selected, checked){
            var style = selected ? {display: 'reverse'} : null
            return StyledString('    [' + 
                (checked ? chars.check : ' ') + '] ' + 
                displayBrowser(launcher),
                style)
        }
        var renderLauncherSectionBody = function(section, app, listOffsetIdx){
            return foldr(function(lines, launcher, i){
                var globalIdx = i + listOffsetIdx
                var selected = globalIdx === app.selection
                var checked = member(app.checked, globalIdx)
                return concat(lines, [renderLauncher(launcher, selected, checked)])
            }, [], section.launchers)
        }
        var renderLauncherSection = function(section, app, listOffsetIdx){
            var header = [
                section.section,
                Array(section.section.length + 1).join('-')]
            var body = renderLauncherSectionBody(section, app, listOffsetIdx)
            return concat(header, body)
        }
        var renderBody = function(app){
            var data = foldr(function(data, section){
                var lines = renderLauncherSection(section, app, data.listOffsetIdx)
                return {
                    listOffsetIdx: data.listOffsetIdx + section.launchers.length,
                    lines: concat(data.lines, lines)
                }
            }, {listOffsetIdx: 0, lines: []}, app.launchers)
            return data.lines
        }
        var render = exports.render = function(app){
            var header = [
                "Test'em Launcher Selection", 
                "=========================="]
            var body = renderBody(app)
            return concat(header, body)
        }
    }
}