var exec = require('child_process').exec
var Config = require('../lib/config')
var App = require('../lib/ci_mode_app')
var expect = require('chai').expect

describe.only('ci_mode_app', function(){

    it('outputs tap by default', function(done){
        this.timeout(3000)
        exec('node ../testem.js ci -f ci_mode_app_tests.yml', function(err, stdout, stderr){
            if (stderr) {
                console.error(stderr)
                expect(stderr).to.not.be.ok
            }
            expect(stdout.toString()).to.equal([
                '1..0'
              , 'ok 1 PhantomJS 1.5 hello says hello world.'
              , 'ok 2 node "mocha web/hello_tests.js"\n'
            ].join('\n'))
            done()
        })
    })

    var reporters = 'dot doc spec json progress list tap landing xunit teamcity html-cov json-cov min json-stream markdown nyan'.split(' ')
    reporters.forEach(function(reporter){
        it('outputs ' + reporter, function(done){
            this.timeout(3000)
            exec('node ../testem.js ci -f ci_mode_app_tests.yml -R ' + reporter, function(err, stdout, stderr){
                if (stderr) {
                    console.error(stderr)
                    expect(stderr).to.not.be.ok
                }
                done()
            })
        })
    })

})