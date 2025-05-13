import React from 'react';

interface DashboardOverviewProps {
  totalValue: number;
  change24h: number;
  assetCount: number;
  eurBalance: number;
  eurInOrders: number;
  coins: Array<{
    symbol: string;
    amount: number | string;
    eurValue?: number | string;
  }>;
  onRefresh: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  totalValue,
  change24h,
  assetCount,
  eurBalance,
  eurInOrders,
  coins,
  onRefresh
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Responsive grid: 1 col on small screens, 2 cols on md+ */}
      {/* New cards can be added easily by adding more <div> items below */}
      {/* Portfolio Value Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {/* Card title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Portfolio Value
        </h3>
        {/* Main portfolio value */}
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          €{typeof totalValue === 'number' ? totalValue.toFixed(2) : totalValue}
        </p>
        {/* 24h change and asset count (labels and values) */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          24h Change:{" "}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {typeof change24h === 'number' ? change24h.toFixed(2) : change24h}% 
          </span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Assets:{" "}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            {assetCount}
          </span>
        </p>
      </div>

      {/* EUR Balance Card */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        {/* Card title with refresh action */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            EUR Balance
          </h3>
          {/* Refresh button to trigger balance update */}
          <button 
            onClick={onRefresh} 
            className="text-sm text-blue-600 dark:text-blue-500 hover:underline"
            aria-label="Refresh balance"
          >
            ↻
          </button>
        </div>
        {/* Main EUR balance value */}
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          €{typeof eurBalance === 'number' ? eurBalance.toFixed(2) : eurBalance}
        </p>
        {/* EUR in orders as secondary info */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          In orders:{" "}
          <span className="font-medium text-gray-800 dark:text-gray-200">
            €{typeof eurInOrders === 'number' ? eurInOrders.toFixed(2) : eurInOrders}
          </span>
        </p>
      </div>

      {/* All Balances Card (coin list) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow md:col-span-2">
        {/* Card title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          All Balances
        </h3>
        {/* Coin list with symbol, amount and value */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {coins.map((coin, index) => (
            <div key={coin.symbol + index} className="flex justify-between py-2 text-sm">
              <span className="text-gray-800 dark:text-gray-200">{coin.symbol}</span>
              <span className="text-gray-800 dark:text-gray-200">
                {typeof coin.amount === 'number' ? coin.amount.toFixed(8) : coin.amount}{" "}
                {coin.eurValue !== undefined && (
                  <span className="text-gray-600 dark:text-gray-400">
                    ({typeof coin.eurValue === 'number' ? coin.eurValue.toFixed(2) : coin.eurValue} €)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
