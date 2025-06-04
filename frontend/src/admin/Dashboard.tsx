import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { LogoutButton } from '../auth/LogoutButton';

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

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalOrders: 0,
        revenue: 0,
        activeUsers: 0
    });
    
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API calls
        const fetchDashboardData = async () => {
            setIsLoading(true);
            
            // Mock data - replace with actual API calls
            setTimeout(() => {
                setStats({
                    totalUsers: 1250,
                    totalOrders: 847,
                    revenue: 32450,
                    activeUsers: 156
                });
                
                setRecentActivity([
                    { id: '1', action: 'New user registered', user: 'john.doe@email.com', timestamp: '2 minutes ago' },
                    { id: '2', action: 'Order completed', user: 'jane.smith@email.com', timestamp: '5 minutes ago' },
                    { id: '3', action: 'Payment processed', user: 'mike.wilson@email.com', timestamp: '10 minutes ago' },
                    { id: '4', action: 'User updated profile', user: 'sarah.brown@email.com', timestamp: '15 minutes ago' },
                ]);
                
                setIsLoading(false);
            }, 1000);
        };

        fetchDashboardData();
    }, []);

    const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string }> = 
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600"><LoadingSpinner /></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <header className="mb-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Export Data
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            Settings
                        </button>
                        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                            <LogoutButton className="text-sm" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="space-y-8">
                {/* Stats Section */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers.toLocaleString()}
                            icon="👥"
                            color="blue"
                        />
                        <StatCard
                            title="Total Orders"
                            value={stats.totalOrders.toLocaleString()}
                            icon="📦"
                            color="green"
                        />
                        <StatCard
                            title="Revenue"
                            value={`$${stats.revenue.toLocaleString()}`}
                            icon="💰"
                            color="purple"
                        />
                        <StatCard
                            title="Active Users"
                            value={stats.activeUsers.toLocaleString()}
                            icon="🟢"
                            color="orange"
                        />
                    </div>
                </section>

                {/* Charts Section */}
                <section>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Analytics</h3>
                            <div className="h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-center">
                                <p className="text-gray-600 font-medium">Chart component would go here</p>
                                <small className="text-gray-500 mt-2">Integrate with Chart.js, Recharts, or similar library</small>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                            <div className="h-64 bg-gray-50 rounded-lg flex flex-col items-center justify-center text-center">
                                <p className="text-gray-600 font-medium">Chart component would go here</p>
                                <small className="text-gray-500 mt-2">Integrate with Chart.js, Recharts, or similar library</small>
                            </div>
                        </div>
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

                {/* Quick Actions */}
                <section>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
                            <span className="text-2xl block mb-2">👤</span>
                            <span className="font-medium text-gray-900">Manage Users</span>
                        </button>
                        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
                            <span className="text-2xl block mb-2">📊</span>
                            <span className="font-medium text-gray-900">View Reports</span>
                        </button>
                        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
                            <span className="text-2xl block mb-2">⚙️</span>
                            <span className="font-medium text-gray-900">System Settings</span>
                        </button>
                        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
                            <span className="text-2xl block mb-2">📧</span>
                            <span className="font-medium text-gray-900">Send Notifications</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminDashboard;