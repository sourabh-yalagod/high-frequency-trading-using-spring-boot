import { Download, Eye, EyeOff } from "lucide-react";

const Hero = ({ balance, showBalance, setShowBalance }: any) => {
    return (
        <div className="w-full max-w-3/4 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
                Discuss Everything Crypto on{' '}
                <span className="text-yellow-400 underline decoration-4 underline-offset-8">
                    BINANCE SQUARE
                </span>
            </h1>

            <div className="space-y-3 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 text-gray-700 dark:text-gray-300">
                    <span className="text-lg font-medium">Your Estimated Balance</span>
                    <button onClick={() => setShowBalance(!showBalance)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition">
                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>

                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {showBalance ? `$${Number(balance).toFixed(2)}` : '******'}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                    <button className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition flex items-center space-x-2">
                        <Download size={18} />
                        <span>Deposit</span>
                    </button>
                    <button className="px-6 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-semibold rounded-lg transition">
                        Trade
                    </button>
                    <button className="px-6 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white font-semibold rounded-lg transition">
                        Convert
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