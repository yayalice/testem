// Huge ceremonious setup can be help by building a new library
// that does dependency injection better or by mocking only the
// top level modules being depended on.
var Backbone = require('Backbone')
var libDir = '../../lib/'
var screen = require('./fake_screen')
var AppView = require('../../lib/ui/appview')

describe('AppView', function(){

    xit('initializes', function(){
        var app = new Backbone.Model
        new AppView({
            app: app
            , screen: screen
        })
    })

})