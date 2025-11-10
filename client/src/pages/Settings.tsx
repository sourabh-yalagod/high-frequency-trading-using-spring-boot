import { useEffect, useState } from "react";
import { getUserDetails, requestVerifyAccount, updateUsername, verifyAccount } from "../store/apis";
import { useParams } from "react-router-dom";
import { AlertCircle, CheckCircle, Loader2, Mail, Shield, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useUpdateTanstackCache from "../hooks/useUpdateTanstackCache";

export default function Settings() {
    const userId = useParams()?.userId || "";
    const { invalidateCache } = useUpdateTanstackCache()
    const [userDetails, setUserDetails] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifying, setVerifying] = useState(false);

    const [message, setMessage] = useState({ type: '', text: '' });
    const { data, isFetching, isSuccess, isError, error } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => getUserDetails(userId),
        enabled: !!userId, // only fetch if userId exists
    });
    useEffect(() => {
        if (!isFetching && isSuccess) {
            setUserDetails(data?.data);
            setUsername(data?.data.username);
            setMessage({ type: '', text: '' });
        }
        if (!isFetching && isError) {
            setMessage({
                type: 'error',
                text: error?.cause?.toString() || 'Failed to load user details'
            });
        }
    }, [isFetching]);

    const handleRequestOtp = async () => {
        try {
            setSendingOtp(true);
            setMessage({ type: '', text: '' });
            const response = await requestVerifyAccount(userId);
            setMessage({
                type: 'success',
                text: response.data.message || 'OTP sent to your email'
            });
            setShowOtpInput(true);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to send OTP'
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleVerifyAccount = async () => {
        if (!otp || otp.length !== 6) {
            setMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP' });
            return;
        }

        try {
            setVerifying(true);
            setMessage({ type: '', text: '' });
            const response = await verifyAccount(userId, otp);
            setMessage({
                type: 'success',
                text: response.data.message || 'Account verified successfully!'
            });
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Verification failed. Please check your OTP'
            });
        } finally {
            setVerifying(false);
        }
    };

    const handleUpdateUsername = async () => {
        if (!username.trim()) {
            setMessage({ type: 'error', text: 'Username cannot be empty' });
            return;
        }

        try {
            setUpdating(true);
            setMessage({ type: '', text: '' });
            await updateUsername(username);
            invalidateCache('user');
            setMessage({ type: 'success', text: 'Username updated successfully' });
        } catch (error: any) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update username'
            });
        } finally {
            setUpdating(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!userDetails) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Failed to load user details</p>
                </div>
            </div>
        );
    }

    const isVerified = userDetails.twoFactorAuthEntity?.verified;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
                </div>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                        }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm font-medium">{message.text}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900 dark:text-gray-100">{userDetails.email}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Username
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="flex-1 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="Enter username"
                                    />
                                    <button
                                        onClick={handleUpdateUsername}
                                        disabled={updating || username === userDetails.username}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center gap-2 disabled:cursor-not-allowed"
                                    >
                                        {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Update
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Role</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{userDetails.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Balance</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">${userDetails.amount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Verification</h2>
                        </div>

                        <div className="mb-4">
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isVerified
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                }`}>
                                {isVerified ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-4 h-4" />
                                        Not Verified
                                    </>
                                )}
                            </div>
                        </div>

                        {!isVerified && (
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Verify your account to unlock additional features and enhance security.
                                </p>

                                {!showOtpInput ? (
                                    <button
                                        onClick={handleRequestOtp}
                                        disabled={sendingOtp}
                                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                                    >
                                        {sendingOtp ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-4 h-4" />
                                                Request Verification OTP
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Enter 6-digit OTP
                                            </label>
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleVerifyAccount}
                                                disabled={verifying || otp.length !== 6}
                                                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                                            >
                                                {verifying ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Verifying...
                                                    </>
                                                ) : (
                                                    'Verify Account'
                                                )}
                                            </button>
                                            <button
                                                onClick={handleRequestOtp}
                                                disabled={sendingOtp}
                                                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-lg transition disabled:cursor-not-allowed"
                                            >
                                                Resend
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isVerified && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your account has been successfully verified. Thank you for confirming your email address.
                            </p>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Status</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${userDetails.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Account Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${!userDetails.accountNonLocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Not Locked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${userDetails.credentialsNonExpired ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Credentials Valid</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${userDetails.accountNonExpired ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Not Expired</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}