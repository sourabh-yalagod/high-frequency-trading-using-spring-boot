import { useMemo, useState, useEffect, useCallback } from "react";
import { Layers, Loader } from "lucide-react";
import { useParams } from "react-router-dom";
import { order } from "../../../utils/assetConstant";
import { getUserId } from "../../../utils/jwt";
import { useMutation } from "@tanstack/react-query";
import { userToastMessages } from "../../../utils/userToastMessages";
import { getUserDetails, placeOrder } from "../../../store/apis";
import { FcMoneyTransfer } from "react-icons/fc";
import useUpdateTanstackCache from "../../../hooks/useUpdateTanstackCache";
import OrderSummary from "./OrderSummary";
import LeverageSlider from "./LeverageSlider";
import ActionButtons from "./ActionButtons";
import PriceInput from "./PriceInput";
import OrderSideSelector from "./OrderSideSelector";
import OrderTypeSelector from "./OrderTypeSelector";

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






const OrderPanel: React.FC<OrderPanelProps> = ({ setOrders, userId, marketPrice }) => {
  const { invalidateCache } = useUpdateTanstackCache()
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

  }, [orderType, price, quantity, requiredMargin, symbol, userId, marketPrice, orderSide]);

  useEffect(() => {
    getUserDetails(getUserId() as string).then((res) => {
      setWallet(prev => res?.data?.amount || prev)
    }).catch()
  }, [])

  const { mutate, isPending } = useMutation({
    mutationFn: (orderPayload: OrderPayload) => placeOrder(orderPayload),
    onSuccess: (response, payload) => {
      userToastMessages('success', response?.data?.message || "Order placed, Listening for updates...");
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
        <OrderTypeSelector order={order} orderType={orderType} onChange={setOrderType} />

        <OrderSideSelector order={order} orderSide={orderSide} onChange={setOrderSide} />

        <PriceInput order={order} orderType={orderType} price={price} onChange={setPrice} />

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
          order={order}
        />
      </div>
    </div>
  );
};

export default OrderPanel;