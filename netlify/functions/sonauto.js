exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SONAUTO_API_KEY = process.env.SONAUTO_API_KEY;
  if (!SONAUTO_API_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'SONAUTO_API_KEY not configured' }) };
  }

  try {
    // GET — poll status: /api/sonauto?id=xxx
    if (event.httpMethod === 'GET') {
      const id = event.queryStringParameters?.id;
      if (!id) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing id' }) };

      const resp = await fetch(`https://api.sonauto.ai/v1/generations/${id}`, {
        headers: { 'Authorization': `Bearer ${SONAUTO_API_KEY}` }
      });
      const data = await resp.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    // POST — create generation
    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const resp = await fetch('https://api.sonauto.ai/v1/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SONAUTO_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: body.prompt,
          title: body.title || 'My Song',
          duration: 240,
          make_instrumental: false,
        }),
      });
      const data = await resp.json();
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
