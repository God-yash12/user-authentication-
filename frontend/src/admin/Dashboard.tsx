import React, { useState, useEffect } from 'react';
import BeatLoader from "react-spinners/BeatLoader";
import { FaUsers, FaFirstOrderAlt, FaUserShield, FaUser, FaCalendarAlt, FaCheck, FaTimes } from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";
import { api } from '../lib/auth-api';

interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    revenue: number;
    activeUsers: number;
}

interface RecentActivity {
    id: string;
    action: string;
    user: string;
    timestamp: string;
}

interface UserData {
    email: string;
    username: string;
    fullName: string;
    createdAt: string;
    loginAttempts: number;
    isEmailVerified: boolean;
    role: 'admin' | 'user';
}

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0,
        activeUsers: 0
    });

    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);

    useEffect(() => {
        // Fetch dashboard stats
        const fetchDashboardData = async () => {
            setIsLoading(true);
            
            try {
                // Mock stats - replace with actual API calls
                setStats({
                    totalUsers: 1250,
                    totalOrders: 847,
                    revenue: 32450,
                    activeUsers: 156
                });

                // Fetch user data
                const response = await api.get('/users');
                const userData = response.data;
                
                // Sort users with admins first
                const sortedUsers = [...userData].sort((a, b) => 
                    a.role === 'admin' && b.role !== 'admin' ? -1 : 
                    a.role !== 'admin' && b.role === 'admin' ? 1 : 0
                );
                
                setUsers(sortedUsers);
                setFilteredUsers(sortedUsers);
                
                // Mock recent activity
                setRecentActivity([
                    { id: '1', action: 'New user registered', user: 'john.doe@email.com', timestamp: '2 minutes ago' },
                    { id: '2', action: 'Order completed', user: 'jane.smith@email.com', timestamp: '5 minutes ago' },
                    { id: '3', action: 'Payment processed', user: 'mike.wilson@email.com', timestamp: '10 minutes ago' },
                    { id: '4', action: 'User updated profile', user: 'sarah.brown@email.com', timestamp: '15 minutes ago' },
                ]);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
                setIsLoadingUsers(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Filter users based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const filtered = users.filter(user => 
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredUsers(filtered);
        }
    }, [searchTerm, users]);

    const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> =
        ({ title, value, icon, color }) => {
            const colorClasses = {
                blue: 'bg-blue-50 border-blue-200 text-blue-800',
                green: 'bg-green-50 border-green-200 text-green-800',
                purple: 'bg-purple-50 border-purple-200 text-purple-800',
                orange: 'bg-orange-50 border-orange-200 text-orange-800'
            };

            return (
                <div className={`p-6 rounded-lg border-2 shadow-sm ${colorClasses[color as keyof typeof colorClasses]}`}>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl">{icon}</div>
                        <div className="text-right">
                            <h3 className="text-sm font-medium opacity-75">{title}</h3>
                            <p className="text-2xl font-bold mt-1">{value}</p>
                        </div>
                    </div>
                </div>
            );
        };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600"><BeatLoader /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="space-y-8">
                {/* Stats Section */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers.toLocaleString()}
                            icon={<FaUsers />}
                            color="blue"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.totalOrders.toLocaleString()}
                            icon={<FaFirstOrderAlt />}
                            color="green"
                        />
                        <StatCard
                            title="Revenue"
                            value={`$${stats.revenue.toLocaleString()}`}
                            icon={<GiTakeMyMoney />}
                            color="purple"
                        />
                        <StatCard
                            title="Active Users"
                            value={stats.activeUsers.toLocaleString()}
                            icon={<FaUser />}
                            color="orange"
                        />
                    </div>
                </section>

                {/* User Data Table */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="p-4 border-b">
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium">All Users ({users.length})</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        className="pl-8 pr-4 py-2 border rounded-lg text-sm w-64"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <FaUser className="absolute left-3 top-3 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        
                        {isLoadingUsers ? (
                            <div className="p-8 flex justify-center">
                                <BeatLoader />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Attempts</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.email} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.fullName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.role === 'admin' 
                                                            ? 'bg-purple-100 text-purple-800' 
                                                            : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.role === 'admin' ? (
                                                            <span className="flex items-center">
                                                                <FaUserShield className="mr-1" /> Admin
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center">
                                                                <FaUser className="mr-1" /> User
                                                            </span>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.isEmailVerified ? (
                                                        <span className="text-green-600 flex items-center">
                                                            <FaCheck className="mr-1" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-600 flex items-center">
                                                            <FaTimes className="mr-1" /> Not Verified
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.loginAttempts > 0 ? (
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            user.loginAttempts >= 5 
                                                                ? 'bg-red-100 text-red-800' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                            {user.loginAttempts}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-500">0</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                                    <FaCalendarAlt className="mr-2 text-gray-400" />
                                                    {formatDate(user.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredUsers.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">
                                        No users found matching your search criteria
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Activity Section */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-lg shadow-sm border">
                        {recentActivity.map((activity, index) => (
                            <div key={activity.id} className={`p-4 flex items-center justify-between ${index !== recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-900">{activity.action}</span>
                                    <span className="text-sm text-gray-600">{activity.user}</span>
                                </div>
                                <span className="text-sm text-gray-500">{activity.timestamp}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;