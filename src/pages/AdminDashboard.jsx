import { useComplaints } from '../context/ComplaintContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import ComplaintsList from './ComplaintsList';

const AdminDashboard = () => {
    const { complaints } = useComplaints();

    const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;

    const getCategoryData = () => {
        const cats = { Water: 0, Electricity: 0, Internet: 0, Room: 0, Mess: 0 };
        complaints.forEach(c => { if (cats[c.category] !== undefined) cats[c.category]++; });
        return Object.keys(cats).map(name => ({ name, value: cats[name] }));
    };

    const getStatusData = () => {
        return [
            { name: 'Pending', value: pendingCount, color: '#eab308' },
            { name: 'In Progress', value: inProgressCount, color: '#3b82f6' },
            { name: 'Resolved', value: resolvedCount, color: '#10b981' },
            { name: 'Escalated', value: escalatedCount, color: '#ef4444' }
        ];
    };

    const COLORS = ['#0ea5e9', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
    const statusData = getStatusData();

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-200 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-secondary-500 mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-secondary-900">{value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${colorClass}`}>
                <Icon className="w-7 h-7" />
            </div>
        </div>
    );
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden mb-6">
                <div
                    className="h-40 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2000&auto=format&fit=crop)` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 to-secondary-900/20"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
                        <p className="text-white/80 font-medium mt-1">
                            System Overview • Panimalar Engineering College
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Escalated" value={escalatedCount} icon={AlertCircle} colorClass="bg-red-50 text-red-600" />
                <StatCard title="Pending Issues" value={pendingCount} icon={Clock} colorClass="bg-yellow-50 text-yellow-600" />
                <StatCard title="In Progress" value={inProgressCount} icon={TrendingUp} colorClass="bg-blue-50 text-blue-600" />
                <StatCard title="Resolved" value={resolvedCount} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-200">
                    <h2 className="text-lg font-semibold text-secondary-800 mb-6">Complaints by Category</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getCategoryData()} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-secondary-200">
                    <h2 className="text-lg font-semibold text-secondary-800 mb-6">Complaints by Status</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="value">
                                    {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">All System Complaints</h2>
                <ComplaintsList />
            </div>
        </div>
    );
};

export default AdminDashboard;
