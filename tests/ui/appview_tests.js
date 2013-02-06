// Huge ceremonious setup can be help by building a new library
// that does dependency injection better or by mocking only the
// top level modules being depended on.
var Backbone = require('Backbone')
var libDir = '../../lib/'
var screen = require('./fake_screen')
var sandbox = require('sandboxed-module')
var ScrollableTextPanel = sandbox.require(libDir + 'ui/scrollable_text_panel', {
    requires: {'./screen': screen}
})
var SplitLogPanel = sandbox.require(libDir + 'ui/split_log_panel', {
    requires: {
        './screen': screen
        , './scrollable_text_panel': ScrollableTextPanel
    }
})
var runnertabs = sandbox.require(libDir + 'ui/runner_tabs', {
    requires: {
        './screen': screen
        , './split_log_panel': SplitLogPanel
    }
})
var ErrorMessagesPanel = sandbox.require(libDir + 'ui/error_messages_panel', {
    requires: { 
        './screen': screen
        , './scrollable_text_panel': ScrollableTextPanel
    }
})
var AppView = sandbox.require(libDir + 'ui/appview', {
    requires: { 
        './screen': screen
        , './runner_tabs': runnertabs
        , './error_messages_panel': ErrorMessagesPanel
    }
})



describe.only('AppView', function(){

    it('initializes', function(){
        var app = new Backbone.Model
        new AppView({app: app})
    })

})