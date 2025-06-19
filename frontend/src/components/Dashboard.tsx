import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
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
                            <span className="text-sm font-medium text-gray-500">Full Name:</span>
                            <p className="text-sm text-gray-900">{user?.fullName}</p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Role:</span>
                            <p className="text-sm text-gray-900 capitalize">{user?.role || 'user'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};