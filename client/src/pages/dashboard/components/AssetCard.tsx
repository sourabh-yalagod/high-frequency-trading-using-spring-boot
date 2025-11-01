import { useNavigate } from "react-router-dom";

type AssetCardProps = {
  icon: string;
  name: string;
  symbol: string;
  price: string;
  prevPrice?: string;
  changeDir?: "up" | "down" | null;
};

const ICON_FALLBACK = "https://via.placeholder.com/64?text=coin";

const AssetCard = ({ icon, name, symbol, price, prevPrice, changeDir }: AssetCardProps) => {
  const current = parseFloat(price || "0");
  const prev = parseFloat(prevPrice || price || "0");
  const isUp = changeDir === "up";
  const isDown = changeDir === "down";
  const navigate = useNavigate()
  const percentChange = prev && !isNaN(prev) ? (((current - prev) / prev) * 100) : 0;
  const percentChangeAbs = Math.abs(percentChange);

  const handleClick = () => {
    navigate("/chart/" + symbol)
    console.log(`Navigate to /chart/${symbol}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center justify-between cursor-pointer px-2 py-1.5 gap-2 
                 border rounded-lg dark:border-gray-700 bg-gray-50 dark:bg-gray-800 
                 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm
                 transition-all duration-200 overflow-hidden min-w-0"
    >
      {/* Left: Icon and Name */}
      <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
        <img
          src={icon}
          alt={name}
          onError={(e) => ((e.currentTarget as HTMLImageElement).src = ICON_FALLBACK)}
          className="w-6 h-6 rounded-full flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-[11px] xl:text-[14px] font-semibold leading-tight truncate text-gray-900 dark:text-gray-100">
            {name}
          </div>
          <div className="text-[9px] xl:text-[12px] text-gray-500 dark:text-gray-400 truncate leading-tight">
            {symbol}
          </div>
        </div>
      </div>

      {/* Right: Price and Change */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Price */}
        <div className="text-right">
          <div
            className={`text-xs font-bold leading-tight whitespace-nowrap ${isUp
              ? "text-green-600 dark:text-green-400"
              : isDown
                ? "text-red-600 dark:text-red-400"
                : "text-blue-600 dark:text-blue-400"
              }`}
          >
            ${isNaN(current) ? "0.00" : current.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className={`text-[9px] xl:text-[12px] font-medium whitespace-nowrap leading-tight ${isUp
            ? "text-green-600 dark:text-green-400"
            : isDown
              ? "text-red-600 dark:text-red-400"
              : "text-gray-500 dark:text-gray-400"
            }`}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;