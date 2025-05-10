import type { NextApiRequest, NextApiResponse } from 'next';
import { getPrices, BitvavoPrice } from '@/lib/bitvavo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BitvavoPrice[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const prices = await getPrices();
    res.status(200).json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch prices'
    });
  }
}