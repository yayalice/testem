var expect = require('chai').expect
var functions = require('../../lib/launchers_mode_app/functions')
var chars = require('../../lib/chars')
var _ = require('underscore')

describe('launchers_mode_app_functions', function(){

    describe('functions.step', function(){

        it('starts out with selection at 1st launcher', function(){
            var app = appWithTwoLaunchers()
            expect(app.view.selection).to.equal(3)
        })
        
        it('selects next launcher', function(){
            var app = appWithTwoLaunchers()
            expect(functions.step(app, downArrow).view.selection).to.equal(4)
        })
        
        it('stops if try to "next" at the bottom', function(){
            var app = appWithTwoLaunchers({selection: 3})
            expect(functions.step(app, downArrow).view.selection).to.equal(4)
        })
        
        it('selects previous launcher', function(){
            var app = appWithTwoLaunchers({selection: 4})
            expect(functions.step(app, upArrow).view.selection).to.equal(3)
        })
        
        it('stops if try to "previous" at the top', function(){
            var app = appWithTwoLaunchers()
            expect(functions.step(app, upArrow).view.selection).to.equal(3)
        })

        
        it('adds to the checked array if ENTER hit', function(){
            var app = appWithTwoLaunchers()
            expect(functions.step(app, ENTER).ci).to.deep.equal([3])
        })
        
        it('vertically centers your selection if you go beyond the bottom', function(){
            var windowSize = {lines: 4, columns: 80}
            var app = appWithTwoLauncherSections({windowSize: windowSize})
            app = functions.step(app, downArrow)
            expect(app.view.scrollOffset).to.equal(2)
        })
        
    })
    
    describe('render', function(){

        it('renders app with one section of launchers', function(){
            var app = appWithTwoLaunchers()
            expect(unstyledAndTrimmed(functions.render(app, windowSize))).to.deep.equal([
                "TEST'EM LAUNCHER SELECTION",
                "Section one:",
                "  Dev CI",
                "  [ ] [ ] Chrome",
                "  [ ] [ ] Firefox",
                "[ENTER to toggle ci; SPACE to toggle dev; q to quit; s to save and quit]"
            ])
        })
        
        
        it('renders app with two sections of launchers', function(){
            var app = appWithTwoLauncherSections({selection: 2})
            expect(unstyledAndTrimmed(functions.render(app, windowSize))).to.deep.equal([
                "TEST'EM LAUNCHER SELECTION",
                "Section one:",
                "  Dev CI",
                "  [ ] [ ] Chrome",
                "  [ ] [ ] Firefox",
                "Section two:",
                "  Dev CI",
                "  [ ] [ ] Safari",
                "[ENTER to toggle ci; SPACE to toggle dev; q to quit; s to save and quit]"
            ])
        })
        
        it('renders to the size of the window', function(){
            var windowSize = {lines: 4, columns: 80}
            var app = appWithTwoLauncherSections({windowSize: windowSize})
            expect(functions.render(app).length).to.equal(4)
        })
        
        it('scrolls', function(){
            var app = appWithTwoLauncherSections({scrollOffset: 1})
            expect(unstyledAndTrimmed(functions.render(app))).to.deep.equal([
                "Section one:",
                "  Dev CI",
                "  [ ] [ ] Chrome",
                "  [ ] [ ] Firefox",
                "Section two:",
                "  Dev CI",
                "  [ ] [ ] Safari",
                "[ENTER to toggle ci; SPACE to toggle dev; q to quit; s to save and quit]"
            ])
        })
        
        it('pads empty lines', function(){
            var app = appWithTwoLaunchers()
            var lines = functions.render(app, windowSize)
            expect(lines.length).to.equal(windowSize.lines)
        })

    })

    it('should change window size', function(){
        var app = appWithTwoLaunchers()
        var newSize = {lines: 5, columns: 23}
        var newApp = functions.changeWindowSize(app, newSize)
        expect(newApp.view.windowSize).to.deep.equal(newSize)
        expect(newApp.view.selection).to.equal(app.view.selection)
        expect(newApp.view.scrollOffset).to.equal(app.view.scrollOffset)
    })

})




{
    // factory functions, helper functions and global variables to ease setup
    var downArrow = [27, 91, 66]
    var upArrow = [27, 91, 65]
    var ENTER = '\r'
    var windowSize = {lines: 10, columns: 80}

    function browser(name){
        return {displayName: function(){ return name }}
    }

    function appWithTwoLaunchers(viewProps){
        var launchers = [
            {
                section: 'Section one'
                , launchers: [
                    browser('Chrome'),
                    browser('Firefox')
                ]
            }
        ]
        var app = functions.newApp(launchers, windowSize)
        _.extend(app.view, viewProps)
        return app
    }

    function appWithTwoLauncherSections(viewProps){
        var launchers = [
            {
                section: 'Section one'
                , launchers: [
                    browser('Chrome'),
                    browser('Firefox')
                ]
            },
            {
                section: 'Section two'
                , launchers: [
                    browser('Safari')
                ]
            }
        ]
        var app = functions.newApp(launchers, windowSize)
        _.extend(app.view, viewProps)
        return app
    }

    var StyledString = require('styled_string')
    function unstyledAndTrimmed(lines){
        return lines.map(function(line){
            return (line instanceof StyledString ? line.unstyled() : line).replace(/ +$/, '')
        }).filter(function(line){
            return !!line
        })
    }
}