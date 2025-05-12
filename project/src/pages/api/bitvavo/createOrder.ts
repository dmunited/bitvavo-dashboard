import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

// ✅ Zet de interface buiten de functie
interface OrderPayload {
  market: string;
  side: 'buy' | 'sell';
  amount: string;
  price?: string;
  orderType: 'limit' | 'market';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ✅ Sessiecheck
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Niet geautoriseerd (sessie ontbreekt)' });
  }

  // ✅ Alleen POST toestaan
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  // ✅ Controleer aanwezigheid van API-sleutels
  const { BITVAVO_API_KEY, BITVAVO_API_SECRET } = process.env;
  if (!BITVAVO_API_KEY || !BITVAVO_API_SECRET) {
    console.error('Bitvavo credentials not provided');
    return res.status(500).json({ error: 'Bitvavo credentials not provided' });
  }

  try {
    const { market, side, amount, price, orderType } = req.body;

    const Bitvavo = (await import('bitvavo')).default;
    const bitvavo = Bitvavo().options({
      APIKEY: BITVAVO_API_KEY,
      APISECRET: BITVAVO_API_SECRET,
      RESTURL: 'https://api.bitvavo.com/v2',
      WSURL: 'wss://ws.bitvavo.com/v2/',
      ACCESSWINDOW: 10000
    });

    let orderPayload: OrderPayload;

    if (orderType === 'limit') {
      orderPayload = {
        market,
        side,
        amount,
        price,
        orderType: 'limit'
      };
    } else {
      orderPayload = {
        market,
        side,
        amount,
        orderType: 'market'
      };
    }

    const result = await bitvavo.placeOrder(orderPayload);
    return res.status(200).json(result);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Fout bij order plaatsen:', error.message);
      return res.status(500).json({ error: error.message });
    } else {
      console.error('Onbekende fout:', error);
      return res.status(500).json({ error: 'Onbekende fout bij order plaatsen.' });
    }
  }
}
