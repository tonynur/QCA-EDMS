/**
 * ============================================================================
 * API SHIM — Bikin google.script.run kompatibel dengan fetch API
 * File ini WAJIB di-load SEBELUM script utama di index.html
 * ============================================================================
 */

// ⚠️ GANTI URL di bawah dengan URL Web App Apps Script Anda
var QCA_API_URL = '/api/proxy'; 

function callApi_(action, args, onSuccess, onFailure) {
  fetch(QCA_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: action, args: args || [] })
  })
  .then(function (response) { return response.json(); })
  .then(function (data) {
    if (onSuccess) onSuccess(data);
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
        if (prop === 'withSuccessHandler') {
          return function (fn) { return makeChain(fn, failureFn); };
        }
        if (prop === 'withFailureHandler') {
          return function (fn) { return makeChain(successFn, fn); };
        }
        if (prop === 'withUserObject') {
          return function () { return makeChain(successFn, failureFn); };
        }
        // Method call — hit API
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
