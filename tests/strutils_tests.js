var test = require('./testutils.js')
var expect = test.expect
var StyledString = require('styled_string')
var strutils = require('../lib/strutils')
var splitLines = strutils.splitLines
var indent = strutils.indent
var pad = strutils.pad
var template = strutils.template
var isIndented = strutils.isIndented

describe('splitLines', function(){
    it('splits on newline', function(){
        var s = 'abc\ndef'
        expect(splitLines(s, 10)).to.deep.equal(['abc', 'def'])
    })
    it('breaks a line', function(){
        var s = 'abcdef'
        expect(splitLines(s, 3)).to.deep.equal(['abc', 'def'])
    })
    it('splits and then breaks', function(){
        var s = 'abcd\nefghijkl'
        expect(splitLines(s, 5)).to.deep.equal(['abcd', 'efghi', 'jkl'])
    })

    describe('it also works on styled strings', function(){
        it('splits on newline', function(){
            var s = StyledString('abc\ndef', {foreground: 'red'})
            var ss = splitLines(s, 10)
            expect(ss.length).to.equal(2)
            expect(ss[0].toString()).to.equal('\u001b[31mabc\u001b[0m')
            expect(ss[1].toString()).to.equal('\u001b[31mdef\u001b[0m')
        })
        it('splits and then breaks', function(){
            var s = StyledString('abcd\nefghijkl', {foreground: 'red'})
            var ss = splitLines(s, 5)
            expect(ss.length).to.equal(3)
            expect(ss[0].toString()).to.equal('\u001b[31mabcd\u001b[0m')
            expect(ss[1].toString()).to.equal('\u001b[31mefghi\u001b[0m')
            expect(ss[2].toString()).to.equal('\u001b[31mjkl\u001b[0m')
        })

    })

    describe('isIndented', function(){
        it('is false for degenerate case', function(){
            expect(isIndented('')).not.to.be.ok
            expect(isIndented(null)).not.to.be.ok
            expect(isIndented(undefined)).not.to.be.ok
        })
        it('is true', function(){
            expect(isIndented('    abc')).to.be.ok
            expect(isIndented('\tabc')).to.be.ok
        })
    })
})

describe('indent', function(){
    it('should indent', function(){
        expect(indent('')).to.equal('    ')
        expect(indent('abc\ndef')).to.equal('    abc\n    def')
    })
})

describe('template', function(){
    it('should replace parameters with their values', function() {
        var str = "a<foo>c<bar>e<bar><baz>"
        var params = {
            foo: 'b',
            bar: 'd'
        }
        expect(template(str, params)).to.equal('abcded<baz>')
    })
})
