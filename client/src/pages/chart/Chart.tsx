import ChartForSymbol from './components/ChartForSymbol'
import { useParams } from 'react-router-dom'
import OrderBook from './components/OrderBook';
import OrderPanel from './components/OrderPanel';
import { usePriceContext } from '../../context/PriceContext';
import ChartHeader, { type MarketDetails } from './components/ChartHeader';
import Orders from './components/Orders';
import { useEffect, useState } from 'react';
import { getUserId } from '../../utils/jwt';
import { getOrderbook, getOrders } from '../../store/apis';
import { useQuery } from '@tanstack/react-query';

export type OrderDto = {
    price: number;
    quantity: number;
    remainingQuantity: number;
};

export interface OrderBook {
    buyOrders: OrderDto[];
    sellOrders: OrderDto[];
};

const Chart = () => {
    const userId: string | null = getUserId();
    const { data, error, isFetching } = useQuery({
        queryKey: ['orders', userId],
        enabled: !!userId,
        queryFn: () => getOrders(userId as any)
    })
    const { symbol } = useParams<{ symbol: string }>();
    const { getPrice, getDetails, subscribeToOrderBook } = usePriceContext();
    const [bids, setBids] = useState<OrderDto[]>([])
    const [asks, setasks] = useState<OrderDto[]>([])
    const price = getPrice(symbol?.toUpperCase() || "");
    const details: MarketDetails | any = getDetails(symbol?.toUpperCase() || "");
    const [isOrderbookLoading, setOrderBookLoading] = useState<Boolean>(false)
    const [orders, setOrders] = useState<any>([])

    useEffect(() => {
        setOrders(() => data?.data || [])
    }, [data])

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
        try {
            getOrderbook(symbol).then((res) => {
                setBids(() => res?.data?.bids)
                setasks(() => res?.data?.asks)
            })
        } catch (error) {
            setBids(() => [])
            setasks(() => [])
        }
    }, [symbol])
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
                        setOrders={setOrders}
                        marketPrice={Number(price)}
                        userId={userId as string}
                    />
                </div>
            </div>
            <div className={`mt-5 sm:mt-0 p-4 ${isOrderbookLoading && "bg-slate-600 animate-ping"}`} >
                <Orders orders={orders || []} />
            </div>
        </div>
    )
}

export default Chart