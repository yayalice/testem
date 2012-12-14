#!/usr/bin/env node

var log = require('winston')
var program = require('commander')
var progOptions = program
var Config = require('./lib/config')
var catchem = require('./lib/catchem')
var Api = require('./lib/api')
var appMode = 'dev'
  
program
    .version(require(__dirname + '/package').version)
    .usage('[options]')
    .option('-f, --file [file]', 'config file - defaults to testem.json or testem.yml')
    .option('-p, --port [num]', 'server port - defaults to 7357', Number)
    .option('-l, --launch [list]', 'list of launchers to launch(comma separated)')
    .option('-s, --skip [list]', 'list of launchers to skip(comma separated)')
    .option('-d, --debug', 'output debug to debug log - testem.log')
    .option('-t, --test_page [page]', 'the html page to drive the tests')


program
    .command('launchers')
    .description('Print the list of available launchers (browsers & process launchers)')
    .action(function(env){
        env.__proto__ = program
        progOptions = env
        appMode = 'launchers'
    })

program
    .command('ci')
    .description('Continuous integration mode')
    .option('-T, --timeout [sec]', 'timeout a browser after [sec] seconds', null)
    .option('-R, --reporter [name]', 'reporter to use', 'tap')
    .action(function(env){
        env.__proto__ = program
        progOptions = env
        appMode = 'ci'
    })


program.on('--help', function(){
    console.log('  Keyboard Controls (in dev mode):\n')
    console.log('    ENTER                  run the tests')
    console.log('    q                      quit')
    console.log('    LEFT ARROW             move to the next browser tab on the left')
    console.log('    RIGHT ARROW            move to the next browser tab on the right')
    console.log('    TAB                    switch between top and bottom panel (split mode only)')
    console.log('    UP ARROW               scroll up in the target text panel')
    console.log('    DOWN ARROW             scroll down in the target text panel')
    console.log('    SPACE                  page down in the target text panel')
    console.log('    b                      page up in the target text panel')
    console.log('    d                      half a page down in the target text panel')
    console.log('    u                      half a page up in the target text panel')
    console.log()
})

/* ============ Reporters list stolen shamelessly from Mocha ===== */
program.on('reporters', function(){
  console.log();
  console.log('    dot - dot matrix');
  console.log('    doc - html documentation');
  console.log('    spec - hierarchical spec list');
  console.log('    json - single json object');
  console.log('    progress - progress bar');
  console.log('    list - spec-style listing');
  console.log('    tap - test-anything-protocol');
  console.log('    landing - unicode landing strip');
  console.log('    xunit - xunit reportert');
  console.log('    teamcity - teamcity ci support');
  console.log('    html-cov - HTML test coverage');
  console.log('    json-cov - JSON test coverage');
  console.log('    min - minimal reporter');
  console.log('    json-stream - newline delimited json events');
  console.log('    markdown - markdown documentation (github flavour)');
  console.log('    nyan - nyan cat!');
  console.log();
  process.exit();
});


program.parse(process.argv)

catchem.on('err', function(e){
    log.error(e.message)
    log.error(e.stack)
})

var config = new Config(appMode, progOptions)
if (appMode === 'launchers'){
    config.read(function(){
        config.printLauncherInfo()
    })
}else{
    var api = new Api()
    if (appMode === 'ci'){
        api.startCI(progOptions)
    }else{
        api.startDev(progOptions)
    }
}



