import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ 1. Sessiecontrole — alleen ingelogde gebruikers mogen door
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Niet geautoriseerd (sessie ontbreekt)' });
  }

  // ✅ 2. Alleen GET-requests toestaan
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // ✅ 3. API-credentials controleren
  const { BITVAVO_API_KEY, BITVAVO_API_SECRET } = process.env;
  console.log('BITVAVO_API_KEY:', process.env.BITVAVO_API_KEY);
console.log('BITVAVO_API_SECRET:', process.env.BITVAVO_API_SECRET);

  if (!BITVAVO_API_KEY || !BITVAVO_API_SECRET) {
    console.error('Bitvavo credentials not provided');
    return res.status(500).json({ error: 'Bitvavo credentials not provided' });
  }

  try {
    // ✅ 4. Dynamische import van Bitvavo SDK
    const Bitvavo = (await import('bitvavo')).default;
    const bitvavoClient = Bitvavo().options({
      APIKEY: BITVAVO_API_KEY,
      APISECRET: BITVAVO_API_SECRET,
      ACCESSWINDOW: 10000,
      RESTURL: 'https://api.bitvavo.com/v2',
      WSURL: 'wss://ws.bitvavo.com/v2/'
    });

    // ✅ 5. Retry-mechanisme bij ophalen balans
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

    // ✅ 6. Succesvol antwoord
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
