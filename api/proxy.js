const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Forward semua query params ke Apps Script
    const qs = new URLSearchParams(req.query).toString();
    const appsUrl = APPS_SCRIPT_URL + '?' + qs;

    const response = await fetch(appsUrl, { method: 'GET', redirect: 'follow' });
    const text = await response.text();

    if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send(text);
    }

    return res.status(500).json({
      success: false,
      message: 'Apps Script returned non-JSON',
      preview: text.substring(0, 300)
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
