import { TrendingDown, TrendingUp } from "lucide-react";

const OrderSideSelector: React.FC<{
  orderSide: string;
  order: any;
  onChange: (side: string) => void;
}> = ({ orderSide, onChange,order }) => (
  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={() => onChange(order.side.buy)}
      className={`py-1.5 text-xs font-semibold rounded transition-all ${orderSide === order.side.buy
        ? "bg-green-500 text-white"
        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        }`}
    >
      <TrendingUp className="inline w-3 h-3 mr-1" />
      Buy
    </button>
    <button
      onClick={() => onChange(order.side.sell)}
      className={`py-1.5 text-xs font-semibold rounded transition-all ${orderSide === order.side.sell
        ? "bg-red-500 text-white"
        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        }`}
    >
      <TrendingDown className="inline w-3 h-3 mr-1" />
      Sell
    </button>
  </div>
);

export default OrderSideSelector;