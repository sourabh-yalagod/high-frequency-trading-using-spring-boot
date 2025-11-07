import ChartForSymbol from './components/ChartForSymbol'
import { useParams } from 'react-router-dom'
import OrderBook from './components/OrderBook';
import { dummyOrders } from '../../utils/assetConstant';
import OrderPanel from './components/OrderPanel';
import { usePriceContext } from '../../context/PriceContext';
import ChartHeader, { type MarketDetails } from './components/ChartHeader';
import Orders from './components/Orders';
import { useEffect, useState } from 'react';
import { getUserId } from '../../utils/jwt';
import axiosInstance from '../../lib/axiosInstance';
import { userToastMessages } from '../../utils/userToastMessages';

export type OrderDto = {
    price: number;
    quantity: number;
};

export interface OrderBook {
    buyOrders: OrderDto[];
    sellOrders: OrderDto[];
};

const Chart = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const { getPrice, getDetails, subscribeToOrderBook } = usePriceContext();
    const [bids, setBids] = useState<OrderDto[]>([])
    const [asks, setasks] = useState<OrderDto[]>([])
    const price = getPrice(symbol?.toUpperCase() || "");
    const details: MarketDetails | any = getDetails(symbol?.toUpperCase() || "");
    const [isOrderbookLoading, setOrderBookLoading] = useState<Boolean>(false)

    useEffect(() => {
        if (!symbol) return;

        const unsubscribe = subscribeToOrderBook(symbol.toUpperCase(), (data: any) => {
            setBids(() => data.bids)
            setasks(() => data.asks)
        });

        return () => {
            unsubscribe();
        };
    }, [symbol, subscribeToOrderBook]);
    useEffect(() => {
        if (!symbol) return;
        axiosInstance.get('/order/order-book/' + symbol?.toLocaleUpperCase()).then((data: any) => {
            console.log(data?.data);
            setOrderBookLoading(true)
            setBids(() => data?.data?.bids)
            setasks(() => data?.data?.asks)
        }).catch(() => {
            setBids(() => [])
            setasks(() => [])
        }).finally(() => {
            setOrderBookLoading(false)
        })
    }, [symbol])
    const userId = getUserId();
    const handlePlceOrder = async (order: any) => {
        try {
            const response = await axiosInstance.post("/order/publish", order)
            userToastMessages('success', response?.data?.message || "Order is Queued Please wait.")
        } catch (error: any) {
            userToastMessages('success', error?.data?.message || "Order failed to push to queue....!")
        }
    }
    return (
        <div>
            <ChartHeader marketPrice={details || null} />
            <div className="grid gap-3 space-y-6 space-x-2 h-full grid-cols-1 xl:grid-cols-[3fr_2fr] p-4">
                <div className="bg-gray-900 h-full rounded-2xl shadow-md">
                    <ChartForSymbol symbol={symbol || ""} />
                </div>
                <div className='md:flex gap-3 h-full space-y-6 space-x-2'>
                    <OrderBook
                        bids={bids?.length > 0 ? bids : []}
                        asks={asks?.length > 0 ? asks : []}
                    />
                    <OrderPanel
                        orderData={dummyOrders}
                        marketPrice={Number(price)}
                        placeOrder={(order: any) => {
                            console.log("Placed Order : ", order);
                            handlePlceOrder(order)
                        }}
                        userId={userId as string}
                    />
                </div>
            </div>
            <div className={`mt-5 sm:mt-0 p-4 ${isOrderbookLoading && "bg-slate-600 animate-ping"}`} >
                <Orders orders={dummyOrders} />
            </div>
        </div>
    )
}

export default Chart