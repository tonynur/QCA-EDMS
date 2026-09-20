/**
 * Vercel Serverless Function — Proxy ke Apps Script
 * Bypass CORS: server Vercel yang fetch, bukan browser
 */

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxHv0P-UlPghtjjUzMiu0Bdi7WqvtNlDmEQmVaOnS1dPQAgdZNZV7piFks72p1GJDz9/exec';

module.exports = async function handler(req, res) {

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(req.body),
      redirect: 'follow'
    });

    const text = await response.text();
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(text);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
