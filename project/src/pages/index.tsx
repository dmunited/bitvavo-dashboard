import { useEffect, useState } from "react";

interface BitvavoBalance {
  symbol: string;
  available: string;
  inOrder: string;
}

interface BitvavoPrice {
  market: string;
  price: string;
}

interface PortfolioData {
  totalValue: number;
  eurBalance: number;
  inOrders: number;
  balances: BitvavoBalance[];
}

export default function Home() {
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 0,
    eurBalance: 0,
    inOrders: 0,
    balances: []
  });
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    async function fetchBalanceAndPrices() {
      try {
        setLoading(true);
        setError(null);
        setIsRetrying(false);
        
        // Fetch balances and prices in parallel
        const [balanceRes, pricesRes] = await Promise.all([
          fetch("/api/bitvavo/balance"),
          fetch("/api/bitvavo/prices")
        ]);
        
        if (!balanceRes.ok || !pricesRes.ok) {
          throw new Error(`HTTP error! status: ${!balanceRes.ok ? balanceRes.status : pricesRes.status}`);
        }
        
        const balances: BitvavoBalance[] = await balanceRes.json();
        const prices: BitvavoPrice[] = await pricesRes.json();
        
        if (!Array.isArray(balances)) {
          throw new Error("Invalid response format from API");
        }

        // Create a price lookup map for EUR pairs
        const priceMap = prices.reduce((acc, price) => {
          if (price.market.endsWith('-EUR')) {
            const symbol = price.market.replace('-EUR', '');
            acc[symbol] = parseFloat(price.price);
          }
          return acc;
        }, {} as Record<string, number>);

        setPrices(priceMap);

        // Find EUR balance
        const eurBalance = balances.find(b => b.symbol === "EUR");
        const eurAvailable = parseFloat(eurBalance?.available || "0");
        const eurInOrder = parseFloat(eurBalance?.inOrder || "0");

        // Calculate total value in EUR
        const cryptoValue = balances
          .filter(b => b.symbol !== "EUR")
          .reduce((acc, balance) => {
            const price = priceMap[balance.symbol] || 0;
            const total = (parseFloat(balance.available) + parseFloat(balance.inOrder)) * price;
            return acc + total;
          }, 0);

        const totalValue = cryptoValue + eurAvailable + eurInOrder;
        
        setPortfolio({
          totalValue,
          eurBalance: eurAvailable,
          inOrders: eurInOrder,
          balances: balances.filter(b => b.symbol !== "EUR") // Remove EUR from balances list
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setError(message);
        setIsRetrying(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBalanceAndPrices();
    const interval = setInterval(fetchBalanceAndPrices, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#1E2026] p-8 flex items-center justify-center">
        <div className="text-gray-300">Loading balance data...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1E2026] p-8">
      {error && (
        <div className="max-w-4xl mx-auto mb-6 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
          <p className="font-semibold">Error loading balance:</p>
          <p>{error}</p>
          {isRetrying && (
            <p className="mt-2 text-yellow-500">
              Retrying to connect to Bitvavo API...
            </p>
          )}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2B2F36] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-300 text-lg">Portfolio Value</h2>
            <span className="text-green-500">↗</span>
          </div>
          <div className="text-3xl font-bold text-green-500 mb-2">
            €{portfolio.totalValue.toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm">
            {portfolio.balances.length} assets
          </div>
        </div>

        <div className="bg-[#2B2F36] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-300 text-lg">EUR Balance</h2>
            <span className="text-gray-400">↻</span>
          </div>
          <div className="text-3xl font-bold text-blue-500 mb-2">
            €{portfolio.eurBalance.toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm">
            In orders: €{portfolio.inOrders.toFixed(2)}
          </div>
        </div>

        {portfolio.balances.length > 0 && (
          <div className="md:col-span-2 bg-[#2B2F36] rounded-lg p-6">
            <h2 className="text-gray-300 text-lg mb-4">All Balances</h2>
            <div className="grid gap-4">
              {portfolio.balances.map(balance => {
                const price = prices[balance.symbol] || 0;
                const available = parseFloat(balance.available);
                const inOrder = parseFloat(balance.inOrder);
                const totalValue = (available + inOrder) * price;

                return (
                  <div key={balance.symbol} className="flex justify-between items-center border-b border-gray-700 pb-2">
                    <span className="text-gray-300">{balance.symbol}</span>
                    <div className="text-right">
                      <div className="text-gray-300">
                        {available.toFixed(8)} ({totalValue.toFixed(2)} €)
                      </div>
                      {inOrder > 0 && (
                        <div className="text-sm text-gray-400">
                          In orders: {inOrder.toFixed(8)} ({(inOrder * price).toFixed(2)} €)
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
