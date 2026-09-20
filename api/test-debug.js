const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {
  const result = {
    requestUrl: req.url,
    nodeVersion: process.version
  };

  try {
    const fullUrl = new URL(req.url, 'https://qca-edms.vercel.app');
    const qs = fullUrl.searchParams.toString() || 'api=1&apiAction=test';
    const targetUrl = APPS_SCRIPT_URL + '?' + qs;
    result.targetUrl = targetUrl;

    const appsRes = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json,text/plain,*/*',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    result.status = appsRes.status;
    const text = await appsRes.text();
    result.bodyPreview = text.substring(0, 500);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(result, null, 2));

  } catch (err) {
    result.error = err.message;
    return res.status(500).json(result);
  }
};
