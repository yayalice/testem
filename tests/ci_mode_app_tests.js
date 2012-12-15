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
            expect(stdout.toString()).to.equal('ok 1 PhantomJS 1.5 - hello says hello world.\nnot ok 2 PhantomJS 1.5 - hello says hello to human.\n  Error: You are not supposed to supply a name!\n  \nnot ok 3 node - "mocha web/hello_tests.js"\n  Exited with code 1\n  \nok 4 tap - hello says hello world\nnot ok 5 tap - hello says hello to human\n    Error: You are not supposed to supply a name!\n        at hello (/Users/airportyh/Home/Code/testem/tests/web/hello.js:7:15)\n        at Context.<anonymous> (/Users/airportyh/Home/Code/testem/tests/web/hello_tests.js:11:9)\n        at Test.Runnable.run (/usr/local/lib/node_modules/mocha/lib/runnable.js:184:32)\n        at Runner.runTest (/usr/local/lib/node_modules/mocha/lib/runner.js:300:10)\n        at Runner.runTests.next (/usr/local/lib/node_modules/mocha/lib/runner.js:346:12)\n        at next (/usr/local/lib/node_modules/mocha/lib/runner.js:228:14)\n        at Runner.hooks (/usr/local/lib/node_modules/mocha/lib/runner.js:237:7)\n        at next (/usr/local/lib/node_modules/mocha/lib/runner.js:185:23)\n        at Runner.hook (/usr/local/lib/node_modules/mocha/lib/runner.js:205:5)\n        at process.startup.processNextTick.process._tickCallback (node.js:244:9)\n1..5\n')
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