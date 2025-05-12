import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

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
  const { data: session, status } = useSession();
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 0,
    eurBalance: 0,
    inOrders: 0,
    balances: []
  });
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function fetchBalanceAndPrices() {
      try {
        setError(null);
        setIsRetrying(false);

        const [balanceRes, pricesRes] = await Promise.all([
          fetch("/api/bitvavo/balance"),
          fetch("/api/bitvavo/prices")
        ]);

        if (!balanceRes.ok || !pricesRes.ok) {
          throw new Error(`HTTP error! status: ${!balanceRes.ok ? balanceRes.status : pricesRes.status}`);
        }

        const balances: BitvavoBalance[] = await balanceRes.json();
        const prices: BitvavoPrice[] = await pricesRes.json();

        const priceMap = prices.reduce((acc, price) => {
          if (price.market.endsWith("-EUR")) {
            const symbol = price.market.replace("-EUR", "");
            acc[symbol] = parseFloat(price.price);
          }
          return acc;
        }, {} as Record<string, number>);

        setPrices(priceMap);

        const eurBalance = balances.find((b) => b.symbol === "EUR");
        const eurAvailable = parseFloat(eurBalance?.available || "0");
        const eurInOrder = parseFloat(eurBalance?.inOrder || "0");

        const cryptoValue = balances
          .filter((b) => b.symbol !== "EUR")
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
          balances: balances.filter((b) => b.symbol !== "EUR")
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setError(message);
        setIsRetrying(true);
      }
    }

    fetchBalanceAndPrices();
    const interval = setInterval(fetchBalanceAndPrices, 60000);
    return () => clearInterval(interval);
  }, [status]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#1E2026] text-white flex items-center justify-center">
        <p>Sessie laden...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#1E2026] flex flex-col items-center justify-center text-center text-white p-8">
        <h1 className="text-3xl mb-4">Welkom bij het Bitvavo Dashboard 🚀</h1>
        <p className="text-gray-400 mb-6">Log in met GitHub om je balans te bekijken.</p>
        <button onClick={() => signIn("github")} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Inloggen met GitHub
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#1E2026] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <span>Ingelogd als <strong>{session.user?.name || session.user?.email}</strong></span>
        <button onClick={() => signOut()} className="bg-gray-600 px-3 py-1 rounded hover:bg-gray-500">Uitloggen</button>
      </div>

      <h1 className="text-2xl font-bold mb-4">✅ Deployed versie: v2.0 🚀</h1>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded mb-6">
          <p className="font-semibold">Error loading balance:</p>
          <p>{error}</p>
          {isRetrying && <p className="text-yellow-400 mt-2">Retrying to connect to Bitvavo API...</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2B2F36] p-6 rounded shadow">
          <h2 className="text-lg text-gray-300 mb-2">Portfolio Value</h2>
          <p className="text-3xl font-bold text-green-400 mb-1">€{portfolio.totalValue.toFixed(2)}</p>
          <p className="text-sm text-gray-400">{portfolio.balances.length} assets</p>
        </div>

        <div className="bg-[#2B2F36] p-6 rounded shadow">
          <h2 className="text-lg text-gray-300 mb-2">EUR Balance</h2>
          <p className="text-3xl font-bold text-blue-400 mb-1">€{portfolio.eurBalance.toFixed(2)}</p>
          <p className="text-sm text-gray-400">In orders: €{portfolio.inOrders.toFixed(2)}</p>
        </div>
      </div>

      {portfolio.balances.length > 0 && (
        <div className="bg-[#2B2F36] p-6 mt-6 rounded shadow">
          <h2 className="text-lg text-gray-300 mb-4">All Balances</h2>
          <div className="space-y-2">
            {portfolio.balances.map((balance) => {
              const price = prices[balance.symbol] || 0;
              const available = parseFloat(balance.available);
              const inOrder = parseFloat(balance.inOrder);
              const totalValue = (available + inOrder) * price;

              return (
                <div key={balance.symbol} className="flex justify-between border-b border-gray-700 pb-2">
                  <span className="text-gray-300">{balance.symbol}</span>
                  <div className="text-right">
                    <div>{available.toFixed(8)} <span className="text-gray-400">({totalValue.toFixed(2)} €)</span></div>
                    {inOrder > 0 && (
                      <div className="text-sm text-gray-500">
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
    </main>
  );
}
