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

  // Function to determine color based on movement
  const getTextColor = (label: string, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "text-blue-600 dark:text-blue-400"; // default
    if (label === "Low") return "text-red-500"; // low is usually red
    if (label === "High") return "text-green-500"; // high is green
    if (label === "Close") {
      if (num > parseFloat(marketPrice.open)) return "text-green-500";
      if (num < parseFloat(marketPrice.open)) return "text-red-500";
    }
    return "text-blue-600 dark:text-blue-400";
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title */}
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white tracking-wide">
          Market Overview
        </h2>

        {/* Market Data */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4 sm:gap-6 text-sm md:text-base">
          {details.map((item) => (
            <div
              key={item.label}
              className="flex flex-col sm:items-center rounded-xl px-4 py-3 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {item.label}
              </span>
              <span
                className={`font-semibold mt-1 ${getTextColor(
                  item.label,
                  item.value
                )}`}
              >
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
