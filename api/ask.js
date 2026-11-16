// Vercel Serverless Function for RAG Textbook Chatbot
// Reads configuration from Environment Variables

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
const COHERE_API_KEY = process.env.COHERE_API_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const MODEL_NAME = process.env.MODEL_NAME || 'baidu/ernie-5.5-flash-preview:free';

async function retrieveContext(query) {
  try {
    if (!COHERE_API_KEY || !QDRANT_URL || !QDRANT_API_KEY) {
      console.warn('Qdrant/Cohere environment variables not set.');
      return '';
    }

    // 1. Generate Query Vector via Cohere
    const cohereRes = await fetch('https://api.cohere.com/v1/embed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        texts: [query],
        model: 'embed-english-v3.0',
        input_type: 'search_query'
      })
    });

    if (!cohereRes.ok) {
      console.error('Cohere embed error:', await cohereRes.text());
      return '';
    }

    const cohereData = await cohereRes.json();
    const queryVector = cohereData.embeddings[0];

    // 2. Search Qdrant Cluster
    const qdrantRes = await fetch(`${QDRANT_URL.replace(/\/$/, '')}/collections/humanoid_ai_book/points/search`, {
      method: 'POST',
      headers: {
        'api-key': QDRANT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vector: queryVector,
        limit: 4,
        with_payload: true
      })
    });

    if (!qdrantRes.ok) {
      console.error('Qdrant search error:', await qdrantRes.text());
      return '';
    }

    const qdrantData = await qdrantRes.json();
    const points = qdrantData.result || [];

    let context = '';
    for (const point of points) {
      const payload = point.payload || {};
      context += `--- SOURCE: ${payload.url || 'Textbook'} | ${payload.chapter || ''} - ${payload.section || ''} ---\n${payload.text || ''}\n\n`;
    }
    return context;
  } catch (err) {
    console.error('Retrieval error:', err);
    return '';
  }
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      service: 'Physical AI Book RAG Backend (Vercel Serverless)',
      status: 'online',
      model: MODEL_NAME,
      endpoints: {
        ask: 'POST /api/ask with { "message": "..." }'
      }
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body || {};
    const userQuery = (message || '').trim();

    if (!userQuery) {
      return res.status(200).json({ reply: 'Please provide a question about Physical AI or Humanoid Robotics.' });
    }

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ detail: 'OPENROUTER_API_KEY environment variable is not configured on Vercel.' });
    }

    // 1. Retrieve relevant chunks from Qdrant
    const retrievedContext = await retrieveContext(userQuery);

    // 2. Call OpenRouter with Baidu Ernie
    const systemPrompt = `You are the specialized AI Assistant for the 'Physical AI & Humanoid Robotics' textbook.
Strict Rules:
1. Primary Source: Ground your answers in the textbook content retrieved below.
2. Structure your answers with clear Markdown formatting (headings, bullet points, technical highlights).
3. If the user asks about unrelated general topics, politely decline.
4. Textbook scope includes ROS 2, NVIDIA Isaac, Isaac Sim, URDF, Gazebo, Vision-Language-Action (VLA) models, sensors, embodied intelligence, and humanoid robot hardware.

Textbook Knowledge:
${retrievedContext || 'General textbook scope on Physical AI & Humanoid Robotics.'}`;

    const openRouterRes = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userQuery }
        ]
      })
    });

    if (!openRouterRes.ok) {
      const errText = await openRouterRes.text();
      console.error('OpenRouter API error:', errText);
      return res.status(500).json({ detail: `OpenRouter error: ${errText}` });
    }

    const completion = await openRouterRes.json();
    const reply = completion.choices?.[0]?.message?.content || 'No reply generated.';

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ detail: error.message || 'Internal server error' });
  }
};
