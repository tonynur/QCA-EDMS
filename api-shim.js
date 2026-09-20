// API SHIM — pakai GET untuk avoid redirect body-loss
var QCA_API_URL = '/api/proxy';

function callApi_(action, args, onSuccess, onFailure) {
  var url = QCA_API_URL +
    '?api=1' +
    '&apiAction=' + encodeURIComponent(action) +
    '&apiArgs=' + encodeURIComponent(JSON.stringify(args || []));

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
