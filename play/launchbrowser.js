var Launcher = require('../lib/launcher')

function doit(){
  var app = {url: 'http://tobyho.com', template: function(s){
    return s
  }, runners: []}

  var l = new Launcher('BS:Chrome', {
    command: 'browserstack launch --attach chrome:24.0 http://tobyho.com'
  }, app)

  l.start()

  return l
}

setInterval(function(){}, 1000)

var launcher = doit()

process.on('SIGINT', function(){
  console.log('SIGINT')
  launcher.kill('SIGINT', function(){
    process.exit()  
  })
})