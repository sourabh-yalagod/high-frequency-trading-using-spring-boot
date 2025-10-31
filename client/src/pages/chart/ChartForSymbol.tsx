import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

type TimeFrame = '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

const ChartForSymbol = ({ symbol }: { symbol: string }) => {
    const [series, setSeries] = useState<{ data: { x: Date; y: number }[] }[]>([
        { data: [] },
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('1d');

    const timeFrames: { value: TimeFrame; label: string }[] = [
        { value: '15m', label: '15m' },
        { value: '1h', label: '1h' },
        { value: '4h', label: '4h' },
        { value: '1d', label: '1d' },
        { value: '1w', label: '1w' },
        { value: '1M', label: '1M' },
    ];

    // Calculate time range based on timeframe
    const getTimeRange = (tf: TimeFrame) => {
        const now = Date.now();
        const ranges: Record<TimeFrame, number> = {
            '15m': 7 * 24 * 60 * 60 * 1000, // 7 days
            '1h': 30 * 24 * 60 * 60 * 1000, // 30 days
            '4h': 60 * 24 * 60 * 60 * 1000, // 60 days
            '1d': 180 * 24 * 60 * 60 * 1000, // 6 months
            '1w': 365 * 24 * 60 * 60 * 1000, // 1 year
            '1M': 730 * 24 * 60 * 60 * 1000, // 2 years
        };
        return { startTime: now - ranges[tf], endTime: now };
    };

    const options: any = {
        chart: {
            id: 'area-datetime',
            type: 'area',
            height: 350,
            toolbar: { show: false },
            zoom: { autoScaleYaxis: true },
            animations: { enabled: true, speed: 800 },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
            colors: ['#00BFFF'],
        },
        markers: {
            size: 0,
            colors: ['#00BFFF'],
            strokeColors: '#fff',
            strokeWidth: 2,
            hover: { size: 6 },
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: ['#007BFF'],
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 0.1,
                stops: [0, 100],
            },
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            strokeDashArray: 3,
            yaxis: { lines: { show: true } },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: '#9CA3AF' },
            },
            axisBorder: {
                color: 'rgba(255,255,255,0.1)',
            },
            axisTicks: {
                color: 'rgba(255,255,255,0.1)',
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#9CA3AF',
                },
                formatter: (value: number) => value.toFixed(2),
            },
        },
        tooltip: {
            theme: 'dark',
            style: {
                fontSize: '13px',
            },
            x: {
                format: 'dd MMM yyyy HH:mm',
            },
        },
        theme: {
            mode: 'dark',
        },
    };

    useEffect(() => {
        const fetchChartData = async () => {
            if (!symbol) {
                setError("No symbol provided");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { startTime, endTime } = getTimeRange(timeFrame);
                const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeFrame}&startTime=${startTime}&endTime=${endTime}&limit=1000`;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`Failed to fetch data for ${symbol}`);
                }

                const data = await response.json();

                if (!data || data.length === 0) {
                    throw new Error("No data available for this symbol");
                }

                const formatted = data.map((item: any) => ({
                    x: new Date(item[0]),
                    y: parseFloat(item[4]), // close price
                }));

                setSeries([{ data: formatted }]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error instanceof Error ? error.message : "Failed to fetch data");
                setLoading(false);
            }
        };

        fetchChartData();
    }, [symbol, timeFrame]);

    // Format symbol for display (e.g., BNBUSDT -> BNB/USDT)
    const formatSymbol = (sym: string) => {
        if (!sym) return "";
        const stableCoins = ['USDT', 'USDC', 'BUSD', 'DAI'];
        for (const stable of stableCoins) {
            if (sym.endsWith(stable)) {
                const base = sym.slice(0, -stable.length);
                return `${base}/${stable}`;
            }
        }
        return sym;
    };

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg text-white font-semibold">
                    {formatSymbol(symbol || "")} Chart
                </h2>

                <div className="flex gap-2">
                    {timeFrames.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => setTimeFrame(tf.value)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${timeFrame === tf.value
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center h-[350px] text-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p>Loading {formatSymbol(symbol || "")} data...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center justify-center h-[350px]">
                    <div className="text-center text-red-500">
                        <p className="text-lg font-semibold mb-2">Error</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <ReactApexChart
                    options={options}
                    series={series}
                    type="area"
                    height={350}
                />
            )}
        </div>
    );
};

export default ChartForSymbol;