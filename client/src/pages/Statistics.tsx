import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Activity, Calendar } from 'lucide-react';
import { getClosedOrders } from '../store/apis';
import { getUserId } from '../utils/jwt';

const Statistics = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Replace with your actual API endpoint
            const res = await getClosedOrders(getUserId() as string);
            setOrders(res.data);
            console.log(res.data);
            
        } catch (err: any) {
            setError(err?.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-white text-lg">Loading statistics...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800">
                <div className="text-red-400 text-lg">Error: {error}</div>
            </div>
        );
    }

    // Calculate metrics
    const totalOrders = orders?.length ?? 0;
    const totalProfit = orders?.reduce((sum, order: any) => sum + (order?.profitLoss ?? 0), 0) ?? 0;
    const avgProfit = totalOrders > 0 ? totalProfit / totalOrders : 0;
    const winningTrades = orders?.filter((o: any) => (o?.profitLoss ?? 0) > 0)?.length ?? 0;
    const losingTrades = orders?.filter((o: any) => (o?.profitLoss ?? 0) < 0)?.length ?? 0;
    const winRate = totalOrders > 0 ? ((winningTrades / totalOrders) * 100).toFixed(2) : 0;

    // Group by date for timeline
    const getDate = (dateStr: any) => new Date(dateStr)?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) ?? 'N/A';
    const getDayTime = (dateStr: any) => {
        const d = new Date(dateStr);
        return d?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) ?? 'N/A';
    };

    const timelineData = orders
        ?.map((order: any) => ({
            time: getDayTime(order?.createdAt),
            date: getDate(order?.createdAt),
            profit: parseFloat((order?.profitLoss ?? 0).toFixed(2)),
            side: order?.orderSide,
            quantity: order?.quantity,
        }))
        ?.sort((a: any, b: any) => new Date(a?.date).getMilliseconds() - new Date(b?.date).getMilliseconds()) ?? [];

    // Status breakdown
    const statusData = [
        { name: 'Closed', value: orders?.filter((o: any) => o?.status === 'CLOSED')?.length ?? 0, color: '#10b981' },
    ];

    // Side breakdown (Buy vs Sell)
    const sideData = [
        { name: 'BUY', value: orders?.filter(o => o?.orderSide === 'BUY')?.length ?? 0, color: '#3b82f6' },
        { name: 'SELL', value: orders?.filter(o => o?.orderSide === 'SELL')?.length ?? 0, color: '#ef4444' },
    ];

    // Profit by order
    const profitData = orders?.map((order, idx) => ({
        id: idx,
        profit: parseFloat((order?.profitLoss ?? 0).toFixed(2)),
        side: order?.orderSide,
    })) ?? [];

    // Cumulative profit over time
    let cumulative = 0;
    const cumulativeData = orders
        ?.sort((a: any, b: any) => new Date(a?.createdAt).getMilliseconds() - new Date(b?.createdAt).getMilliseconds())
        ?.map((order, idx) => {
            cumulative += order?.profitLoss ?? 0;
            return {
                idx: idx + 1,
                cumulative: parseFloat(cumulative.toFixed(2)),
            };
        }) ?? [];

    const StatCard = ({ icon: Icon, label, value, subtext, color }: any) => (
        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-slate-500 transition">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{label}</p>
                    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
                    {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
                </div>
                <Icon className="w-8 h-8 text-slate-500" />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Trading Statistics</h1>
                    <p className="text-slate-400">Comprehensive analysis of your BTC/USDT trading activity</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={DollarSign}
                        label="Total Profit/Loss"
                        value={`$${totalProfit?.toFixed(2) ?? 0}`}
                        color={totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}
                    />
                    <StatCard
                        icon={Activity}
                        label="Total Orders"
                        value={totalOrders}
                        subtext={`Avg: $${avgProfit?.toFixed(2) ?? 0}`}
                        color="text-blue-400"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Win Rate"
                        value={`${winRate}%`}
                        subtext={`${winningTrades}W / ${losingTrades}L`}
                        color={Number(winRate) >= 50 ? 'text-green-400' : 'text-orange-400'}
                    />
                    <StatCard
                        icon={Calendar}
                        label="Trading Period"
                        value={orders?.length > 0 ? getDate(orders?.[0]?.createdAt) : 'N/A'}
                        color="text-purple-400"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Profit/Loss by Trade */}
                    <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                        <h2 className="text-lg font-semibold text-white mb-4">Profit/Loss by Trade</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={profitData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="id" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                                <Bar dataKey="profit" radius={[8, 8, 0, 0]} fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status & Side Distribution */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                            <h2 className="text-lg font-semibold text-white mb-4">Order Status</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {statusData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry?.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-slate-300">{statusData?.[0]?.value ?? 0} Closed Orders</p>
                            </div>
                        </div>

                        <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                            <h2 className="text-lg font-semibold text-white mb-4">Buy vs Sell</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={sideData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {sideData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry?.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 flex justify-center gap-4 text-sm">
                                <p className="text-blue-400">Buy: {sideData?.[0]?.value ?? 0}</p>
                                <p className="text-red-400">Sell: {sideData?.[1]?.value ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cumulative Profit Chart */}
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Cumulative Profit Over Time</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cumulativeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="idx" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                            <Line type="monotone" dataKey="cumulative" stroke="#06b6d4" strokeWidth={3} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-600">
                                <tr className="text-slate-300">
                                    <th className="text-left py-3 px-4">Time</th>
                                    <th className="text-left py-3 px-4">Side</th>
                                    <th className="text-right py-3 px-4">Quantity</th>
                                    <th className="text-right py-3 px-4">Price</th>
                                    <th className="text-right py-3 px-4">Profit/Loss</th>
                                    <th className="text-center py-3 px-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders?.slice()?.reverse()?.map((order, idx) => (
                                    <tr key={idx} className="border-b border-slate-600 hover:bg-slate-600/50">
                                        <td className="py-3 px-4 text-slate-300">{getDayTime(order?.createdAt)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${order?.orderSide === 'BUY' ? 'bg-blue-900 text-blue-200' : 'bg-red-900 text-red-200'}`}>
                                                {order?.orderSide}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-300">{order?.quantity ?? 0}</td>
                                        <td className="py-3 px-4 text-right text-slate-300">${order?.price ?? 0}</td>
                                        <td className={`py-3 px-4 text-right font-semibold ${(order?.profitLoss ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${(order?.profitLoss ?? 0).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-200">{order?.status ?? 'CLOSED'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;