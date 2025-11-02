import { useEffect, useState } from 'react';
import { User, Mail, Shield, Key, CreditCard, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { getUserId } from '../utils/jwt';
import { getUserDetails } from '../store/apis';
import { useParams } from 'react-router-dom';

interface TwoFactorAuthEntity {
    id: string;
    channel: string;
    otp: string | null;
    verified: boolean;
}

interface UserData {
    id: string;
    username: string;
    email: string;
    refreshToken: string | null;
    amount: number | null;
    password: string;
    role: string;
    twoFactorAuthEntity: TwoFactorAuthEntity;
}

const UserProfile = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'account'>('overview');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!getUserId()) {
                setError('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getUserDetails(userId || "");
                setUserData(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to load user data');
                console.error('Error fetching user data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId]);

    const formatDate = (id: string) => {
        return "Member since 2024";
    };

    const StatusBadge = ({ verified }: { verified: boolean }) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${verified
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
            {verified ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            {verified ? 'Verified' : 'Unverified'}
        </span>
    );

    const RoleBadge = ({ role }: { role: string }) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${role === 'ADMIN'
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
            <Shield className="w-3.5 h-3.5" />
            {role}
        </span>
    );

    // Skeleton Loaders
    const HeaderSkeleton = () => (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sm:p-6 lg:p-8 mb-6 shadow-2xl animate-pulse">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gray-700"></div>
                <div className="flex-1 w-full space-y-3">
                    <div className="h-6 sm:h-8 bg-gray-700 rounded w-48 max-w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-64 max-w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="w-full lg:w-auto mt-4 lg:mt-0">
                    <div className="h-24 sm:h-28 bg-gray-700 rounded-xl w-full lg:w-40"></div>
                </div>
            </div>
        </div>
    );

    const CardSkeleton = () => (
        <div className="bg-gray-900/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 animate-pulse">
            <div className="w-10 h-10 bg-gray-700 rounded-lg mb-3"></div>
            <div className="h-3 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-5 bg-gray-700 rounded w-32"></div>
        </div>
    );

    const ContentSkeleton = () => (
        <div className="space-y-6">
            <div className="h-6 bg-gray-700 rounded w-48 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50 animate-pulse">
                <div className="h-5 bg-gray-700 rounded w-40 mb-4"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between py-2">
                            <div className="h-4 bg-gray-700 rounded w-32"></div>
                            <div className="h-4 bg-gray-700 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Error State
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
                    <p className="text-red-400 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                {loading ? (
                    <HeaderSkeleton />
                ) : userData && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sm:p-6 lg:p-8 mb-6 shadow-2xl">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 sm:gap-6">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold shadow-lg">
                                    {userData.username.charAt(0).toUpperCase()}
                                </div>
                                <div className={`absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 sm:border-4 border-gray-800 ${userData.twoFactorAuthEntity.verified ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}></div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
                                        {userData.username}
                                    </h1>
                                    <div className="flex flex-wrap gap-2">
                                        <RoleBadge role={userData.role} />
                                        <StatusBadge verified={userData.twoFactorAuthEntity.verified} />
                                    </div>
                                </div>
                                <p className="text-gray-400 flex items-center gap-2 mb-1 text-sm sm:text-base truncate">
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    <span className="truncate">{userData.email}</span>
                                </p>
                                <p className="text-gray-500 text-xs sm:text-sm">{formatDate(userData.id)}</p>
                            </div>

                            {/* Balance */}
                            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-5 lg:p-6 text-white shadow-lg w-full lg:w-auto lg:min-w-[200px]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                    <span className="text-xs sm:text-sm font-medium">Balance</span>
                                </div>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                                    ${userData.amount?.toLocaleString() || '0.00'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Overview', icon: User },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'account', label: 'Details', icon: Key }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            disabled={loading}
                            className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 border border-gray-700/50'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.id === 'account' ? 'Details' : tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 sm:p-6 lg:p-8 shadow-2xl">
                    {loading ? (
                        <ContentSkeleton />
                    ) : userData ? (
                        <>
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Profile Overview</h2>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <InfoCard
                                            icon={<User className="w-5 h-5" />}
                                            label="Username"
                                            value={userData.username}
                                            color="blue"
                                        />
                                        <InfoCard
                                            icon={<Mail className="w-5 h-5" />}
                                            label="Email Address"
                                            value={userData.email}
                                            color="blue"
                                        />
                                        <InfoCard
                                            icon={<Shield className="w-5 h-5" />}
                                            label="Account Role"
                                            value={userData.role}
                                            color="purple"
                                        />
                                        <InfoCard
                                            icon={<CreditCard className="w-5 h-5" />}
                                            label="Account Balance"
                                            value={`$${userData.amount?.toLocaleString() || '0.00'}`}
                                            color="green"
                                        />
                                    </div>

                                    <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Account Status</h3>
                                        <div className="space-y-3">
                                            <StatusRow
                                                label="Email Verification"
                                                status={userData.twoFactorAuthEntity.verified}
                                            />
                                            <StatusRow
                                                label="Two-Factor Authentication"
                                                status={userData.twoFactorAuthEntity.verified}
                                            />
                                            <StatusRow
                                                label="Active Session"
                                                status={userData.refreshToken !== null}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Security Settings</h2>

                                    <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                        <div className="flex items-start gap-3 sm:gap-4 mb-6">
                                            <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${userData.twoFactorAuthEntity.verified
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                                    Two-Factor Authentication
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-4">
                                                    Channel: {userData.twoFactorAuthEntity.channel}
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${userData.twoFactorAuthEntity.verified
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                        }`}>
                                                        {userData.twoFactorAuthEntity.verified ? 'Enabled' : 'Not Enabled'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                        <div className="flex items-start gap-3 sm:gap-4">
                                            <div className="p-2 sm:p-3 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
                                                <Key className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                                    Password
                                                </h3>
                                                <p className="text-gray-400 text-sm mb-4">
                                                    Last updated: Recently
                                                </p>
                                                <p className="text-gray-500 text-xs font-mono break-all">
                                                    {userData.password.substring(0, 40)}...
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Session Status</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                            <span className="text-gray-400 text-sm sm:text-base">Active Refresh Token</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${userData.refreshToken
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {userData.refreshToken ? 'Active' : 'None'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Details</h2>

                                    <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                        <DetailRow label="User ID" value={userData.id} />
                                        <DetailRow label="Username" value={userData.username} />
                                        <DetailRow label="Email" value={userData.email} />
                                        <DetailRow label="Role" value={userData.role} />
                                        <DetailRow label="Account Balance" value={`$${userData.amount || '0.00'}`} />
                                    </div>

                                    <div className="bg-gray-900/50 rounded-xl p-4 sm:p-6 border border-gray-700/50">
                                        <h3 className="text-base sm:text-lg font-semibold text-white mb-4">2FA Details</h3>
                                        <DetailRow label="2FA ID" value={userData.twoFactorAuthEntity.id} />
                                        <DetailRow label="Channel" value={userData.twoFactorAuthEntity.channel} />
                                        <DetailRow label="Verified" value={userData.twoFactorAuthEntity.verified ? 'Yes' : 'No'} />
                                        <DetailRow
                                            label="OTP Status"
                                            value={userData.twoFactorAuthEntity.otp || 'Not Set'}
                                            isLast
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

// Helper Components
const InfoCard = ({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: string
}) => {
    const colorClasses = {
        blue: 'from-blue-600 to-blue-700',
        purple: 'from-purple-600 to-purple-700',
        green: 'from-green-600 to-green-700',
    };

    return (
        <div className="bg-gray-900/50 rounded-xl p-4 sm:p-5 border border-gray-700/50 hover:border-gray-600/50 transition-all">
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} mb-3`}>
                {icon}
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-1">{label}</p>
            <p className="text-white text-base sm:text-lg font-semibold truncate">{value}</p>
        </div>
    );
};

const StatusRow = ({ label, status }: { label: string; status: boolean }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2">
        <span className="text-gray-300 text-sm sm:text-base">{label}</span>
        <span className="flex items-center gap-2">
            {status ? (
                <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    <span className="text-green-400 font-medium text-sm sm:text-base">Active</span>
                </>
            ) : (
                <>
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span className="text-gray-500 font-medium text-sm sm:text-base">Inactive</span>
                </>
            )}
        </span>
    </div>
);

const DetailRow = ({ label, value, isLast = false }: {
    label: string;
    value: string;
    isLast?: boolean
}) => (
    <div className={`py-3 ${!isLast ? 'border-b border-gray-700/50' : ''}`}>
        <p className="text-gray-400 text-xs sm:text-sm mb-1">{label}</p>
        <p className="text-white font-mono text-xs sm:text-sm break-all">{value}</p>
    </div>
);

export default UserProfile;