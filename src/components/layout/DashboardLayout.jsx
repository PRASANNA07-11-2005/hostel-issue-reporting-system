import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const DashboardLayout = () => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="flex h-screen bg-secondary-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-0 flex flex-col">
                    <div className="flex-1">
                        <Outlet />
                    </div>
                    <Footer />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
