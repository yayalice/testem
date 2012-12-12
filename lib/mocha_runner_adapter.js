/*

mocha_runner_adapter.js
=======================

This is a *fake* runner (adapter is an apt word for it) that behaves like a runner in mocha so that we can slip this into various mocha reporters and reused them out-of-the-box.

*/
var EventEmitter = require('events').EventEmitter


module.exports = mochaRunnerAdapter
function mochaRunnerAdapter(){
    var rr = {}

}