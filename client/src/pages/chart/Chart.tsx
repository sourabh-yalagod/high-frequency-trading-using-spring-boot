import ChartForSymbol from './components/ChartForSymbol'
import { useParams } from 'react-router-dom'
import OrderBook from './components/OrderBook';
import { dummyAsks, dummyBids, dummyOrders } from '../../utils/assetConstant';
import OrderPanel from './components/OrderPanel';
import { usePriceContext } from '../../context/PriceContext';
import ChartHeader, { type MarketDetails } from './components/ChartHeader';
import Orders from './components/Orders';

const Chart = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const { getPrice, getDetails } = usePriceContext();
    const price = getPrice(symbol?.toUpperCase() || "");
    const details: MarketDetails | any = getDetails(symbol?.toUpperCase() || "");
    return (
        <div>
            <ChartHeader marketPrice={details || null} />
            <div className="grid gap-3 space-y-6 space-x-2 h-full grid-cols-1 xl:grid-cols-[3fr_2fr] p-4">
                <div className="bg-gray-900 h-full rounded-2xl shadow-md">
                    <ChartForSymbol symbol={symbol || ""} />
                </div>
                <div className='md:flex gap-3 h-full space-y-6 space-x-2'>
                    <OrderBook bids={dummyBids} asks={dummyAsks} />
                    <OrderPanel orderData={dummyOrders} marketPrice={Number(price)} placeOrder={(order: any) => {
                        console.log("Placed Order : ", order);

                    }} userId="" />
                </div>
            </div>
            <div className='mt-5 sm:mt-0 p-4'>
                <Orders orders={dummyOrders} />
            </div>
        </div>
    )
}

export default Chart