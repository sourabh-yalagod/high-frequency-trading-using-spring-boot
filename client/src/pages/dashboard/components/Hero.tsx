import { Download, Eye, EyeOff } from "lucide-react";
import { getUserId } from "../../../utils/jwt";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const Hero = () => {
    const [showBalance, setShowBalance] = useState(true)
    const userId = getUserId();
    const user = useSelector((state: any) => state?.user)
    const navigate = useNavigate();
    const balance = useMemo(() => {
        return user?.amount
    }, [user])
    const handleDirectToDepositePage = () => {
        if (!!userId) {
            navigate("/deposit/" + userId)
        } else {
            navigate("/signin")
        }
    }
    return (
        <div className="w-full sm:max-w-3/4 space-y-6">
            <div className="text-4xl space-y-2 sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                <h1>Discuss Everything Crypto on{' '}</h1>
                <div className="text-yellow-400 underline decoration-4 underline-offset-8">
                    BINANCE SQUARE
                </div>
            </div>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <span className="text-lg font-medium">Your Estimated Balance</span>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition">
                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? `$${Number(balance || 0).toFixed(2)}` : '******'}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <button
                        onClick={handleDirectToDepositePage}
                        className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition flex items-center space-x-2">
                        <Download size={18} />
                        <span>Deposit</span>
                    </button>
                    <button
                        onClick={() => navigate('/chart/BTCUSDT')}
                        className="px-6 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-semibold rounded-lg transition">
                        Trade
                    </button>
                    <button
                        onClick={() => navigate('/statistics/' + getUserId())}
                        className="px-6 py-3 bg-green-800 dark:bg-green-700 hover:bg-green-900 dark:hover:bg-green-600 text-white font-semibold rounded-lg transition">
                        Statistics
                    </button>
                    <button
                        onClick={() => navigate('/payment-history/' + getUserId())}
                        className="px-6 py-3 bg-blue-800 dark:bg-blue-700 hover:bg-blue-900 dark:hover:bg-blue-600 text-white font-semibold rounded-lg transition">
                        Payment History
                    </button>
                </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="w-1 h-full bg-blue-500 rounded"></div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    Notice of Removal of Spot Trading Pairs - 2025-05-23
                </p>
            </div>
        </div>
    );
};
export default Hero;