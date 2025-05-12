import { createHmac } from 'crypto';

export interface BitvavoOrderPayload {
  market: string;
  side: 'buy' | 'sell';
  amount: string;
  orderType: 'limit' | 'market';
  price?: string;
}

export interface BitvavoOrderResponse {
  orderId: string;
  market: string;
  side: 'buy' | 'sell';
  amount: string;
  price?: string;
  status: string;
  orderType: 'limit' | 'market';
  timestamp: number;
}

export interface BitvavoPrice {
  market: string;
  price: string;
}

function createSignature(timestamp: string, method: string, url: string, body: string = ''): string {
  if (!process.env.BITVAVO_API_SECRET) {
    throw new Error('BITVAVO_API_SECRET is not configured');
  }
  const message = timestamp + method + '/v2/' + url + body;
  return createHmac('sha256', process.env.BITVAVO_API_SECRET).update(message).digest('hex');
}

export async function getPrices(): Promise<BitvavoPrice[]> {
  if (!process.env.BITVAVO_API_KEY) {
    throw new Error('BITVAVO_API_KEY is not configured');
  }

  const timestamp = Date.now().toString();
  const signature = createSignature(timestamp, 'GET', 'ticker/price');

  try {
    const response = await fetch('https://api.bitvavo.com/v2/ticker/price', {
      headers: {
        'BITVAVO-ACCESS-KEY': process.env.BITVAVO_API_KEY,
        'BITVAVO-ACCESS-SIGNATURE': signature,
        'BITVAVO-ACCESS-TIMESTAMP': timestamp,
        'BITVAVO-ACCESS-WINDOW': '10000',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch prices: ${response.status} - ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
}

export async function createOrder(payload: BitvavoOrderPayload): Promise<BitvavoOrderResponse> {
  if (!process.env.BITVAVO_API_KEY) {
    throw new Error('BITVAVO_API_KEY is not configured');
  }

  const { market, side, amount, orderType, price } = payload;
  const timestamp = Date.now().toString();
  const body = JSON.stringify({
    market,
    side,
    amount,
    orderType,
    ...(price && { price }),
  });
  
  const signature = createSignature(timestamp, 'POST', 'order', body);

  try {
    const response = await fetch('https://api.bitvavo.com/v2/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'BITVAVO-ACCESS-KEY': process.env.BITVAVO_API_KEY,
        'BITVAVO-ACCESS-SIGNATURE': signature,
        'BITVAVO-ACCESS-TIMESTAMP': timestamp,
        'BITVAVO-ACCESS-WINDOW': '10000',
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create order: ${response.status} - ${error}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}