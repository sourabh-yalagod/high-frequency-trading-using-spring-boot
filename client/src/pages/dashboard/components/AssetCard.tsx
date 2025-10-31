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

  return (
    <div className="flex flex-col p-3 gap-2 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={icon}
            alt={name}
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = ICON_FALLBACK)}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <div className="text-sm font-semibold leading-5">{name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-lg font-bold leading-5 ${
              isUp ? "text-green-500" : isDown ? "text-red-500" : "text-blue-600 dark:text-blue-400"
            }`}
          >
            ${isNaN(current) ? "0.00" : current.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {prev && !isNaN(prev) ? `${(((current - prev) / prev) * 100).toFixed(2)}%` : "0.00%"}
          </div>
        </div>
      </div>

      <div className="h-1 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isUp ? "bg-green-400" : isDown ? "bg-red-400" : "bg-transparent"
          }`}
          style={{
            width:
              prev && !isNaN(prev)
                ? `${Math.min(Math.abs(((current - prev) / prev) * 100), 100)}%`
                : "0%",
          }}
        />
      </div>
    </div>
  );
};

export default AssetCard;
