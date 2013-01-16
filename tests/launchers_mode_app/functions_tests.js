var expect = require('chai').expect
var functions = require('../../lib/launchers_mode_app/functions')
var chars = require('../../lib/chars')
var _ = require('underscore')

describe('launchers_mode_app_functions', function(){

    describe('functions.step', function(){

        it('starts out with selection at 1st launcher', function(){
            var app = appWithTwoLaunchers()
            expect(app.view.selection).to.equal(4)
        })

        it('selects next launcher', function(){
            var app = appWithTwoLaunchers()
            expect(functions.step(app, downArrow).view.selection).to.equal(5)
        })
        
        it('stops if try to "next" at the bottom', function(){
            var app = appWithTwoLaunchers({selection: 5})
            expect(functions.step(app, downArrow).view.selection).to.equal(5)
        })
        
        it('selects previous launcher', function(){
            var app = appWithTwoLaunchers({selection: 5})
            expect(functions.step(app, upArrow).view.selection).to.equal(4)
        })
        
        it('stops if try to "previous" at the top', function(){
            var app = appWithTwoLaunchers()
            expect(functions.step(app, upArrow).view.selection).to.equal(4)
        })

        
        it('adds to the checked array if ENTER hit', function(){
            var app = appWithTwoLaunchers()
            expect(functions.step(app, '\r').checked).to.deep.equal([4])
        })
        
        it('vertically centers your selection if you go beyond the bottom', function(){
            var windowSize = {lines: 4, columns: 80}
            var app = appWithTwoLauncherSections({windowSize: windowSize})
            app = functions.step(app, downArrow)
            expect(app.view.scrollOffset).to.equal(3)
        })

    })

    describe('render', function(){

        it('renders app with one section of launchers', function(){
            var app = appWithTwoLaunchers()
            expect(unstyledAndTrimmed(functions.render(app, windowSize))).to.deep.equal([
                "Test'em Launcher Selection",
                "==========================",
                "Section one",
                "-----------",
                "    [ ] Chrome 22 (Windows 8)",
                "    [ ] Firefox 16 (Windows 8)"
            ])
        })
        
        it('renders app with two sections of launchers', function(){
            var app = appWithTwoLauncherSections({selection: 2})
            expect(unstyledAndTrimmed(functions.render(app, windowSize))).to.deep.equal([
                "Test'em Launcher Selection",
                "==========================",
                "Section one",
                "-----------",
                "    [ ] Chrome 22 (Windows 8)",
                "    [ ] Firefox 16 (Windows 8)",
                "Section two",
                "-----------",
                "    [ ] Safari 6 (Mac OS 10.6)"
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
                "==========================",
                "Section one",
                "-----------",
                "    [ ] Chrome 22 (Windows 8)",
                "    [ ] Firefox 16 (Windows 8)",
                "Section two",
                "-----------",
                "    [ ] Safari 6 (Mac OS 10.6)"
            ])
        })

        it('pads empty lines', function(){
            var app = appWithTwoLaunchers()
            var lines = functions.render(app, windowSize)
            expect(lines.length).to.equal(windowSize.lines)
        })

    })

})


{
    // factory functions, helper functions and global variables to ease setup
    var downArrow = [27, 91, 66]
    var upArrow = [27, 91, 65]
    var windowSize = {lines: 10, columns: 80}

    function appWithTwoLaunchers(viewProps){
        var launchers = [
            {
                section: 'Section one'
                , launchers: [
                    {browser: 'Chrome', browser_version: 22.0, os: 'Windows', os_version: 8.0},
                    {browser: 'Firefox', browser_version: 16.0, os: 'Windows', os_version: 8.0}
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
                    {browser: 'Chrome', browser_version: 22.0, os: 'Windows', os_version: 8.0},
                    {browser: 'Firefox', browser_version: 16.0, os: 'Windows', os_version: 8.0}
                ]
            },
            {
                section: 'Section two'
                , launchers: [
                    {browser: 'Safari', browser_version: 6.0, os: 'Mac OS', os_version: 10.6}
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