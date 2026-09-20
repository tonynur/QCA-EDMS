// API SHIM — pakai CORS proxy publik
var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

function callApi_(action, args, onSuccess, onFailure) {
  // Bangun URL Apps Script dengan query
  var appsUrl = APPS_SCRIPT_URL +
    '?api=1' +
    '&apiAction=' + encodeURIComponent(action) +
    '&apiArgs=' + encodeURIComponent(JSON.stringify(args || []));

  // Bungkus dengan CORS proxy
  var url = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(appsUrl);

  fetch(url, { method: 'GET' })
    .then(function (r) { return r.text(); })
    .then(function (text) {
      try {
        var data = JSON.parse(text);
        if (onSuccess) onSuccess(data);
      } catch (e) {
        if (onFailure) onFailure(new Error('Invalid JSON: ' + text.substring(0, 100)));
      }
    })
    .catch(function (err) {
      if (onFailure) onFailure(err);
      else console.error('[API Error]', action, err);
    });
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
