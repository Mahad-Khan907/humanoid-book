const { Pool } = require('pg');

let authInstance = null;

async function getAuth(originUrl) {
  if (!authInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is missing.');
    }

    // Dynamic import because better-auth is pure ESM on Node 20+
    const { betterAuth } = await import('better-auth');

    const pool = new Pool({
      connectionString,
    });

    const trustedOrigins = [
      'https://book-bymahad.vercel.app',
      'http://localhost:3000',
      'http://localhost:3002'
    ];
    if (originUrl && !trustedOrigins.includes(originUrl)) {
      trustedOrigins.push(originUrl);
    }

    authInstance = betterAuth({
      database: pool,
      baseURL: process.env.BETTER_AUTH_URL || 'https://book-bymahad.vercel.app',
      secret: process.env.BETTER_AUTH_SECRET || 'iFoWEQS4bfEeQBjiiPDVSvcfvqMIcIeq',
      trustedOrigins: trustedOrigins,
      emailAndPassword: {
        enabled: true,
      },
      user: {
        additionalFields: {
          softwareBackground: { type: 'string' },
          hardwareBackground: { type: 'string' },
        },
      },
    });
  }
  return authInstance;
}

module.exports = async (req, res) => {
  // CORS Headers
  const origin = req.headers.origin || 'https://book-bymahad.vercel.app';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const auth = await getAuth(origin);

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'book-bymahad.vercel.app';
    const url = new URL(req.url, `${protocol}://${host}`);

    let body = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const webReq = new Request(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: body,
    });

    const webRes = await auth.handler(webReq);

    res.status(webRes.status);
    webRes.headers.forEach((val, key) => {
      res.setHeader(key, val);
    });

    const responseText = await webRes.text();
    return res.send(responseText);
  } catch (error) {
    console.error('Better-Auth Vercel error:', error);
    return res.status(500).json({ error: error.message || 'Authentication service error' });
  }
};
