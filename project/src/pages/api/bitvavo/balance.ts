import type { NextApiRequest, NextApiResponse } from 'next';

// Type definitions for Bitvavo client and balance data
interface BitvavoBalance {
  symbol: string;
  available: string;
  inOrder: string;
}

interface BitvavoClient {
  options: (config: {
    APIKEY: string;
    APISECRET: string;
    RESTURL: string;
    ACCESSWINDOW: number;
  }) => BitvavoClient;
  balance: (options: Record<string, never>) => Promise<BitvavoBalance[]>;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchBalanceWithRetry(bitvavoClient: BitvavoClient, retryCount = 0): Promise<BitvavoBalance[]> {
  try {
    return await bitvavoClient.balance({});
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      throw error;
    }

    // Calculate exponential backoff delay
    const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
    console.log(`[INFO] Retry attempt ${retryCount + 1}/${MAX_RETRIES} after ${delay}ms`);
    
    await sleep(delay);
    return fetchBalanceWithRetry(bitvavoClient, retryCount + 1);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Read API credentials from env
  const apiKey = process.env.BITVAVO_API_KEY;
  const apiSecret = process.env.BITVAVO_API_SECRET;
  const apiUrl = process.env.BITVAVO_API_URL || 'https://api.bitvavo.com/v2';

  // Check if API credentials are present
  if (!apiKey || !apiSecret) {
    console.error('[ERROR] Bitvavo API credentials missing. Check your .env settings.');
    return res.status(500).json({ error: 'API credentials not configured. Please check your .env file.' });
  }

  try {
    // Initialize Bitvavo client with API key and secret using dynamic import
    const bitvavoClient = (await import('bitvavo')).default().options({
      APIKEY: apiKey,
      APISECRET: apiSecret,
      RESTURL: apiUrl,
      ACCESSWINDOW: 10000,
    });

    // Fetch balance data with retry mechanism
    const balanceData = await fetchBalanceWithRetry(bitvavoClient);
    return res.status(200).json(balanceData);
  } catch (err) {
    console.error('[ERROR] Error fetching balance:', err);
    return res.status(500).json({ 
      error: 'Error fetching balance data',
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}