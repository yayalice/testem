var expect = require('chai').expect
var functions = require('../../lib/launchers_mode_app/functions')
var step = functions.step
var chars = require('../../lib/chars')
var _ = require('underscore')

describe('launchers_mode_app_functions', function(){

    describe('step', function(){

        it('selects next launcher', function(){
            var app = appWithTwoLaunchers()
            expect(step(app, downArrow).selection).to.equal(1)
        })

        it('stops if try to "next" at the bottom', function(){
            var app = appWithTwoLaunchers({selection: 1})
            expect(step(app, downArrow).selection).to.equal(1)
        })

        it('selects previous launcher', function(){
            var app = appWithTwoLaunchers({selection: 1})
            expect(step(app, upArrow).selection).to.equal(0)
        })

        it('stops if try to "previous" at the bottom', function(){
            var app = appWithTwoLaunchers()
            expect(step(app, upArrow).selection).to.equal(0)
        })

        it('adds to the checked array if ENTER hit', function(){
            var app = appWithTwoLaunchers()
            expect(step(app, '\r').checked).to.deep.equal([0])
        })

    })

    describe('render', function(){

        it('renders app with one section of launchers', function(){
            var app = appWithTwoLaunchers()
            expect(functions.render(app)).to.deep.equal([
                "Test'em Launcher Selection",
                "==========================",
                "Section one",
                "-----------",
                "    [" + chars.check + "] Chrome 22 (Windows 8)",
                "    [ ] Firefox 16 (Windows 8)"
            ])
        })

        it('renders app with two sections of launchers', function(){
            var app = appWithTwoLauncherSections({selection: 2})
            expect(functions.render(app)).to.deep.equal([
                "Test'em Launcher Selection",
                "==========================",
                "Section one",
                "-----------",
                "    [ ] Chrome 22 (Windows 8)",
                "    [ ] Firefox 16 (Windows 8)",
                "Section two",
                "-----------",
                "    [" + chars.check + "] Safari 6 (Mac OS 10.6)"
            ])
        })

    })

})



var downArrow = [27, 91, 66]
var upArrow = [27, 91, 65]

function appWithTwoLaunchers(props){
    return _.extend({
        selection: 0
        , checked: []
        , launchers: [
            {
                section: 'Section one'
                , launchers: [
                    {browser: 'Chrome', browser_version: 22.0, os: 'Windows', os_version: 8.0},
                    {browser: 'Firefox', browser_version: 16.0, os: 'Windows', os_version: 8.0}
                ]
            }
        ]
    }, props)
}

function appWithTwoLauncherSections(props){
    return _.extend({
        selection: 0
        , checked: []
        , launchers: [
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
    }, props)
}
