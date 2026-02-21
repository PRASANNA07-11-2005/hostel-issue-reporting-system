import { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { HOSTELS } from '../utils/constants';

const StudentDashboard = () => {
    const { addComplaint } = useComplaints();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        category: 'Water',
        priority: 'Low',
        description: ''
    });
    const [toast, setToast] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            showToast('User not authenticated yet. Please wait and try again.', 'error');
            return;
        }
        if (!user.hostel) {
            showToast('Your account has no hostel assigned. Cannot raise complaint.', 'error');
            return;
        }
        if (!formData.description.trim()) {
            showToast('Please provide a description', 'error');
            return;
        }

        addComplaint(formData);
        setFormData({ category: 'Water', priority: 'Low', description: '' });
        showToast('Complaint raised successfully!', 'success');
    };

    const showToast = (message, type) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden">
                <div
                    className="h-40 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${HOSTELS[user?.hostel] || HOSTELS['Panimalar Campus']})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 to-secondary-900/20"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <h1 className="text-3xl font-bold">{user?.name}'s Dashboard</h1>
                        <p className="text-white/80 font-medium flex items-center gap-2 mt-1">
                            <span className="bg-primary-600/80 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Student</span>
                            {user?.hostel || 'Hostel Not Assigned'}
                        </p>
                    </div>
                </div>

                <div className="p-6 md:p-8 relative">
                    {toast && (
                        <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            {toast.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 mt-2">
                        <h2 className="text-xl font-bold text-secondary-900 mb-2">Raise a Complaint</h2>
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-white"
                            >
                                <option value="Water">Water</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Internet">Internet</option>
                                <option value="Room">Room</option>
                                <option value="Mess">Mess</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Priority</label>
                            <div className="flex gap-4">
                                {['Low', 'Medium', 'High'].map(priority => (
                                    <label key={priority} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="priority"
                                            value={priority}
                                            checked={formData.priority === priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-4 h-4 text-primary-600 border-secondary-300 focus:ring-primary-500"
                                        />
                                        <span className="text-sm text-secondary-700 font-medium">{priority}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Description</label>
                            <textarea
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full rounded-lg border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Describe your issue in detail..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm shadow-primary-500/30"
                        >
                            Submit Complaint
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
