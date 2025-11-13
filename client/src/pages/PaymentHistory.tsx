import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { getPaymentHistory } from '../store/apis';
import { getUserId } from '../utils/jwt';

const PaymentHistory = () => {
    const [payments, setPayments] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        getPaymentHistory(getUserId() as string).then(res => {
            setPayments(res.data);
            prepareChartData(res.data);
        }).catch((error: any) => {
            console.log(error);
        }).finally(() => {
            setLoading(false);
        })

    }, []);
    useEffect(() => {
        prepareChartData(payments);
    }, [payments]);

    const prepareChartData = (data: any) => {
        const amountCounts: any = {};
        data?.forEach((payment: any) => {
            const time = new Date(payment?.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            amountCounts[time] = (amountCounts[time] || 0) + (payment?.amount || 0);
        });

        const chartArray: any = Object.entries(amountCounts).map(([time, amount]) => ({
            time,
            amount
        }));
        setChartData(chartArray);
    };

    const totalAmount = payments?.reduce((sum: any, p: any) => sum + (p?.amount || 0), 0) || 0;
    const successfulPayments = payments?.filter((p: any) => p?.paymentStatus === 'SUCCESS')?.length || 0;
    const failedPayments = payments?.filter((p: any) => p?.paymentStatus === 'FAILED')?.length || 0;
    const pendingPayments = payments?.filter((p: any) => p?.paymentStatus === 'PENDING')?.length || 0;

    const formatDate = (dateString: any) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status: any) => {
        const configs: any = {
            SUCCESS: {
                bgColor: 'bg-green-900',
                textColor: 'text-green-200',
                icon: CheckCircle,
                label: 'Successful'
            },
            FAILED: {
                bgColor: 'bg-red-900',
                textColor: 'text-red-200',
                icon: AlertCircle,
                label: 'Failed'
            },
            PENDING: {
                bgColor: 'bg-yellow-900',
                textColor: 'text-yellow-200',
                icon: Clock,
                label: 'Pending'
            }
        };
        return configs[status] || configs.PENDING;
    };

    const StatusBadge = ({ status }: any) => {
        const config = getStatusConfig(status);
        const IconComponent = config.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                <IconComponent className="w-3 h-3" />
                {status}
            </span>
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-lg">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Payment History</h1>
                    <p className="text-slate-400">Track and manage your transactions</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Amount</p>
                                <p className="text-3xl font-bold mt-2">${totalAmount?.toLocaleString()}</p>
                            </div>
                            <DollarSign className="w-12 h-12 text-blue-200 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Successful</p>
                                <p className="text-3xl font-bold mt-2">{successfulPayments}</p>
                            </div>
                            <CheckCircle className="w-12 h-12 text-green-200 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Failed</p>
                                <p className="text-3xl font-bold mt-2">{failedPayments}</p>
                            </div>
                            <AlertCircle className="w-12 h-12 text-red-200 opacity-80" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Pending</p>
                                <p className="text-3xl font-bold mt-2">{pendingPayments}</p>
                            </div>
                            <Clock className="w-12 h-12 text-yellow-200 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Bar Chart */}
                    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-4">Transaction Amount by Time</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis dataKey="time" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelStyle={{ color: '#e2e8f0' }} />
                                <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
                        <h2 className="text-xl font-bold text-white mb-4">Payment Status Distribution</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Successful</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-white font-semibold">{successfulPayments} ({Math.round((successfulPayments / (payments?.length || 1)) * 100)}%)</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(successfulPayments / (payments?.length || 1)) * 100}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-300">Failed</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span className="text-white font-semibold">{failedPayments} ({Math.round((failedPayments / (payments?.length || 1)) * 100)}%)</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(failedPayments / (payments?.length || 1)) * 100}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-300">Pending</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <span className="text-white font-semibold">{pendingPayments} ({Math.round((pendingPayments / (payments?.length || 1)) * 100)}%)</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(pendingPayments / (payments?.length || 1)) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Records Table */}
                <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-700">
                        <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-700 border-b border-slate-600">
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Amount</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Session ID</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments?.map((payment: any, index: number) => (
                                    <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                                        <td className="px-6 py-4 text-sm text-slate-300">{formatDate(payment?.createdAt)}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-100">${payment?.amount}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={payment?.paymentStatus} />
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">{payment?.sessionId?.slice(0, 20)}...</td>
                                        <td className="px-6 py-4 text-xs text-slate-400 font-mono">{payment?.id?.slice(0, 12)}...</td>
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

export default PaymentHistory;