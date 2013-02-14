initialize()
function initialize(){
  updateIframeHeight()
  setIframeLocation()
  setupAutoUpdateIframeHeight()
  connect()
}

function updateIframeHeight(){
  var ui = document.getElementById('ui')
  var iframe = document.getElementById('iframe')
  var height = windowHeight() - elementHeight(ui)
  iframe.setAttribute('height', height + 'px')
}

function setIframeLocation(){
  var ui = document.getElementById('ui')
  var iframe = document.getElementById('iframe')
  iframe.style.top = elementHeight(ui) + 'px'
}

function setupAutoUpdateIframeHeight(){
  addListener(window, 'resize', throttle(updateIframeHeight, 250))
}

function connect(){
  var socket = io.connect()
  socket.emit('browser-login', getBrowserName())
  
}

function getBrowserName(userAgent){
  userAgent = userAgent || navigator.userAgent
  var regexs = [
    /MS(?:(IE) (1?[0-9]\.[0-9]))/,
    /(Chrome)\/([0-9]+\.[0-9]+)/,
    /(Firefox)\/([0-9a-z]+\.[0-9a-z]+)/,
    /(Opera).*Version\/([0-9]+\.[0-9]+)/,
    /(PhantomJS)\/([0-9]+\.[0-9]+)/,
    [/(Android).*Version\/([0-9]+\.[0-9]+).*(Safari)/, function(m){
      return [m[1], m[3], m[2]].join(' ')
    }],
    [/(iPhone).*Version\/([0-9]+\.[0-9]+).*(Safari)/, function(m){
      return [m[1], m[3], m[2]].join(' ')
    }],
    [/(iPad).*Version\/([0-9]+\.[0-9]+).*(Safari)/, function(m){
      return [m[1], m[3], m[2]].join(' ')
    }],
    [/Version\/([0-9]+\.[0-9]+).*(Safari)/, function(m){
      return [m[2], m[1]].join(' ')
    }]
  ]
  for (var i = 0; i < regexs.length; i++){
    var regex = regexs[i]
    var pick = function(m){
      return m.slice(1).join(' ')
    }
    if (regex instanceof Array){
      pick = regex[1]
      regex = regex[0]
    }
    var match = userAgent.match(regex)
    if (match){
      return pick(match)
    }
  }
  return userAgent
}

function windowHeight(){
  return window.innerHeight || window.document.documentElement.offsetHeight
}

function elementHeight(elm){
  return elm.offsetHeight
}

// Stole Rem's throttle function
// http://remysharp.com/2010/07/21/throttling-function-calls/
function throttle(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

function addListener(obj, evt, cb){
  if (window.addEventListener){
    obj.addEventListener(evt, cb, false)
  }else{
    obj.attachEvent('on' + evt, cb)
  }
}



