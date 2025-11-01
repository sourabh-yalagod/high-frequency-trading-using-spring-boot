import ChartForSymbol from './ChartForSymbol'
import { useParams } from 'react-router-dom'
import OrderBook from './OrderBook';
import { dummyAsks, dummyBids } from '../../utils/assetConstant';
import OrderPanel from './OrderPanel';
import { usePriceContext } from '../../context/PriceContext';
import ChartHeader, { type MarketDetails } from './ChartHeader';

const Chart = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const { getPrice, getDetails } = usePriceContext();

    const price = getPrice(symbol?.toUpperCase() || "");
    const details: MarketDetails | any = getDetails(symbol?.toUpperCase() || "");
    return (
        <div>
            <ChartHeader marketPrice={details || null} />
            <div className="grid h-full grid-cols-1 xl:grid-cols-[3fr_1fr_1fr] gap-0.5 p-4"> {/* Chart Section (60%) */} <div className="bg-gray-900 rounded-2xl p-4 shadow-md"> <ChartForSymbol symbol={symbol || ""} /> </div>

                <div className="bg-gray-900 rounded-2xl shadow-md">
                    <OrderBook bids={dummyBids} asks={dummyAsks} />
                </div>
                <div className="bg-gray-900 rounded-2xl p-4 shadow-md">
                    <OrderPanel marketPrice={Number(price)} placeOrder={() => { }} userId="" />
                </div>
            </div>
        </div>
    )
}

export default Chart