import { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { HOSTELS } from '../utils/constants';

const WardenDashboard = () => {
    const { complaints, updateComplaint } = useComplaints();
    const { user } = useAuth();
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionComment, setResolutionComment] = useState('');
    const [newStatus, setNewStatus] = useState('In Progress');

    // Warden sees non-escalated complaints for their hostel
    const activeComplaints = complaints.filter(c => c.status !== 'Escalated' && c.reporterHostel === user?.hostel);

    const handleUpdate = (e) => {
        e.preventDefault();
        if (!selectedComplaint) return;

        updateComplaint(selectedComplaint.id, {
            status: newStatus,
            resolutionComment
        });

        setSelectedComplaint(null);
        setResolutionComment('');
        setNewStatus('In Progress');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'In Progress': return 'bg-blue-100 text-blue-800';
            case 'Resolved': return 'bg-emerald-100 text-emerald-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 overflow-hidden mb-6">
                <div
                    className="h-32 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${HOSTELS[user?.hostel] || HOSTELS['Panimalar Campus']})` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/90 to-secondary-900/20"></div>
                    <div className="absolute bottom-4 left-6 text-white flex justify-between items-end w-[calc(100%-3rem)]">
                        <div>
                            <h1 className="text-2xl font-bold">Warden Dashboard</h1>
                            <p className="text-white/80 font-medium flex items-center gap-2 mt-1">
                                <span className="bg-emerald-600/80 px-2 py-0.5 rounded text-xs uppercase tracking-wider">Warden</span>
                                {user?.hostel || 'Hostel Not Assigned'}
                            </p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium border border-white/10">
                            <span className="text-white/80">Pending:</span>{' '}
                            <span className="text-white font-bold">{activeComplaints.filter(c => c.status === 'Pending').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                    <div className="p-5 border-b border-secondary-100 bg-secondary-50">
                        <h2 className="font-semibold text-secondary-800">Actionable Complaints</h2>
                    </div>
                    <div className="divide-y divide-secondary-100 max-h-[600px] overflow-y-auto">
                        {activeComplaints.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center text-secondary-500">
                                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-primary-400" />
                                </div>
                                <h3 className="text-lg font-bold text-secondary-900">No pending complaints.</h3>
                                <p className="text-secondary-500 mt-1">All issues in your hostel are currently resolved or escalated.</p>
                            </div>
                        ) : (
                            activeComplaints.map(complaint => (
                                <div
                                    key={complaint.id}
                                    onClick={() => {
                                        setSelectedComplaint(complaint);
                                        setNewStatus(complaint.status === 'Pending' ? 'In Progress' : complaint.status);
                                        setResolutionComment(complaint.resolutionComment || '');
                                    }}
                                    className={`p-5 cursor-pointer transition-colors hover:bg-primary-50 ${selectedComplaint?.id === complaint.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-secondary-900">#{complaint.id.slice(-4)}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(complaint.status)}`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-secondary-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(complaint.createdAt), 'MMM d, HH:mm')}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-secondary-800 mb-1">
                                        {complaint.category} • <span className={complaint.priority === 'High' ? 'text-red-600' : ''}>{complaint.priority} Priority</span>
                                    </h3>
                                    <p className="text-sm text-secondary-600 line-clamp-2">{complaint.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div>
                    {selectedComplaint ? (
                        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6 sticky top-6">
                            <h2 className="text-lg font-bold text-secondary-900 mb-4">Update Status</h2>
                            <div className="mb-4">
                                <span className="text-xs font-semibold text-secondary-500 uppercase tracking-wider block mb-1">Complaint ID</span>
                                <span className="text-secondary-900 font-medium">#{selectedComplaint.id}</span>
                            </div>

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">New Status</label>
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 outline-none focus:border-primary-500 bg-white"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Resolution Comment</label>
                                    <textarea
                                        rows="3"
                                        value={resolutionComment}
                                        onChange={(e) => setResolutionComment(e.target.value)}
                                        placeholder="E.g. Plumber assigned..."
                                        className="w-full rounded-lg border border-secondary-300 px-4 py-2.5 outline-none focus:border-primary-500"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    Save Update
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-8 text-center flex flex-col items-center justify-center h-64 text-secondary-500">
                            <MessageSquare className="w-12 h-12 mb-3 text-secondary-300" />
                            <p className="font-medium">Select a complaint from the list to view details and update its status.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WardenDashboard;
