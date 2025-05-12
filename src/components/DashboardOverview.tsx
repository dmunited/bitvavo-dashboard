import { FC } from 'react';

interface CoinBalance {
  symbol: string;
  available: number;
  inOrders: number;
  totalEurValue: number;
}

interface DashboardProps {
  totalValue: number;
  change24h: number;
  assetCount: number;
  eurBalance: number;
  eurInOrders: number;
  coins: CoinBalance[];
  onRefresh?: () => void;
}

export const DashboardOverview: FC<DashboardProps> = ({
  totalValue,
  change24h,
  assetCount,
  eurBalance,
  eurInOrders,
  coins,
  onRefresh
}) => {
  const isPositiveChange = change24h >= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Portfolio Value Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#2B2F36] rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-300 text-lg font-medium">Portfolio Value</h2>
            <span className={isPositiveChange ? "text-green-500" : "text-red-500"}>
              {isPositiveChange ? "↗" : "↘"}
            </span>
          </div>
          <div className="text-3xl font-bold text-green-500 mb-2">
            €{totalValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>{assetCount} assets</span>
            <span className={`${isPositiveChange ? "text-green-400" : "text-red-400"}`}>
              {isPositiveChange ? "+" : ""}{change24h.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* EUR Balance Card */}
        <div className="bg-[#2B2F36] rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-300 text-lg font-medium">EUR Balance</h2>
            <button 
              onClick={onRefresh}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Refresh balance"
            >
              ↻
            </button>
          </div>
          <div className="text-3xl font-bold text-blue-500 mb-2">
            €{eurBalance.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-400">
            In orders: €{eurInOrders.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Coin Balances List */}
      <div className="bg-[#2B2F36] rounded-lg p-6 shadow-lg">
        <h2 className="text-gray-300 text-lg font-medium mb-4">All Balances</h2>
        <ul className="divide-y divide-gray-700">
          {coins.map((coin) => (
            <li key={coin.symbol} className="py-4 first:pt-0 last:pb-0">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-gray-300 font-medium">{coin.symbol}</span>
                  <span className="text-sm text-gray-400">
                    {coin.available.toFixed(8)} available
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-gray-300">
                    €{coin.totalEurValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {coin.inOrders > 0 && (
                    <span className="text-sm text-gray-400">
                      {coin.inOrders.toFixed(8)} in orders
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};