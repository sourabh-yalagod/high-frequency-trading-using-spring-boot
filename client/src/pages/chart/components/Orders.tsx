import React, { useEffect, useState } from "react";
import { userToastMessages } from "../../../utils/userToastMessages";
import { usePriceContext } from "../../../context/PriceContext";
import axios from "axios";
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
    createdAt: string;
    updateAt: string;
}

interface OrdersProps {
    orders: Order[];
}

const Orders: React.FC<OrdersProps> = ({ orders }) => {
    const { getPrice } = usePriceContext();

    const [orderData, setOrderData] = useState(
        orders.map((o: any) => ({ ...o, sl: o?.sl || "", tg: o.tg || "" }))
    );
    const [activeModal, setActiveModal] = useState<{
        id: string;
        field: "sl" | "tg" | null;
    }>({ id: "", field: null });
    const [inputValue, setInputValue] = useState("");

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "text-yellow-500";
            case "CLOSED":
                return "text-gray-500";
            case "OPEN":
                return "text-blue-500";
            case "REJECTED":
                return "text-red-500";
            default:
                return "text-gray-600 dark:text-gray-300";
        }
    };
    useEffect(() => {
        const webHookUrl = import.meta.env.VITE_BACKEND_URL + "/webhook"
        axios.post(webHookUrl).then((res) => {
            orderData.push(res.data)
        }).catch(error => {
            console.log(error);
        })
    }, [])
    const getPositionStatus = (order: Order) => {
        const current = Number(getPrice(order.asset.toUpperCase()));

        if (!current) return { color: "text-gray-400", pnl: 0 };

        const isBuy = order.orderSide === "BUY";
        const diff = current - order.price;
        const pnl = isBuy ? diff * order.quantity : -diff * order.quantity;

        return {
            color: pnl > 0 ? "text-green-500" : pnl < 0 ? "text-red-500" : "text-blue-500",
            pnl,
        };
    };

    const handleOpenModal = (id: string, field: "sl" | "tg") => {
        setActiveModal({ id, field });
        setInputValue("");
    };

    const handleSaveModal = () => {
        const { id, field } = activeModal;
        if (!field) return;
        setOrderData((prev) =>
            prev.map((o) => (o.id === id ? { ...o, [field]: inputValue } : o))
        );
        setActiveModal({ id: "", field: null });
        console.log(orderData);
    };

    const handleCloseOrder = (id: string) => {
        setOrderData((prev) =>
            prev.map((o) => (o.id === id ? { ...o, status: "CLOSED" } : o))
        );
    };
    return (
        <div className="relative w-full max-h-[300px] overflow-scroll rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="min-w-full text-sm md:text-base">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                        {[
                            "Asset",
                            "Order Price",
                            "Current Price",
                            "Quantity",
                            "SL",
                            "TG",
                            "Status",
                            "Position (P/L)",
                            "Actions",
                        ].map((head) => (
                            <th
                                key={head}
                                className="px-4 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700"
                            >
                                {head}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {orderData.map((order) => {
                        const isPendingOrOpenOrder = order?.status?.toUpperCase() == "PENDING" || order?.status?.toUpperCase() == "OPEN"

                        const { color, pnl } = getPositionStatus(order);
                        const current = Number(getPrice(order.asset.toUpperCase()));

                        return (
                            <tr
                                key={order.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                            >
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                                    {order.asset}
                                </td>
                                <td className="px-4 py-3">{order.price.toLocaleString()}</td>
                                <td className="px-4 py-3">
                                    {typeof current === "number" ? current.toLocaleString() : "-"}
                                </td>
                                <td className="px-4 py-3">{order.quantity}</td>

                                {/* SL */}
                                <td className="px-4 py-3">
                                    {order.sl ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-300">{order.sl}</span>
                                            <button
                                                className="text-red-500 hover:text-red-600 text-xs"
                                                onClick={() =>
                                                    setOrderData((prev) =>
                                                        prev.map((o) =>
                                                            o.id === order.id ? { ...o, sl: "" } : o
                                                        )
                                                    )
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!isPendingOrOpenOrder) {
                                                    userToastMessages("warning", "Order should be OPEN of Pending...!")
                                                    return
                                                } else {
                                                    handleOpenModal(order.id, "sl")
                                                }
                                            }}
                                            className="text-blue-500 text-xs hover:underline"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </td>

                                {/* TG */}
                                <td className="px-4 py-3">
                                    {order.tg ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-300">{order.tg}</span>
                                            <button
                                                className="text-red-500 hover:text-red-600 text-xs"
                                                onClick={() =>
                                                    setOrderData((prev) =>
                                                        prev.map((o) =>
                                                            o.id === order.id ? { ...o, tg: "" } : o
                                                        )
                                                    )
                                                }
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                if (!isPendingOrOpenOrder) {
                                                    userToastMessages("warning", "Order should be OPEN of Pending...!")
                                                    return
                                                } else {
                                                    handleOpenModal(order.id, "tg")
                                                }
                                            }}
                                            className="text-green-500 text-xs hover:underline"
                                        >
                                            + Add
                                        </button>
                                    )}
                                </td>

                                <td className={`px-4 py-3 font-medium ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </td>

                                <td className={`px-4 py-3 font-semibold ${color}`}>
                                    {pnl.toFixed(2)}
                                </td>

                                <td className="px-4 py-3">
                                    {order.status === "OPEN" || order.status === "PENDING" ? (
                                        <button
                                            onClick={() => handleCloseOrder(order.id)}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-md transition"
                                        >
                                            Close
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

            {/* Modal */}
            {activeModal.field && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 w-72 border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
                            Set {activeModal.field.toUpperCase()}
                        </h3>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Enter ${activeModal.field.toUpperCase()} value`}
                            className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setActiveModal({ id: "", field: null })}
                                className="px-3 py-1 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveModal}
                                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
