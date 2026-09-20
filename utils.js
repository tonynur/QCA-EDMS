// ============================================================
// UTILITY MURNI
// ============================================================

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncateText_(s, n) {
  s = s || '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function fmtDateShort_(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch (e) { return '—'; }
}

function fmtDateTime_(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) { return '—'; }
}

function toDateInputValue_(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function fileToBase64(file) {
  return new Promise(function (res, rej) {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function compressImageIfNeeded_(file) {
  const TH = 1.5 * 1024 * 1024, MAX = 1600, Q = 0.75;
  if (!file.type || file.type.indexOf('image/') !== 0 ||
      file.type === 'image/svg+xml' || file.size <= TH) {
    return Promise.resolve(file);
  }
  return new Promise(function (resolve) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = function () {
      URL.revokeObjectURL(url);
      let w = img.naturalWidth, h = img.naturalHeight;
      if (!w || !h || (w <= MAX && h <= MAX)) { resolve(file); return; }
      const s = MAX / Math.max(w, h);
      w = Math.round(w * s); h = Math.round(h * s);
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob(function (blob) {
        if (!blob || blob.size >= file.size) { resolve(file); return; }
        resolve(new File(
          [blob],
          file.name.replace(/\.[^.]+$/, '') + '.jpg',
          { type: 'image/jpeg' }
        ));
      }, 'image/jpeg', Q);
    };
    img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

function filesToPayload(list) {
  return Promise.all(Array.from(list).map(function (file) {
    return compressImageIfNeeded_(file).then(function (pf) {
      return fileToBase64(pf).then(function (b64) {
        return {
          fileName: pf.name,
          mimeType: pf.type || 'application/octet-stream',
          base64Data: b64
        };
      });
    });
  }));
}

function downloadBase64File(base64, fileName, mimeType) {
  const bc = atob(base64);
  const bn = new Array(bc.length);
  for (let i = 0; i < bc.length; i++) bn[i] = bc.charCodeAt(i);
  const blob = new Blob([new Uint8Array(bn)], {
    type: mimeType || 'application/octet-stream'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function debounce_(fn, ms) {
  let timer = null;
  return function () {
    const ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(ctx, args), ms);
  };
}

function mimeForFormat_(f) {
  if (f === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (f === 'xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  return 'application/pdf';
}

function escapeJs_(s) {
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
    .replace(/</g, '\\x3c');
}
