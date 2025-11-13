import { useMemo, useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, Layers, AlertCircle, Loader } from "lucide-react";
import { useParams } from "react-router-dom";
import { order } from "../../../utils/assetConstant";
import { getUserId } from "../../../utils/jwt";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userToastMessages } from "../../../utils/userToastMessages";
import { getUserDetails, placeOrder } from "../../../store/apis";
import { FcMoneyTransfer } from "react-icons/fc";
import useUpdateTanstackCache from "../../../hooks/useUpdateTanstackCache";

interface OrderPanelProps {
  userId: string;
  marketPrice: number;
  setOrders: any
}

interface OrderPayload {
  asset: string;
  orderId: string;
  userId: string;
  orderType: string;
  price: number | null;
  quantity: number;
  margin: number;
  status: string;
  orderSide: string;
  callUrl: string;
}

const OrderTypeSelector: React.FC<{
  orderType: string;
  onChange: (type: string) => void;
}> = ({ orderType, onChange }) => (
  <div className="grid grid-cols-2 gap-2">
    {Object.values(order.type).map((type) => (
      <button
        key={type}
        onClick={() => onChange(type)}
        className={`py-1.5 text-xs font-semibold rounded transition-all ${orderType === type
          ? "bg-blue-600 text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
      >
        {type}
      </button>
    ))}
  </div>
);

const OrderSideSelector: React.FC<{
  orderSide: string;
  onChange: (side: string) => void;
}> = ({ orderSide, onChange }) => (
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

const PriceInput: React.FC<{
  orderType: string;
  price: string;
  onChange: (price: string) => void;
}> = ({ orderType, price, onChange }) => {
  if (orderType !== order.type.limit) return null;

  return (
    <div>
      <label className="flex items-center text-xs font-medium dark:text-gray-700 text-gray-300 mb-1">
        <DollarSign className="w-3 h-3 mr-1" />
        Price
      </label>
      <input
        type="number"
        value={price}
        step="0.01"
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-blue-500 outline-none"
        placeholder="0.00"
      />
    </div>
  );
};

const LeverageSlider: React.FC<{
  leverage: number;
  onChange: (leverage: number) => void;
}> = ({ leverage, onChange }) => (
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
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

const OrderSummary: React.FC<{
  totalValue: number;
  requiredMargin: number;
  leverage: number;
}> = ({ totalValue, requiredMargin, leverage }) => (
  <>
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

    {leverage > 20 && (
      <div className="flex items-start gap-1.5 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
        <AlertCircle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-yellow-800 dark:text-yellow-200">High leverage warning</p>
      </div>
    )}
  </>
);

const ActionButtons: React.FC<{
  isSubmitting: boolean;
  quantity: string;
  orderSide: string;
  orderType: string;
  onSubmit: () => void;
  onReset: () => void;
}> = ({ isSubmitting, quantity, orderSide, orderType, onSubmit, onReset }) => {

  return <div className="flex gap-2 pt-1">
    <button
      onClick={onReset}
      disabled={isSubmitting}
      className="flex-1 py-2 text-xs rounded font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      Reset
    </button>
    <button
      onClick={onSubmit}
      disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
      className={`flex-1 py-2 px-2 text-xs rounded font-semibold text-white transition-all flex items-center justify-center gap-1 ${orderSide === order.side.buy
        ? "bg-green-600 hover:bg-green-700 disabled:bg-green-600"
        : "bg-red-600 hover:bg-red-700 disabled:bg-red-600"
        } ${isSubmitting || !quantity ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {isSubmitting && <Loader className="w-3 h-3 animate-spin" />}
      {isSubmitting ? "Processing..." : `${orderSide} ${orderType}`}
    </button>
  </div>
}

const OrderPanel: React.FC<OrderPanelProps> = ({ setOrders, userId, marketPrice }) => {
  const { invalidateCache } = useUpdateTanstackCache()
  const queryClient = useQueryClient();
  const user: any = queryClient.getQueryData(['user']);
  const [wallet, setWallet] = useState(0)
  const { symbol } = useParams();
  const [orderType, setOrderType] = useState(order.type.limit);
  const [orderSide, setOrderSide] = useState(order.side.buy);
  const [price, setPrice] = useState<string>(marketPrice.toString());
  const [quantity, setQuantity] = useState<string>("");
  const [leverage, setLeverage] = useState<number>(1);
  const [webHookResponseLoading, setWebhookResponseLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderPayload | null>(null)


  const totalValue = useMemo(() => {
    const p = orderType === order.type.market ? marketPrice : parseFloat(price) || 0;
    const q = parseFloat(quantity) || 0;
    return p * q;
  }, [price, quantity, marketPrice, orderType]);

  const requiredMargin = useMemo(() => {
    return leverage > 0 ? totalValue / leverage : 0;
  }, [totalValue, leverage]);

  const buildOrderPayload = useCallback((): OrderPayload => {
    const id = crypto.randomUUID();
    return {
      asset: symbol?.toUpperCase() || "",
      userId: userId,
      orderId: id,
      orderType,
      price: orderType === order.type.market ? marketPrice : parseFloat(price),
      quantity: parseFloat(quantity),
      margin: Number(requiredMargin?.toFixed(2)),
      status: order?.status?.pending,
      orderSide,
      callUrl: `${import.meta.env.VITE_BACKEND_URL}/order/webhook/${userId}/${id}`,
    };
  }, [orderType, price, quantity, requiredMargin, symbol, userId, marketPrice]);

  useEffect(() => {
    getUserDetails(getUserId() as string).then((res) => {
      setWallet(prev => res?.data?.amount || prev)
    }).catch()
  }, [])
  const { mutate, isPending } = useMutation({
    mutationFn: (orderPayload: OrderPayload) => placeOrder(orderPayload),
    onSuccess: (response, payload) => {
      userToastMessages('success', response?.data?.message || "Order placed! Listening for updates...");
      setWebhookResponseLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const subscribeUrl = `${backendUrl}/order/webhook/subscribe/${payload.userId}/${payload.orderId}`;
      const eventSource = new EventSource(subscribeUrl);
      setWallet(prev => prev - Number(placedOrder?.margin))
      eventSource.onopen = () => {
        setWebhookResponseLoading(true)
      };

      eventSource.addEventListener("order-update", (event: Event) => {
        try {
          const messageEvent = event as MessageEvent;
          const data = JSON.parse(messageEvent.data);
          setOrders((prev: any[]) => {
            const filteredOrders = prev.filter(
              (order) => String(order.id) !== String(data.id)
            );
            invalidateCache('user')
            return [...filteredOrders, data];

          });
        } catch (error) {
          console.error("Order update event Error:", error);
        } finally {
          setWebhookResponseLoading(false);
        }
      });

      eventSource.onerror = (error) => {
        console.error("Webhook connection error:", error);
        setWebhookResponseLoading(false)
        eventSource.close();
      };
      resetForm();
    },
    onError: (error: any) => {
      console.error("Order placement failed:", error);
      userToastMessages('error', error?.response?.data?.message || "Order failed to place!");
    },
  });

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      userToastMessages('error', 'Please enter a valid quantity');
      return;
    }
    if (!userId || !getUserId()) {
      userToastMessages('error', 'Please authenticate yourself...!');
      return;
    }
    try {
      const payload = buildOrderPayload();
      setPlacedOrder(payload)
      mutate(payload);
    } catch (error) {
      console.error("Error submitting order:", error);
      userToastMessages('error', 'Failed to submit order');
    }
  };

  const resetForm = () => {
    setPrice(marketPrice.toString());
    setQuantity("");
    setLeverage(1);
    ({ status: 'idle', message: '' });
  };

  return (
    <div className="w-full h-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-4 py-2 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{symbol}</h3>
          <p className="text-xs font-semibold text-white">${marketPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <OrderTypeSelector orderType={orderType} onChange={setOrderType} />

        <OrderSideSelector orderSide={orderSide} onChange={setOrderSide} />

        <PriceInput orderType={orderType} price={price} onChange={setPrice} />

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

        <label className="flex gap-1 items-center text-xs font-medium dark:text-gray-500 py-2 text-gray-300 mb-1">
          <FcMoneyTransfer className="w-3 h-3 mr-1" />
          Current Wallet Balance: {wallet?.toFixed(2)}
        </label>

        <LeverageSlider leverage={leverage} onChange={setLeverage} />

        <OrderSummary totalValue={totalValue} requiredMargin={requiredMargin} leverage={leverage} />

        {webHookResponseLoading && (
          <div className="text-slate-600 text-xs flex gap-2 items-center">
            <Loader className="animate-spin" size={16} />
            <p>Please Wait for webhook response It may take some seconds...!</p>
          </div>
        )}

        <ActionButtons
          isSubmitting={isPending}
          quantity={quantity}
          orderSide={orderSide}
          orderType={orderType}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
      </div>
    </div>
  );
};

export default OrderPanel;