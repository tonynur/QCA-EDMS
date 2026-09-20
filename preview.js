// ============================================================================
// Preview In-Browser (Cache + Prefetch)
// ============================================================================

(function () {
  'use strict';

  var __previewCache = {};

  function injectPreviewModal() {
    if (document.getElementById('previewModal')) return;
    var html =
      '<div class="modal-overlay" id="previewModal">' +
        '<div class="modal-box preview-modal-box">' +
          '<div class="preview-modal-head">' +
            '<h3 class="card-title" id="previewModalTitle" style="margin:0;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Preview</h3>' +
            '<a class="btn-small" id="previewDownloadBtn" href="#" target="_blank">⬇ Download</a>' +
            '<button class="btn-small" onclick="closePreviewModal()">✕</button>' +
          '</div>' +
          '<div class="preview-modal-body" id="previewModalBody">' +
            '<div class="loading-row"><span class="spinner dark"></span>Memuat preview...</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    document.body.appendChild(tmp.firstElementChild);
  }

  function renderPreviewBody_(body, res) {
    if (res.mode === 'native' || res.mode === 'google-viewer') {
      var iframe = document.createElement('iframe');
      iframe.className = 'preview-iframe';
      iframe.src = res.previewUrl;
      iframe.setAttribute('allow', 'autoplay');
      iframe.setAttribute('allowfullscreen', '');
      body.innerHTML = '';
      body.appendChild(iframe);
    } else {
      body.innerHTML =
        '<div class="empty-state">' +
          '<div class="icon">📄</div>' +
          '<div class="msg">Preview tidak tersedia untuk tipe file ini.<br><br>' +
            '<a href="' + esc(res.downloadUrl) + '" target="_blank" class="btn btn-primary">⬇ Download File</a>' +
          '</div>' +
        '</div>';
    }
  }

  window.prefetchPreview_ = function (fileUrl) {
    if (!fileUrl || __previewCache[fileUrl]) return;
    if (!sessionToken) return;
    google.script.run
      .withSuccessHandler(function (res) {
        if (res && res.success) __previewCache[fileUrl] = res;
      })
      .withFailureHandler(function () {})
      .getFilePreviewInfo(sessionToken, fileUrl);
  };

  window.previewFile_ = function (fileUrl, fileName) {
    if (!fileUrl) { showToast('URL file tidak tersedia.', 'error'); return; }
    if (!sessionToken) { showToast('Sesi tidak aktif.', 'error'); return; }

    injectPreviewModal();

    var modal = document.getElementById('previewModal');
    var title = document.getElementById('previewModalTitle');
    var body  = document.getElementById('previewModalBody');
    var dlBtn = document.getElementById('previewDownloadBtn');

    title.textContent = fileName || 'Preview';
    dlBtn.href = fileUrl;
    modal.classList.add('show');

    if (__previewCache[fileUrl]) {
      var c = __previewCache[fileUrl];
      title.textContent = c.fileName || fileName;
      dlBtn.href = c.downloadUrl || fileUrl;
      renderPreviewBody_(body, c);
      return;
    }

    body.innerHTML = '<div class="loading-row"><span class="spinner dark"></span>Memuat preview...</div>';

    google.script.run
      .withSuccessHandler(function (res) {
        if (!res || !res.success) {
          body.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><div class="msg">' + esc((res && res.message) || 'Gagal memuat preview.') + '</div></div>';
          return;
        }
        title.textContent = res.fileName || fileName;
        dlBtn.href = res.downloadUrl || fileUrl;
        __previewCache[fileUrl] = res;
        renderPreviewBody_(body, res);
      })
      .withFailureHandler(function (err) {
        body.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><div class="msg">Gagal: ' + esc((err && err.message) || 'Unknown') + '</div></div>';
      })
      .getFilePreviewInfo(sessionToken, fileUrl);
  };

  window.closePreviewModal = function () {
    var modal = document.getElementById('previewModal');
    if (!modal) return;
    modal.classList.remove('show');
    var body = document.getElementById('previewModalBody');
    if (body) body.innerHTML = '';
  };

  document.addEventListener('click', function (e) {
    var modal = document.getElementById('previewModal');
    if (modal && modal.classList.contains('show') && e.target === modal) closePreviewModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var modal = document.getElementById('previewModal');
      if (modal && modal.classList.contains('show')) closePreviewModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPreviewModal);
  } else {
    injectPreviewModal();
  }
})();
