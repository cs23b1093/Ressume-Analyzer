import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../utils/user.details.js';

const UserProfile = () => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await fetch('http://localhost:3000/api/v1/user/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">Please log in to view your profile</p>
                    <a 
                        href="/login" 
                        className="inline-block px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Andada+Pro:wght@400;500;600;700&display=swap');
                
                .andada-pro {
                    font-family: 'Andada Pro', serif;
                }
            `}</style>

            <div className="max-w-4xl mx-auto andada-pro">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-black mb-2">Your Profile</h1>
                    <p className="text-gray-600 text-lg">Manage your account information</p>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
                            <User className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-black">
                            {user?.fullName || user?.username || 'User'}
                        </h2>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-6">
                        {/* Email */}
                        <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                            <Mail className="w-6 h-6 text-orange-500 mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                <p className="text-lg text-black font-medium">
                                    {user?.email || 'Not provided'}
                                </p>
                            </div>
                        </div>

                        {/* Username */}
                        {user?.username && (
                            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                <User className="w-6 h-6 text-orange-500 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Username</p>
                                    <p className="text-lg text-black font-medium">
                                        {user.username}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Member Since */}
                        {user?.createdAt && (
                            <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
                                <Calendar className="w-6 h-6 text-orange-500 mt-1" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">Member Since</p>
                                    <p className="text-lg text-black font-medium">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;