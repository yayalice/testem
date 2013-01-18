var purefun = require('purefun')
var strutils = require('../strutils')
var chars = require('../chars')
var StyledString = require('styled_string')
var log = require('winston')

with(purefun){
    
    {
        // App logic
        var newApp = exports.newApp = function(launchers, windowSize){
            return {
                view: newView(launchers, windowSize)
                , ci: []
                , dev: []
                , launchers: launchers
            }
        }
        var numBrowsers = function(app){
            return sum(map(function(section){ return section.launchers.length }, app.launchers))
        }
        var isLauncher = function(line){ return !!line.launcher }
        var viewSelectNext = function(view){
            var selection = indexOfFrom(view.selection + 1, isLauncher, view.lines)
            if (selection === null || selection === view.selection) return view
            else{
                var halfOfWindowLines = Math.floor(view.windowSize.lines / 2)
                var scrollOffset = selection - view.scrollOffset >= view.windowSize.lines - 1 ?
                    selection - halfOfWindowLines : view.scrollOffset
                return merge(view, {selection: selection, scrollOffset: scrollOffset})
            }
        }
        var selectNext = function(app){
            return merge(app, {view: viewSelectNext(app.view)})
        }
        var viewSelectPrevious = function(view){
            var selection = lastIndexOfFrom(view.selection - 1, isLauncher, view.lines)
            if (selection === null){
                return merge(view, {
                    scrollOffset: 0
                })
            }
            if (selection === view.selection) return view
            else{
                var halfOfWindowLines = Math.floor(view.windowSize.lines / 2)
                var scrollOffset = selection < view.scrollOffset ?
                    Math.max(0, selection - halfOfWindowLines) : view.scrollOffset
                return merge(view, {selection: selection, scrollOffset: scrollOffset})
            }
        }
        var selectPrevious = function(app){
            return merge(app, {view: viewSelectPrevious(app.view)})
        }
        var uniqueAdd = function(arr, item){
            if (member(arr, item)) return arr
            else return concat(arr, [item])
        }
        var toggleCI = function(app){
            var selection = app.view.selection
            var ci = member(app.ci, selection) ?
                without(app.ci, selection) :
                uniqueAdd(app.ci, selection)
            return merge(app, {ci: ci})
        }
        var toggleDev = function(app){
            var selection = app.view.selection
            var dev = member(app.dev, selection) ?
                without(app.dev, selection) :
                uniqueAdd(app.dev, selection)
            return merge(app, {dev: dev})
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
        var isEnter = compose(i, curry(eq, 13))
        var isSpace = compose(chr, curry(eq, ' '))

        var step = exports.step = function(app, input){
            if (isDownArrow(input)) return selectNext(app)
            if (isUpArrow(input)) return selectPrevious(app)
            if (isEnter(input)) return toggleCI(app)
            if (isSpace(input)) return toggleDev(app)
            return app
        }
    }

    {
        // View Logic
        var newView = exports.newView = function(launchers, windowSize){
            var lns = lines(launchers)
            var firstLauncherIdx = indexOf(function(l){ return !!l.launcher }, lns)
            return {
                scrollOffset: 0
                , selection: firstLauncherIdx
                , lines: lns
                , windowSize: windowSize
            }
        }
        var changeWindowSize = exports.changeWindowSize = function(app, windowSize){
            var view = app.view
            return merge(app, {
                view: merge(newView(app.launchers, windowSize), {
                    scrollOffset: view.scrollOffset
                    , selection: view.selection
                })
            })
        }
        var launcherLine = function(launcher, selected, checked){
            return { launcher: launcher }
        }
        var launcherSectionLines = function(section){
            var header = [
                {text: section.section + ':'},
                {text: StyledString("  Dev CI").foreground('cyan')}]
            var body = map(launcherLine, section.launchers)
            return concat(header, body)
        }
        var bodyLines = function(launchers){
            return apply(concat, map(launcherSectionLines, launchers))
        }
        var lines = function(launchers){
            var header = [
                {text: "TEST'EM LAUNCHER SELECTION"}]
            var body = bodyLines(launchers)
            return concat(header, body)
        }
        var renderLauncherLine = function(app, line, i){
            var idx = app.view.scrollOffset + i
            var ci = member(app.ci, idx)
            var dev = member(app.dev, idx)
            var selected = idx === app.view.selection
            var style = selected ? {display: 'reverse', foreground: 'cyan'} : {foreground: 'cyan'}
            var display = line.launcher.displayName()
            var columns = app.view.windowSize.columns
            var check = chars.check
            return StyledString(strutils.pad('  [' + (dev ? check : ' ') + ']' +
                ' [' + (ci ? check : ' ') + '] ' + 
                display, columns, ' ', 1), style)
        }
        var renderLine = function(app, line, i){
            return line.text ? 
                line.text : 
                renderLauncherLine(app, line, i)
        }
        var padLines = function(numLines, lines){
            if (numLines === lines.length) return lines
            return concat(lines, Array(numLines - lines.length).join(' ').split(' '))
        }
        var render = exports.render = function(app){
            var view = app.view
            var windowed = slice(view.scrollOffset, view.scrollOffset + view.windowSize.lines - 1, view.lines)
            var lines = padLines(view.windowSize.lines - 1, map(curry(renderLine, app), windowed))
            return concat(lines, ['[ENTER to toggle ci; SPACE to toggle dev; q to quit; s to save and quit]'])
        }
    }

}