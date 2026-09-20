const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ambil query string dari request
    const qs = new URLSearchParams(req.query).toString();
    const targetUrl = APPS_SCRIPT_URL + (qs ? '?' + qs : '');

    console.log('Proxying to:', targetUrl);

    // Fetch ke Apps Script
    const appsRes = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow'
    });

    const text = await appsRes.text();

    console.log('Apps Script responded:', text.substring(0, 200));

    // Kalau JSON — forward apa adanya
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(trimmed);
    }

    // Kalau HTML — kasih error
    return res.status(500).json({
      success: false,
      message: 'Apps Script returned non-JSON',
      preview: trimmed.substring(0, 200)
    });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
