import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, DollarSign, ArrowRight, Info, ArrowBigLeft } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { depositeMoney } from '../store/apis';
import { FaBackward } from 'react-icons/fa';

const Deposite = () => {
    const { userId } = useParams();
    const searchParams = useSearchParams()[0];
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [sessionId, setSessionId] = useState('');
    const [depositedAmount, setDepositedAmount] = useState('');
    const navigate = useNavigate()
    const quickAmounts = [100, 500, 1000, 5000];

    useEffect(() => {
        const status = searchParams.get('status');
        const session = searchParams.get('session_id');
        if (status && session) {
            setModalType(status);
            setSessionId(session);
            setShowModal(true);
        }
    }, [searchParams]);

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        setLoading(true);
        setDepositedAmount(amount);

        try {
            const payload = {
                userId: userId,
                amount: parseFloat(amount),
                name: "Crypto Hub"
            };

            const sessionUrl = await depositeMoney(payload);
            window.location.href = sessionUrl.data;
        } catch (error) {
            console.error('Deposit failed:', error);
            setModalType('failed');
            setSessionId('failed_session_' + Date.now());
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setAmount('');
        window.history.replaceState({}, '', `/deposit/${userId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors duration-300">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <ArrowBigLeft onClick={() => navigate("/")} className='bg-white p-1 rounded-full hover:bg-blue-200 cursor-pointer w-10 h-10 hover:size-11 transition-all' color='black' />
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-3">
                        <CreditCard className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Deposit Funds
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add funds to your Crypto Hub account
                    </p>
                </div>

                {/* User Badge */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 mb-6 text-center">
                    <span className="text-xs font-medium text-blue-800 dark:text-blue-400">
                        User ID:{' '}
                    </span>
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        {userId}
                    </span>
                </div>

                {/* Deposit Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-4 transition-colors duration-300">
                    {/* Amount Input */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Amount
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 text-xl text-black dark:text-white font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-800 transition-colors"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Quick Amounts */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Quick Select
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((quickAmount) => (
                                <button
                                    key={quickAmount}
                                    onClick={() => setAmount(quickAmount.toString())}
                                    className="py-2 px-2 text-sm font-semibold border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    ${quickAmount}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Deposit Button */}
                    <button
                        onClick={handleDeposit}
                        disabled={loading || !amount}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Proceed to Payment
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
                            Secure Payment
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                            Your payment is encrypted and processed securely through our payment
                            gateway.
                        </p>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm text-center">
                        <div className="text-2xl mb-1">🔒</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Secure
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm text-center">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Instant
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm text-center">
                        <div className="text-2xl mb-1">💳</div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Verified
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && <Modal modalType={modalType} depositedAmount={depositedAmount} sessionId={sessionId} closeModal={closeModal} />}
        </div>

    );
};

export default Deposite;

const Modal = ({ modalType, depositedAmount, sessionId, closeModal }: any) => {
    const isSuccess = modalType === 'success';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-sm w-full p-6 shadow-2xl transition-colors duration-300">
                <FaBackward />
                <div className="text-center">
                    <div
                        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isSuccess
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/30'
                            }`}
                    >
                        {isSuccess ? (
                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                        ) : (
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {isSuccess ? 'Deposit Successful!' : 'Deposit Failed'}
                    </h2>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {isSuccess
                            ? `Your deposit of $${depositedAmount} has been processed.`
                            : 'Unable to process your deposit. Please try again.'}
                    </p>

                    {isSuccess && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4 border border-green-200 dark:border-green-800">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                ${depositedAmount}
                            </div>
                            <div className="text-xs text-green-700 dark:text-green-300">
                                Deposited Amount
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Transaction ID
                        </div>
                        <div className="text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                            {sessionId}
                        </div>
                    </div>

                    <button
                        onClick={closeModal}
                        className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-colors ${isSuccess
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                    >
                        {isSuccess ? 'Done' : 'Try Again'}
                    </button>
                </div>
            </div>
        </div>

    );
};