import React, { useEffect, useState } from "react";
import { ChevronDown, X, Trash2, Plus, Loader } from "lucide-react";
import { usePriceContext } from "../../../context/PriceContext";
import { updateOrder } from "../../../store/apis";
import { userToastMessages } from "../../../utils/userToastMessages";

interface Order {
    id: string;
    userId: string;
    asset: string;
    orderType: string;
    price: number;
    quantity: number;
    margin: string;
    status: string;
    orderSide: string;
    sl: number | any;
    tg: number | any;
    createdAt: string;
    updateAt: string;
}

interface OrdersProps {
    orders: Order[];
}

const Orders: React.FC<OrdersProps> = ({ orders }) => {
    const [updateOrderLoading, setUpdateOrderLoading] = useState(false);
    const { getPrice } = usePriceContext();
    const [orderData, setOrderData] = useState<Order[]>([]);
    const [closeOrderId, setCloseOrderId] = useState("")
    const [activeModal, setActiveModal] = useState<{
        id: string;
        field: "sl" | "tg" | null;
    }>({ id: "", field: null });
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (Array.isArray(orders)) {
            setOrderData(
                orders?.map((o) => ({
                    ...o,
                    sl: o?.sl ?? "",
                    tg: o?.tg ?? "",
                }))
            );
        }
    }, [orders?.length]);

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING":
                return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
            case "CLOSED":
                return "bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400";
            case "OPEN":
                return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400";
            case "REJECTED":
                return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
            default:
                return "bg-gray-50 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400";
        }
    };

    const getPositionStatus = (order: Order) => {
        if (order?.status?.toUpperCase() === "PENDING") {
            return { color: "text-gray-400", pnl: 0, volatility: "-" };
        }

        const current = Number(getPrice(order?.asset?.toUpperCase()));
        if (!current) return { color: "text-gray-400", pnl: 0, volatility: "-" };

        const isBuy = order?.orderSide?.toUpperCase() === "BUY";
        const diff = current - order?.price;
        const pnl = isBuy ? diff * order?.quantity : -diff * order?.quantity;
        const volatilityPercent = ((diff / order?.price) * 100).toFixed(2);
        const volatility = `${diff > 0 ? "+" : ""}${volatilityPercent}%`;

        return {
            color: pnl > 0 ? "text-green-500" : pnl < 0 ? "text-red-500" : "text-gray-400",
            pnl,
            volatility,
        };
    };

    const handleOpenModal = (id: string, field: "sl" | "tg") => {
        setActiveModal({ id, field });
        setInputValue("");
    };

    const handleSaveModal = async () => {
        setUpdateOrderLoading(true)
        const { id, field } = activeModal;
        if (!field || !inputValue) return;
        let order: any = orderData?.find(order => order.id == id)
        if (field == "sl") {
            order.sl = Number(inputValue);
        }
        if (field == "tg") {
            order.tg = Number(inputValue);
        }
        const response = await updateOrder(order);
        if (response.data) {
            userToastMessages("success", "Order udpated succefully")
            setOrderData((prev) =>
                prev?.map((o) => (o.id === id ? { ...o, [field]: Number(inputValue) } : o))
            );
        } else {
            userToastMessages("error", "order update failed....!")
        }
        setUpdateOrderLoading(false)
        setActiveModal({ id: "", field: null });
    };

    const handleCloseOrder = async (order: Order) => {
        setCloseOrderId(order.id);
        const marketPrice = Number(getPrice(order?.asset?.toUpperCase()));
        try {
            let profitLoss = 0;
            if (order.status == "PENDING") {
                profitLoss = 0;
            }
            else if (order.orderSide === "BUY") {
                profitLoss = (marketPrice - order.price) * order.quantity;
            } else if (order.orderSide === "SELL") {
                profitLoss = (order.price - marketPrice) * order.quantity;
            }

            profitLoss = Number(profitLoss.toFixed(2));

            const updatedOrder = { ...order, status: "CLOSED", profitLoss };
            
            const response = await updateOrder(updatedOrder);

            if (response?.data) {
                setOrderData((prev) =>
                    prev?.map((o) =>
                        o.id === order.id ? { ...o, status: "CLOSED", profitLoss } : o
                    )
                );

                const message =
                    profitLoss >= 0
                        ? `Order closed with profit: ${profitLoss}`
                        : `Order closed with loss: ${Math.abs(profitLoss)}`;

                userToastMessages("success", message);
            }

        } catch (error) {
            console.error("Error closing order:", error);
            userToastMessages("error", "Failed to close order");
        }
        finally {
            setCloseOrderId("");
        }
    };


    const handleDeleteSL = async (id: string) => {
        let order: any = orderData?.find(order => order.id == id)
        order.sl = null;
        const response = await updateOrder(order);
        if (response?.data) {
            setOrderData((prev) =>
                prev?.map((o) => (o.id === id ? { ...o, sl: "" } : o))
            );
            userToastMessages('success', "updated order.")
        } else {
            userToastMessages('error', "update order failed...!");
        }
    };

    const handleDeleteTG = async (id: string) => {
        let order: any = orderData?.find(order => order.id == id)
        order.tg = null;
        const response = await updateOrder(order);
        if (response?.data) {
            setOrderData((prev) =>
                prev?.map((o) => (o.id === id ? { ...o, tg: "" } : o))
            );
            userToastMessages('success', "updated order.")
        } else {
            userToastMessages('error', "update order failed...!");
        }
    };

    if (!orderData?.length) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                No orders available
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Mobile View */}
            <div className="lg:hidden space-y-3 p-4">
                {orderData?.map((order: any) => {
                    const { color, pnl, volatility } = getPositionStatus(order);
                    const current = Number(getPrice(order?.asset?.toUpperCase()));
                    const statusColor = getStatusColor(order?.status);

                    return (
                        <div
                            key={order?.id}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {order?.asset}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {order?.orderSide === "BUY" ? "🟢 Buy" : "🔴 Sell"}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
                                    {order?.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Order Price</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {order?.price?.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Current Price</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {order?.status?.toUpperCase() === "PENDING"
                                            ? "-"
                                            : typeof current === "number"
                                                ? current.toLocaleString()
                                                : "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Quantity</p>
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {order?.quantity}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">Volatility</p>
                                    <p className={`font-semibold ${color}`}>{volatility}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 text-xs">
                                <div className="flex-1">
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">SL</p>
                                    {order?.sl ? (
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                            <span className="text-gray-700 dark:text-gray-300">{order?.sl}</span>
                                            <button
                                                onClick={() => handleDeleteSL(order)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleOpenModal(order?.id, "sl")}
                                            className="w-full text-blue-500 hover:text-blue-600 py-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-medium"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-500 dark:text-gray-400 mb-1">TG</p>
                                    {order?.tg ? (
                                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                            <span className="text-gray-700 dark:text-gray-300">{order?.tg}</span>
                                            <button
                                                onClick={() => handleDeleteTG(order?.id)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleOpenModal(order?.id, "tg")}
                                            className="w-full text-green-500 hover:text-green-600 py-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-medium"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex-1">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">P/L</p>
                                    <p className={`font-semibold ${color}`}>{pnl.toFixed(2)}</p>
                                </div>
                                {order?.status?.toUpperCase() === "OPEN" ||
                                    order?.status?.toUpperCase() === "PENDING" ? (
                                    <button
                                        onClick={() => handleCloseOrder(order)}
                                        className="flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md font-medium transition"
                                    >
                                        {closeOrderId == order.id ? <Loader className="animate-spin" /> : "Close"}
                                    </button>
                                ) : (
                                    <div className="flex-1" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            {[
                                "Asset",
                                "Order Type",
                                "Side",
                                "Order Price",
                                "Current Price",
                                "Volatility",
                                "Quantity",
                                "SL",
                                "TG",
                                "Status",
                                "P/L",
                                "Actions",
                            ].map((head) => (
                                <th
                                    key={head}
                                    className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300"
                                >
                                    {head}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {orderData?.map((order: any) => {
                            const { color, pnl, volatility } = getPositionStatus(order);
                            const current = Number(getPrice(order?.asset?.toUpperCase()));
                            const statusColor = getStatusColor(order?.status);
                            const isPending = order?.status?.toUpperCase() === "PENDING";
                            const isOpenOrPending =
                                order?.status?.toUpperCase() === "OPEN" ||
                                order?.status?.toUpperCase() === "PENDING";

                            return (
                                <tr
                                    key={order?.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                                        {order?.asset}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {order?.orderType || "Market"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${order?.orderSide?.toUpperCase() === "BUY"
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                }`}
                                        >
                                            {order?.orderSide === "BUY" ? "🟢 BUY" : "🔴 SELL"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {order?.price?.toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {isPending ? "-" : typeof current === "number" ? current.toLocaleString() : "-"}
                                    </td>
                                    <td className={`px-4 py-3 font-semibold ${color}`}>{volatility}</td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {order?.quantity}
                                    </td>

                                    {/* SL */}
                                    <td className="px-4 py-3">
                                        {order?.sl ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {order?.sl}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteSL(order?.id)}
                                                    className="text-red-500 hover:text-red-600 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenModal(order?.id, "sl")}
                                                className="text-blue-500 hover:text-blue-600 text-xs font-medium transition flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        )}
                                    </td>

                                    {/* TG */}
                                    <td className="px-4 py-3">
                                        {order?.tg ? (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {order?.tg}
                                                </span>
                                                <button
                                                    onClick={() => handleDeleteTG(order?.id)}
                                                    className="text-red-500 hover:text-red-600 transition"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleOpenModal(order?.id, "tg")}
                                                className="text-green-500 hover:text-green-600 text-xs font-medium transition flex items-center gap-1"
                                            >
                                                <Plus size={14} /> Add
                                            </button>
                                        )}
                                    </td>

                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}
                                        >
                                            {order?.status}
                                        </span>
                                    </td>

                                    <td className={`px-4 py-3 font-semibold ${color}`}>
                                        {pnl.toFixed(2)}
                                    </td>

                                    <td className="px-4 py-3">
                                        {isOpenOrPending ? (
                                            <button
                                                onClick={() => handleCloseOrder(order)}
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md font-medium transition"
                                            >
                                                {closeOrderId == order.id ? <Loader className="animate-spin" /> : "Close"}
                                            </button>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {activeModal.field && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Set {activeModal.field.toUpperCase()}
                        </h3>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Enter ${activeModal.field.toUpperCase()} value`}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setActiveModal({ id: "", field: null })}
                                className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSaveModal()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                            >
                                {updateOrderLoading ? <Loader className="animate-spin" /> : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;