/*

ci_mode_app.js
==============

The entry point for CI mode.

*/

var yaml = require('js-yaml')
var fs = require('fs')
var Server = require('./server')
var spawn = require('child_process').spawn
var tap = require('tap')
var path = require('path')
var async = require('async')
var Backbone = require('backbone')
var Config = require('./config')
var log = require('winston')
var TestResults = require('./runners').TestResults
var BaseApp = require('./base_app')
var race = require('./race')
var _ = require('underscore')
var mochaRunnerAdapter = require('./mocha_runner_adapter')

var fileExists = fs.exists || path.exists

function App(config){
    BaseApp.call(this, config)
    var self = this
    config.getLaunchers(this, function(launchers){
        self.launchers = launchers
        self.initialize()
        self.server.once('server-start', function(){
            self.startOnStartHook(function(){
                self.begin()
            })
        })
    })
    process.on('uncaughtException', function(err){
        self.quit(err)
    })
    this.setupReporter()
}

App.prototype = {
    __proto__: BaseApp.prototype
    , initialize: function(){
        var config = this.config
        //this.tapProducer = new tap.Producer(true)
        //this.tapProducer.pipe(process.stdout)
        this.testId = 1
        this.failed = false
        this.testsStarted = false
        this.server = new Server(this)
        this.server.start()
    }
    , setupReporter: function(){
        var reporterName = this.config.get('reporter')
        log.info('looking for reporter ' + reporterName)
        try{
            this.reporter = require('./reporters/' + reporterName)
            log.info('using my ' + reporterName + ' reporter')
        }catch(e){
            log.error(e.message)
            try{
                this.reporter = require('mocha/lib/reporters/' + reporterName)
                log.info('using mocha ' + reporterName)
            }catch(e){
                console.error('Reporter ' + reporterName + ' doesn\'t exist.')
                this.quit()
                return
            }
        }
        new this.reporter(mochaRunnerAdapter(this))
    }
    , begin: function(){
        var self = this
        this.runPreprocessors(function(err, stdout, stderr, command){
            if (err){
                var name = 'before_tests hook'
                var errMsg = self.config.get('before_tests')
                var results = self.makeTestResults({
                    passed: false
                    , testName: name
                    , errMsg: errMsg
                    , stdout: stdout
                    , stderr: stderr
                })
                self.outputTap(results)
                self.quit()
            }else{
                self.runAllTheTests()
            }
        })
    }

    , runAllTheTests: function(){
        var self = this
        async.forEachSeries(this.launchers, function(launcher, next){
            var processExited, gotTestResults

            function finish(){
                if (launcher.tearDown){
                    launcher.tearDown(next)
                }else{
                    next()
                }
            }

            race(self.getRacers(launcher), function(results, gotResults){
                if (launcher.runner){
                    launcher.runner.set('results', results)
                }
                if (!gotResults){
                    results.get('tests').each(function(test){
                        self.emit('test-result', test.attributes, null, launcher)
                    })
                    self.emit('all-test-results', results, null, launcher)
                }
                launcher.kill()
                finish()
            })
            
            function launch(){
                launcher.start()
                self.emit('tests-start')
            }
            if (launcher.setup){
                launcher.setup(self, function(){
                    launch()
                })
            }else{
                launch()
            }

        }, function(){
            self.emit('all-test-runners-end')
            self.quit()
        })
    }
    , getRacers: function(launcher){
        var self = this
        return [
            function(done){
                launcher.once('processExit', function(code){
                    var results = makeTestResultsForCode(code, launcher)
                    setTimeout(function(){
                        done(results)
                    }, 200)
                })
            }
            , function(done){
                self.once('all-test-results', function(results){
                    done(results, true)
                })
            }
            , function(done){
                var timeout
                if (timeout = self.config.get('timeout')){
                    setTimeout(function(){
                        var results = makeTestResultsForTimeout(timeout, launcher)
                        done(results)
                    }, timeout * 1000)
                }
            }
        ]
    }
    , quit: function(err){
        var self = this
        this.cleanUpLaunchers(function(){
            var code = self.failed ? 1 : 0
            self.runPostprocessors(function(){
                self.runExitHook(function(){
                    if (err) console.error(err.stack)
                    process.exit(code)
                })
            })
        })
    }
}

function makeTestResults(params){
    var passed = params.passed
    var testName = params.testName
    var errMsg = params.errMsg
    var runner = params.runner
    var stdout = params.stdout
    var stderr = params.stderr
    var results = new TestResults
    var errorItem = {
        passed: false
        , message: errMsg
    }
    var result = {
        passed: passed
        , failed: !passed
        , total: 1
        , id: 1
        , name: testName
        , items: [errorItem]
    }
    if (runner){
        errorItem.stdout = runner.get('messages')
            .filter(function(m){
                return m.get('type') === 'log'
            }).map(function(m){
                return m.get('text')
            }).join('\n')
        errorItem.stderr = runner.get('messages')
            .filter(function(m){
                return m.get('type') === 'error'
            }).map(function(m){
                return m.get('text')
            }).join('\n')
    }
    if (stdout) errorItem.stdout = stdout
    if (stderr) errorItem.stderr = stderr
    results.addResult(result)
    return results
}
function makeTestResultsForCode(code, launcher){
    var command = launcher.settings.command
    return makeTestResults({
        passed: code === 0
        , testName: '"' + command + '"'
        , errMsg: 'Exited with code ' + code
        , runner: launcher.runner
    })
}
function makeTestResultsForTimeout(timeout, launcher){
    var command = launcher.settings.command || 'Timed Out'
    var errMsg = 'Timed out ' + launcher.name + 
                    ' after waiting for ' + timeout + ' seconds'
    return makeTestResults({
        passed: false
        , testName: command
        , errMsg: errMsg
        , runner: launcher.runner
    })
}

module.exports = App