import { LogoutButton } from '../auth/LogoutButton';
import { useAuth } from '../hooks/useAuth';


export const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
                        <LogoutButton />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-lg font-medium text-gray-900 mb-4">
                                Welcome, {user?.username || user?.email}!
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Email:</span>
                                    <p className="text-sm text-gray-900">{user?.email}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">First Name:</span>
                                    <p className="text-sm text-gray-900">{user?.firstName}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Last Name:</span>
                                    <p className="text-sm text-gray-900">{user?.lastName}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-medium text-gray-500">Email Verified:</span>
                                    <p className="text-sm text-gray-900">
                                        {user?.isEmailVerified ? 'Yes' : 'No'}
                                    </p>
                                </div>
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};