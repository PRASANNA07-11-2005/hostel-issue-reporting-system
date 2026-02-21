import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-secondary-200 h-16 flex items-center justify-between px-6 shrink-0">
            <div className="lg:hidden text-lg font-bold text-primary-600">
                Smart Hostel
            </div>
            <div className="hidden lg:block">
                <h2 className="text-xl font-semibold text-secondary-800">
                    {user?.role === 'Student' && 'Student Portal'}
                    {user?.role === 'Warden' && 'Warden Portal'}
                    {user?.role === 'Admin' && 'Admin Portal'}
                </h2>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-secondary-600">
                    <User className="w-5 h-5" />
                    <span className="font-medium hidden sm:block">{user?.name}</span>
                </div>
                <button
                    onClick={logout}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1"
                    title="Logout"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:block text-sm font-medium">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
