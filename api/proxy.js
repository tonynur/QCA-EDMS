const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const fullUrl = new URL(req.url, 'https://qca-edms.vercel.app');
    const qs = fullUrl.searchParams.toString();
    const targetUrl = APPS_SCRIPT_URL + (qs ? '?' + qs : '');

    console.log('[PROXY] Target:', targetUrl);

    // ✅ Pakai User-Agent browser untuk bypass block
    const appsRes = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/plain,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    const text = await appsRes.text();
    console.log('[PROXY] Status:', appsRes.status);
    console.log('[PROXY] Preview:', text.substring(0, 200));

    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(trimmed);
    }

    return res.status(500).json({
      success: false,
      message: 'Apps Script returned non-JSON',
      status: appsRes.status,
      preview: trimmed.substring(0, 300)
    });

  } catch (err) {
    console.error('[PROXY] Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
