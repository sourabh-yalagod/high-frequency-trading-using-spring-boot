import { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

const Chart = () => {
    const [series, setSeries] = useState<{ data: { x: Date; y: number }[] }[]>([
        { data: [] },
    ]);

    const [options, setOptions] = useState<ApexOptions>({
        chart:
        {
            id: 'area-datetime', type: 'area', height: 350,
            toolbar: { show: false, }, zoom: { autoScaleYaxis: true, }, animations: { enabled: true, speed: 800, },
        },
        stroke: {
            curve: 'smooth', width: 3, colors: ['#00BFFF'],
        },
        markers: {
            size: 0, colors: ['#00BFFF'], strokeColors: '#fff', strokeWidth: 2, hover: { size: 6, },
        },
        fill: {
            type: 'gradient', gradient: { shade: 'dark', type: 'vertical', shadeIntensity: 0.5, gradientToColors: ['#007BFF'], inverseColors: false, opacityFrom: 0.5, opacityTo: 0.1, stops: [0, 100], },
        },
        grid: {
            borderColor: 'rgba(255, 255, 255, 0.1)', strokeDashArray: 3, yaxis: { lines: { show: true } },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: { colors: '#9CA3AF', },
            },
            axisBorder: {
                color: 'rgba(255,255,255,0.1)',
            },
            axisTicks: {
                color: 'rgba(255,255,255,0.1)',
            },
        },
        yaxis: {
            labels:
            {
                style: {
                    colors: '#9CA3AF',
                },
            },
        },
        tooltip: {
            theme: 'dark',
            style: {
                fontSize: '13px',
            },
            x: {
                format: 'dd MMM yyyy',
            },
        },
        annotations: {
            yaxis: [{
                y: 30, borderColor: '#10B981',
                label: {
                    text: 'Support Zone', style: { color: '#fff', background: '#10B981', },
                },
            },],
            xaxis:
                [{
                    x: new Date('14 Nov 2012').getTime(), borderColor: '#3B82F6', label: {
                        text: 'Price Rally', style: {
                            color: '#fff', background:
                                '#3B82F6',
                        },
                    },
                },],
        }, theme:
            { mode: 'dark', },

    });

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const now = Date.now();
                const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60 * 1000;
                const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&startTime=${sixMonthsAgo}&endTime=${now}&limit=1000`;

                const response = await fetch(url);
                const data = await response.json();

                const formatted = data.map((item: any) => ({
                    x: new Date(item[0]),
                    y: parseFloat(item[4]), // close price
                }));

                setSeries([{ data: formatted }]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchChartData();
    }, []);

    return (
        <div className="p-4">
            <h2 className="text-lg mb-2 text-white font-semibold">
                BTC/USDT - 6 Month Chart
            </h2>
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={350}
            />
        </div>
    );
};

export default Chart;
