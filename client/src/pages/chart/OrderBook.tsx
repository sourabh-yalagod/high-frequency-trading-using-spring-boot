import React from "react";

type Order = {
    price: number;
    quantity: number;
};

interface OrderBookProps {
    bids: Order[];
    asks: Order[];
}

const OrderBook: React.FC<OrderBookProps> = ({ bids, asks }) => {
    const sortedAsks = [...asks]; // sellers: top → bottom
    const sortedBids = [...bids].reverse(); // buyers: bottom → top

    return (
        <div className="w-full h-[500px] bg-[#0f172a] text-gray-200 rounded-xl shadow-md p-3 sm:p-4 flex flex-col justify-between">
            <h2 className="text-center text-sm font-semibold text-gray-300 mb-2">
                Order Book
            </h2>



            {/* BIDS (Bottom Half) */}
            <div className="flex-1 overflow-y-auto pt-2 flex flex-col justify-end">
                <div className="flex flex-col-reverse text-[13px] space-y-reverse space-y-1">
                    {sortedBids.map((bid, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center bg-gray-800/40 hover:bg-gray-800/60 rounded p-1 transition"
                        >
                            <span className="text-green-400 font-semibold">
                                {bid.price.toFixed(2)}
                            </span>
                            <span className="text-gray-400">{bid.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-3 w-full"/>
            {/* ASKS (Top Half) */}
            <div className="flex-1 border-b border-gray-700 overflow-y-auto pb-2">
                <div className="space-y-1 text-[13px]">
                    {sortedAsks.map((ask, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center bg-gray-800/40 hover:bg-gray-800/60 rounded p-1 transition"
                        >
                            <span className="text-red-400 font-semibold">
                                {ask.price.toFixed(2)}
                            </span>
                            <span className="text-gray-400">{ask.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderBook;
