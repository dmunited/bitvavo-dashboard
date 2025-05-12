import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import DashboardOverview from "./DashboardOverview";

// Version marker test from Bolt – v1.8

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

  const fetchBalanceAndPrices = async () => {
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
      const pricesList: BitvavoPrice[] = await pricesRes.json();

      const priceMap = pricesList.reduce((acc, { market, price }) => {
        if (market.endsWith("-EUR")) {
          const symbol = market.replace("-EUR", "");
          acc[symbol] = parseFloat(price);
        }
        return acc;
      }, {} as Record<string, number>);

      setPrices(priceMap);

      const eurBalance = balances.find(b => b.symbol === "EUR");
      const eurAvailable = parseFloat(eurBalance?.available || "0");
      const eurInOrder = parseFloat(eurBalance?.inOrder || "0");

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
        balances: balances.filter(b => b.symbol !== "EUR")
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
      setIsRetrying(true);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    fetchBalanceAndPrices();
    const interval = setInterval(fetchBalanceAndPrices, 60000);
    return () => clearInterval(interval);
  }, [status]);

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-[#1E2026] p-8 flex items-center justify-center">
        <div className="text-gray-300">Loading session...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#1E2026] p-8 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl text-white mb-4">Welcome to Bitvavo Dashboard 🚀</h1>
        <p className="text-gray-400 mb-6">Sign in with GitHub to view your balance.</p>
        <button
          onClick={() => signIn("github")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Sign in with GitHub
        </button>
      </main>
    );
  }

  const coins = portfolio.balances.map(balance => ({
    symbol: balance.symbol,
    available: parseFloat(balance.available),
    inOrders: parseFloat(balance.inOrder),
    totalEurValue: (parseFloat(balance.available) + parseFloat(balance.inOrder)) * (prices[balance.symbol] || 0)
  }));

  return (
    <main className="min-h-screen bg-[#1E2026] p-8 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="text-gray-300">
            Signed in as <strong>{session.user?.name || session.user?.email}</strong>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Sign out
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            <p className="font-semibold">Error loading balance:</p>
            <p>{error}</p>
            {isRetrying && (
              <p className="mt-2 text-yellow-500">
                Retrying to connect to Bitvavo API...
              </p>
            )}
          </div>
        )}

        <DashboardOverview
          totalValue={portfolio.totalValue}
          change24h={0} // You might want to calculate this from historical data
          assetCount={portfolio.balances.length}
          eurBalance={portfolio.eurBalance}
          eurInOrders={portfolio.inOrders}
          coins={coins}
          onRefresh={fetchBalanceAndPrices}
        />
      </div>
    </main>
  );
}