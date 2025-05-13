import { RefreshCcw } from "lucide-react";

interface Coin {
  symbol: string;
  available: number;
  inOrders: number;
  totalEurValue: number;
}

interface DashboardOverviewProps {
  totalValue: number;
  change24h: number;
  assetCount: number;
  eurBalance: number;
  eurInOrders: number;
  coins: Coin[];
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
}: DashboardOverviewProps) {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Portfolio Value */}
      <div className="bg-[#2B2F36] rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-300 text-lg">Portfolio Value</h2>
          <span className="text-green-500 text-sm">↗</span>
        </div>
        <div className="text-3xl font-bold text-green-500 mb-2">
          €{totalValue.toFixed(2)}
        </div>
        <div className="text-sm text-gray-400">
          24h change: {change24h.toFixed(2)}%
        </div>
        <div className="text-sm text-gray-400">
          {assetCount} assets
        </div>
      </div>

      {/* EUR Balance */}
      <div className="bg-[#2B2F36] rounded-lg p-6 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-300 text-lg">EUR Balance</h2>
          <RefreshCcw
            className="text-gray-400 cursor-pointer hover:text-gray-300"
            size={18}
            onClick={onRefresh}
          />
        </div>
        <div className="text-3xl font-bold text-blue-500 mb-2">
          €{eurBalance.toFixed(2)}
        </div>
        <div className="text-sm text-gray-400">
          In orders: €{eurInOrders.toFixed(2)}
        </div>
      </div>

      {/* All Balances */}
      {coins.length > 0 && (
        <div className="md:col-span-2 bg-[#2B2F36] rounded-lg p-6 shadow-md">
          <h2 className="text-gray-300 text-lg mb-4">All Balances</h2>
<div className="grid gap-4">
  {coins.map((coin) => (
    <div
      key={coin.symbol}
      className="flex justify-between items-start border-b border-gray-700 pb-2 text-gray-300"
    >
      <div className="font-medium">{coin.symbol}</div>
      <div className="text-right">
        <div className="text-sm">
          {coin.available.toFixed(8)}{" "}
          <span className="text-gray-400">({coin.totalEurValue.toFixed(2)} €)</span>
        </div>
        {coin.inOrders > 0 && (
          <div className="text-xs text-gray-500">
            In orders: {coin.inOrders.toFixed(8)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}