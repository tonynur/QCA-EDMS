const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {
  const result = {
    step1_requestUrl: req.url,
    step2_env: process.version,
    logs: []
  };

  try {
    // Parse query
    const fullUrl = new URL(req.url, 'https://qca-edms.vercel.app');
    const qs = fullUrl.searchParams.toString() || 'api=1&apiAction=test';
    const targetUrl = APPS_SCRIPT_URL + '?' + qs;
    result.step3_targetUrl = targetUrl;

    // Fetch dengan redirect MANUAL untuk lihat redirect asli
    const firstRes = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'manual'
    });
    result.step4_firstStatus = firstRes.status;
    result.step4_firstLocation = firstRes.headers.get('location') || '(none)';
    
    const firstBody = await firstRes.text();
    result.step5_firstBodyPreview = firstBody.substring(0, 300);

    // Kalau ada redirect, ikuti manual
    if (firstRes.status >= 300 && firstRes.status < 400) {
      const redirectUrl = firstRes.headers.get('location');
      if (redirectUrl) {
        const secondRes = await fetch(redirectUrl, { method: 'GET' });
        result.step6_secondStatus = secondRes.status;
        const secondBody = await secondRes.text();
        result.step6_secondBodyPreview = secondBody.substring(0, 500);
      }
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(JSON.stringify(result, null, 2));

  } catch (err) {
    result.error = err.message;
    result.stack = err.stack;
    return res.status(500).json(result);
  }
};
