import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // Ensure API credentials are provided
  const { BITVAVO_API_KEY, BITVAVO_API_SECRET } = process.env;
  if (!BITVAVO_API_KEY || !BITVAVO_API_SECRET) {
    console.error('Bitvavo credentials not provided');
    return res.status(500).json({ error: 'Bitvavo credentials not provided' });
  }

  try {
    // Dynamically import the Bitvavo client
    const Bitvavo = (await import('bitvavo')).default;
    const bitvavoClient = Bitvavo().options({
      APIKEY: BITVAVO_API_KEY,
      APISECRET: BITVAVO_API_SECRET,
      ACCESSWINDOW: 10000,
      RESTURL: 'https://api.bitvavo.com/v2',
      WSURL: 'wss://ws.bitvavo.com/v2/'
    });

    // Attempt to retrieve balance with retry logic
    let balanceData;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        balanceData = await bitvavoClient.balance({});
        break;
      } catch (err) {
        console.warn(`Bitvavo balance fetch attempt ${attempt} failed`, err);
        if (attempt === 3) {
          throw err;
        }
      }
    }

    return res.status(200).json(balanceData);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error fetching Bitvavo balance:', error.message);
      return res.status(500).json({ error: error.message });
    } else {
      console.error('Unknown error:', error);
      return res.status(500).json({ error: 'Onbekende fout opgetreden bij ophalen van balans.' });
    }
  }
}

