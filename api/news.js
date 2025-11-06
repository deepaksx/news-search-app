/**
 * Vercel Serverless Function - News API Proxy
 * This function runs on Vercel's servers and proxies requests to NewsAPI.org
 * Solves CORS issues by making server-side requests
 */

export default async function handler(req, res) {
  // Enable CORS for your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint, ...params } = req.query;

  // Validate endpoint
  const validEndpoints = ['top-headlines', 'everything'];
  if (!validEndpoints.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  try {
    // Build NewsAPI.org URL
    const apiUrl = new URL(`https://newsapi.org/v2/${endpoint}`);

    // Add query parameters
    Object.keys(params).forEach(key => {
      apiUrl.searchParams.append(key, params[key]);
    });

    // Make request to NewsAPI.org with API key from environment
    const response = await fetch(apiUrl.toString(), {
      headers: {
        'X-Api-Key': process.env.VITE_NEWS_API_KEY
      }
    });

    const data = await response.json();

    // Return the data
    return res.status(response.status).json(data);

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch news',
      message: error.message
    });
  }
}
