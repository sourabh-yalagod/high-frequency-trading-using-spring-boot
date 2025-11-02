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
            '15m': 7 * 24 * 60 * 60 * 1000,
            '1h': 30 * 24 * 60 * 60 * 1000,
            '4h': 60 * 24 * 60 * 60 * 1000,
            '1d': 180 * 24 * 60 * 60 * 1000,
            '1w': 365 * 24 * 60 * 60 * 1000,
            '1M': 730 * 24 * 60 * 60 * 1000,
        };
        return { startTime: now - ranges[tf], endTime: now };
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
                    y: parseFloat(item[4]),
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

    // Format symbol for display
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

    // Responsive chart options
    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            height: '100%',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true,
                },
                autoSelected: 'zoom'
            },
            zoom: {
                enabled: true,
                type: 'x',
                autoScaleYaxis: true,
                zoomedArea: {
                    fill: {
                        color: '#3b82f6',
                        opacity: 0.1
                    },
                    stroke: {
                        color: '#3b82f6',
                        opacity: 0.4,
                        width: 1
                    }
                }
            },
            background: 'transparent',
            fontFamily: 'inherit',
            animations: {
                enabled: true,
                speed: 800,
            }
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: 'smooth',
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.5,
                opacityTo: 0.1,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px',
                },
                datetimeUTC: false,
            },
            axisBorder: {
                color: '#374151',
            },
            axisTicks: {
                color: '#374151',
            },
            tooltip: {
                enabled: false
            }
        },
        yaxis: {
            opposite: true, // Moves Y-axis to right side
            labels: {
                style: {
                    colors: '#9ca3af',
                    fontSize: '12px',
                },
                formatter: (value: number) => {
                    return value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            },
            axisBorder: {
                show: true,
                color: '#374151',
            },
        },
        grid: {
            borderColor: '#374151',
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        tooltip: {
            theme: 'dark',
            x: {
                format: 'dd MMM yyyy HH:mm'
            },
            y: {
                formatter: (value: number) => {
                    return '$' + value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
            }
        },
        colors: ['#3b82f6'],
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: {
                        toolbar: {
                            show: true,
                            tools: {
                                download: true,
                                selection: false,
                                zoom: true,
                                zoomin: true,
                                zoomout: true,
                                pan: true,
                                reset: true,
                            }
                        }
                    },
                    xaxis: {
                        labels: {
                            style: {
                                fontSize: '10px',
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            style: {
                                fontSize: '10px',
                            }
                        }
                    }
                }
            },
            {
                breakpoint: 480,
                options: {
                    xaxis: {
                        labels: {
                            rotate: -45,
                            style: {
                                fontSize: '9px',
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            style: {
                                fontSize: '9px',
                            }
                        }
                    }
                }
            }
        ]
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900 rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 border-b border-gray-700">
                <h2 className="text-base sm:text-lg text-white font-semibold whitespace-nowrap">
                    {formatSymbol(symbol || "")} Chart
                </h2>

                {/* Time Frame Buttons */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {timeFrames.map((tf) => (
                        <button
                            key={tf.value}
                            onClick={() => setTimeFrame(tf.value)}
                            className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                                timeFrame === tf.value
                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {tf.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart Content */}
            <div className="flex-1 p-2 sm:p-4 min-h-0">
                {loading && (
                    <div className="flex items-center justify-center h-full text-white">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-sm sm:text-base">Loading {formatSymbol(symbol || "")} data...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-red-500 p-4">
                            <p className="text-base sm:text-lg font-semibold mb-2">Error</p>
                            <p className="text-sm sm:text-base">{error}</p>
                        </div>
                    </div>
                )}

                {!loading && !error && (
                    <div className="h-full w-full">
                        <ReactApexChart
                            options={chartOptions}
                            series={series}
                            type="area"
                            height="100%"
                            width="100%"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChartForSymbol;