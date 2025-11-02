import { useMemo, useState, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, Layers, AlertCircle } from "lucide-react";
import { useParams } from "react-router-dom";
import { order } from "../../../utils/assetConstant";

interface OrderPanelProps {
  userId: string;
  marketPrice: number;
  symbol?: string;
  placeOrder?: (payload: OrderPayload) => void;
}

interface OrderPayload {
  asset: string;
  userId: string;
  orderType: string;
  price: number | null;
  quantity: number;
  margin: number;
  status: string;
  orderSide: string;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  userId,
  marketPrice,
  placeOrder
}) => {
  
  const [orderType, setOrderType] = useState(order.type.limit);
  const [orderSide, setOrderSide] = useState(order.side.buy);
  const [price, setPrice] = useState<string>(marketPrice.toString());
  const [quantity, setQuantity] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { symbol } = useParams();

  const totalValue = useMemo(() => {
    const p = orderType === order.type.market ? marketPrice : parseFloat(price) || 0;
    const q = parseFloat(quantity) || 0;
    return p * q;
  }, [price, quantity, marketPrice, orderType]);

  const requiredMargin = useMemo(() => {
    return leverage > 0 ? totalValue / leverage : 0;
  }, [totalValue, leverage]);

  const handleSubmit = useCallback(() => {
    if (!quantity || parseFloat(quantity) <= 0) return;
    setIsSubmitting(true);
    const payload: OrderPayload = {
      asset: symbol?.toUpperCase() || "",
      userId,
      orderType,
      price: orderType === order.type.market ? marketPrice : parseFloat(price),
      quantity: parseFloat(quantity),
      margin: Number(requiredMargin?.toFixed(2)),
      status: order?.status?.pending,
      orderSide,
    };

    console.log("📦 Order Payload:", payload);
    placeOrder?.(payload);

    setTimeout(() => {
      setIsSubmitting(false);
      setQuantity("");
    }, 800);
  }, [userId, symbol, orderType, price, quantity, leverage, orderSide, placeOrder]);

  const resetForm = () => {
    setPrice(marketPrice.toString());
    setQuantity("");
    setLeverage(1);
  };

  return (
    <div className="w-full h-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-4 py-2 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{symbol}</h3>
          <div className="text-right">
            <p className="text-xs font-semibold text-white">${marketPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Order Type & Side */}
        <div className="grid grid-cols-2 gap-2">
          {Object.values(order.type).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`py-1.5 text-xs font-semibold rounded transition-all ${orderType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setOrderSide(order.side.buy)}
            className={`py-1.5 text-xs font-semibold rounded transition-all ${orderSide === order.side.buy
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
          >
            <TrendingUp className="inline w-3 h-3 mr-1" />
            Buy
          </button>
          <button
            onClick={() => setOrderSide(order.side.sell)}
            className={`py-1.5 text-xs font-semibold rounded transition-all ${orderSide === order.side.sell
                ? "bg-red-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
          >
            <TrendingDown className="inline w-3 h-3 mr-1" />
            Sell
          </button>
        </div>

        {/* Inputs */}
        {orderType === order.type.limit && (
          <div>
            <label className="flex items-center text-xs font-medium dark:text-gray-700 text-gray-300 mb-1">
              <DollarSign className="w-3 h-3 mr-1" />
              Price
            </label>
            <input
              type="number"
              value={price}
              step="0.01"
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>
        )}

        <div>
          <label className="flex items-center text-xs font-medium dark:text-gray-700 text-gray-300 mb-1">
            <Layers className="w-3 h-3 mr-1" />
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 outline-none"
            placeholder="0.00"
          />
        </div>

        {/* Leverage */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium dark:text-gray-700 text-gray-300">Leverage</label>
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-bold">
              {leverage}x
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded p-2.5 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Total</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">${totalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Margin</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">${requiredMargin.toFixed(2)}</span>
          </div>
        </div>

        {/* Warning */}
        {leverage > 20 && (
          <div className="flex items-start gap-1.5 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <AlertCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">High leverage warning</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={resetForm}
            className="flex-1 py-2 text-xs rounded font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
            className={`flex-1 py-2 text-xs rounded font-semibold text-white transition-all ${orderSide === order.side.buy
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
              } ${isSubmitting || !quantity ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Placing..." : `${orderSide} ${orderType}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;