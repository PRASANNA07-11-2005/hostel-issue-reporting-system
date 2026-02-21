import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FileText, AlertTriangle, Building } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Sidebar = () => {
    const { user } = useAuth();

    const navItems = {
        Student: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'My Complaints', path: '/complaints', icon: FileText }
        ],
        Warden: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'All Complaints', path: '/complaints', icon: FileText },
            { name: 'Escalated Issues', path: '/escalations', icon: AlertTriangle }
        ],
        Admin: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
            { name: 'Escalated Issues', path: '/escalations', icon: AlertTriangle }
        ]
    };

    const links = navItems[user?.role] || [];

    return (
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-secondary-200 h-full">
            <div className="h-16 flex items-center px-6 border-b border-secondary-200">
                <div className="flex items-center gap-2 text-primary-600">
                    <Building className="w-6 h-6" />
                    <span className="text-xl font-bold">Smart Hostel</span>
                </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
                {links.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            twMerge(
                                clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                                )
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
