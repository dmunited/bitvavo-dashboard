import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Not authorized (session missing)' });
    }

    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }

    const { BITVAVO_API_KEY, BITVAVO_API_SECRET } = process.env;
    if (!BITVAVO_API_KEY || !BITVAVO_API_SECRET) {
      console.error('Bitvavo credentials not provided');
      return res.status(500).json({ error: 'Bitvavo API credentials not configured' });
    }

    const Bitvavo = (await import('bitvavo')).default;
    const bitvavoClient = Bitvavo().options({
      APIKEY: BITVAVO_API_KEY,
      APISECRET: BITVAVO_API_SECRET,
      ACCESSWINDOW: 10000,
      RESTURL: 'https://api.bitvavo.com/v2',
      WSURL: 'wss://ws.bitvavo.com/v2/',
      DEBUG: true // Enable debug logging
    });

    let balanceData;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        balanceData = await bitvavoClient.balance({});
        break;
      } catch (err) {
        console.warn(`Bitvavo balance fetch attempt ${attempt} failed:`, err);
        if (attempt === 3) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }

    return res.status(200).json(balanceData);
  } catch (error: unknown) {
    console.error('Error in balance handler:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred while fetching balance' });
  }
}