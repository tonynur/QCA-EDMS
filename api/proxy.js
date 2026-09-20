const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ✅ Parse query dari req.url (bukan req.query — sering kosong di Vercel)
    const fullUrl = new URL(req.url, 'http://localhost');
    const qs = fullUrl.searchParams.toString();
    const targetUrl = APPS_SCRIPT_URL + (qs ? '?' + qs : '');

    console.log('Proxying to:', targetUrl);

    const appsRes = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow'
    });

    const text = await appsRes.text();
    console.log('Response preview:', text.substring(0, 200));

    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(trimmed);
    }

    return res.status(500).json({
      success: false,
      message: 'Apps Script returned non-JSON',
      preview: trimmed.substring(0, 200)
    });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
