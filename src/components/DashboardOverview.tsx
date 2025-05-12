import React from "react";

interface DashboardProps {
  totalValue: number;
  change24h: number;
  assetCount: number;
  eurBalance: number;
  eurInOrders: number;
  coins: Array<{
    symbol: string;
    available: number;
    inOrders: number;
    totalEurValue: number;
  }>;
  onRefresh: () => void;
}

export default function DashboardOverview({
  totalValue,
  change24h,
  assetCount,
  eurBalance,
  eurInOrders,
  coins,
  onRefresh
}: DashboardProps) {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Value Card */}
        <div className="bg-[#2B2F36] rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-300 text-lg">Portfolio Value</h2>
            <span className={`text-xl ${change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change24h >= 0 ? '↗' : '↘'}
            </span>
          </div>
          <div className="text-3xl font-bold text-green-500 mb-2">
            €{totalValue.toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm">
            {assetCount} {assetCount === 1 ? 'asset' : 'assets'}
          </div>
        </div>

        {/* EUR Balance Card */}
        <div className="bg-[#2B2F36] rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-300 text-lg">EUR Balance</h2>
            <button 
              onClick={onRefresh}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Refresh balance"
            >
              ↻
            </button>
          </div>
          <div className="text-3xl font-bold text-blue-500 mb-2">
            €{eurBalance.toFixed(2)}
          </div>
          <div className="text-gray-400 text-sm">
            In orders: €{eurInOrders.toFixed(2)}
          </div>
        </div>
      </div>

      {/* All Balances Table */}
      {coins.length > 0 && (
        <div className="bg-[#2B2F36] rounded-lg p-6 shadow-md">
          <h2 className="text-gray-300 text-lg mb-4">All Balances</h2>
          <div className="space-y-4">
            {coins.map(coin => (
              <div 
                key={coin.symbol}
                className="flex justify-between items-start border-b border-gray-700 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="text-gray-300 font-medium">{coin.symbol}</span>
                  <span className="text-sm text-gray-400">
                    Available: {coin.available.toFixed(8)}
                  </span>
                  {coin.inOrders > 0 && (
                    <span className="text-sm text-gray-400">
                      In orders: {coin.inOrders.toFixed(8)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-300">€{coin.totalEurValue.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}