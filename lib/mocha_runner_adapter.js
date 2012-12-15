/*

mocha_runner_adapter.js
=======================

This is a *fake* runner (adapter is an apt word for it) that behaves like a runner in mocha so that we can slip this into various mocha reporters and reused them out-of-the-box.

*/
var EventEmitter = require('events').EventEmitter
var strutils = require('./strutils')

module.exports = mochaRunnerAdapter
function mochaRunnerAdapter(app){
    var rr = Object.create(EventEmitter.prototype)

    rr.started = false
    rr.start = function(){
        if (!rr.started){
            rr.emit('start')
            rr.started = true
        }
    }

    app.on('test-result', function(test, runner, launcher){
        rr.start()
        var runnerName = '(Unknown)'
        if (runner) runnerName = runner.get('name')
        if (launcher) runnerName = launcher.name

        //console.error(test)

        var title = runnerName + ' - ' + test.name
        var testItems = test.items
        var testObj = {
            parent: { fullTitle: function(){ return runnerName } }
            , title: title
            , state: test.failed > 0 ? 'failed' : 'passed'
            , fullTitle: function(){ return title }
            , slow: function(){ false }
            , fn: ''
            , error: testItems && testItems[0] ? {
                message: testItems[0].message
                , stack: formatStack(test)
            } : undefined
        }

        if (test.failed > 0){
            rr.emit('fail', testObj, testObj.error)
        }else{
            rr.emit('pass', testObj)
        }

        rr.emit('test end', testObj)
    })

    app.on('tests-start', function(){
        rr.start()
    })

    app.on('all-test-runners-end', function(results, runner, launcher){
        rr.emit('end')
    })

    rr.grepTotal = function(){
        return 0
    }

    return rr
}

function formatStack(test){

    function findError(items){
        return items.filter(function(item){
            return !item.passed
        })[0]
    }

    var err = findError(test.items)
    if (!err) return ''
    if (!err.stacktrace) return err.message || 'Error'
    if (err.message === err.stacktrace.split('\n')[0]){
        return err.stacktrace
    }else if (!strutils.isIndented(err.stacktrace)){
        return err.message + '\n' + strutils.indent(err.stacktrace)
    }else{
        return err.message + '\n' + err.stacktrace
    }

}