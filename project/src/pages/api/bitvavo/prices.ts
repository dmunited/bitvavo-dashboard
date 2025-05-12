import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

type PriceResponse = {
  market: string;
  price: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Sessiecheck
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Niet geautoriseerd (sessie ontbreekt)' });
  }

  // ✅ Alleen GET toestaan
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const response = await fetch('https://api.bitvavo.com/v2/markets');
    const markets = await response.json();

    // Simpele filter op EUR-markten
    const eurMarkets = markets.filter((m: any) => m.quote === 'EUR');
    const prices: PriceResponse[] = [];

    for (const market of eurMarkets.slice(0, 10)) {
      const tickerRes = await fetch(`https://api.bitvavo.com/v2/${market.market}/ticker/price`);
      const ticker = await tickerRes.json();
      prices.push({ market: market.market, price: ticker.price });
    }

    return res.status(200).json(prices);
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
