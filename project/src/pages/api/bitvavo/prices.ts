import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ 1. Controleer sessie
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Niet geautoriseerd (sessie ontbreekt)' });
  }

  // ✅ 2. Alleen GET toestaan
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // ✅ 3. API keys checken
  const { BITVAVO_API_KEY, BITVAVO_API_SECRET } = process.env;
  if (!BITVAVO_API_KEY || !BITVAVO_API_SECRET) {
    console.error('Bitvavo credentials not provided');
    return res.status(500).json({ error: 'Bitvavo credentials ontbreken' });
  }

  try {
    // ✅ 4. Initialiseer Bitvavo client via SDK
    const Bitvavo = (await import('bitvavo')).default;
    const bitvavo = Bitvavo().options({
      APIKEY: BITVAVO_API_KEY,
      APISECRET: BITVAVO_API_SECRET,
      ACCESSWINDOW: 10000,
      RESTURL: 'https://api.bitvavo.com/v2',
      WSURL: 'wss://ws.bitvavo.com/v2/'
    });

    // ✅ 5. Haal alle tickers op en filter op EUR-paren
    const allPrices = await bitvavo.tickerPrice({});
    const eurPrices = allPrices.filter((p: { market: string }) =>
      p.market.endsWith('-EUR')
    );

    return res.status(200).json(eurPrices);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Fout bij ophalen van prijzen:', error.message);
      return res.status(500).json({ error: error.message });
    } else {
      console.error('Onbekende fout:', error);
      return res.status(500).json({ error: 'Onbekende fout bij ophalen van prijzen.' });
    }
  }
}
