var exec = require('child_process').exec
var Config = require('../lib/config')
var App = require('../lib/ci_mode_app')
var expect = require('chai').expect

describe('ci_mode_app', function(){

    it('outputs tap by default', function(done){
        this.timeout(3000)
        exec('node ../testem.js ci -f ci_mode_app_tests.yml', function(err, stdout, stderr){
            if (stderr) {
                console.error(stderr)
                expect(stderr).to.not.be.ok
            }
            stdout = '' + stdout
            expect(stdout).to.match(/ok 1 PhantomJS 1\.5/)
            expect(stdout).to.match(/not ok 3 node - "mocha web\/hello_tests\.js"/)
            expect(stdout).to.match(/Error: You are not supposed to supply a name!/)
            expect(stdout).to.match(/1\.\.5/)
            done()
        })
    })
    
    var reporters = 'dot doc spec json progress list tap landing xunit teamcity html-cov json-cov min json-stream markdown nyan'.split(' ')
    reporters.forEach(function(reporter){
        xit('outputs ' + reporter, function(done){
            this.timeout(3000)
            exec('node ../testem.js ci -f ci_mode_app_tests.yml -R ' + reporter, function(err, stdout, stderr){
                if (stderr) {
                    console.error(stderr)
                    expect(stderr).to.not.be.ok
                }
                expect(stdout).not.to.equal('')
                done()
            })
        })
    })

})