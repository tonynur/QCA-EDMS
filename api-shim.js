// API SHIM — pakai JSONP (bypass CORS total)
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

var __jsonpCounter = 0;

function callApi_(action, args, onSuccess, onFailure) {
  var cbName = 'qcaCallback_' + (++__jsonpCounter) + '_' + Date.now();

  window[cbName] = function (data) {
    delete window[cbName];
    if (script.parentNode) script.parentNode.removeChild(script);
    if (onSuccess) onSuccess(data);
  };

  var appsUrl = APPS_SCRIPT_URL +
    '?api=1' +
    '&apiAction=' + encodeURIComponent(action) +
    '&apiArgs=' + encodeURIComponent(JSON.stringify(args || [])) +
    '&callback=' + encodeURIComponent(cbName);

  var script = document.createElement('script');
  script.src = appsUrl;
  script.onerror = function () {
    delete window[cbName];
    if (script.parentNode) script.parentNode.removeChild(script);
    if (onFailure) onFailure(new Error('JSONP request failed'));
  };
  document.body.appendChild(script);

  setTimeout(function () {
    if (window[cbName]) {
      delete window[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
      if (onFailure) onFailure(new Error('Timeout'));
    }
  }, 30000);
}

(function () {
  function makeChain(successFn, failureFn) {
    return new Proxy({}, {
      get: function (target, prop) {
        if (prop === 'withSuccessHandler') return function (fn) { return makeChain(fn, failureFn); };
        if (prop === 'withFailureHandler') return function (fn) { return makeChain(successFn, fn); };
        if (prop === 'withUserObject') return function () { return makeChain(successFn, failureFn); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          callApi_(String(prop), args, successFn, failureFn);
        };
      }
    });
  }
  window.google = window.google || {};
  window.google.script = { run: makeChain(null, null) };
})();
