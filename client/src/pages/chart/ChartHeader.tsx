import React from "react";

export interface MarketDetails {
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

interface ChartHeaderProps {
  marketPrice: MarketDetails;
}

const ChartHeader: React.FC<ChartHeaderProps> = ({ marketPrice }) => {
  if (!marketPrice) return null;

  const details = [
    { label: "Open", value: marketPrice.open },
    { label: "High", value: marketPrice.high },
    { label: "Low", value: marketPrice.low },
    { label: "Close", value: marketPrice.close },
    { label: "Volume", value: marketPrice.volume },
  ];

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Market Overview
        </h2>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 text-sm md:text-base">
          {details.map((item) => (
            <div key={item.label} className="flex flex-col sm:items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {item.label}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {parseFloat(item.value).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default ChartHeader;
