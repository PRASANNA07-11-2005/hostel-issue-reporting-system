import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { AlertTriangle, Clock } from 'lucide-react';

const EscalationsList = () => {
    const { complaints } = useComplaints();
    const { user } = useAuth();

    let escalatedComplaints = complaints.filter(c => c.status === 'Escalated');
    if (user?.role === 'Warden') {
        escalatedComplaints = escalatedComplaints.filter(c => c.reporterHostel === user.hostel);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                    Escalated Complaints
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                {escalatedComplaints.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900">No Escalations</h3>
                        <p className="text-secondary-500 mt-1">All complaints are being resolved within the 48-hour SLA.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-secondary-100">
                        {escalatedComplaints.map(complaint => (
                            <div key={complaint.id} className="p-6 hover:bg-secondary-50 transition-colors">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-bold text-secondary-900 border border-secondary-200 px-2 py-1 rounded-md bg-white">
                                                #{complaint.id.slice(-4)}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                {complaint.category}
                                            </span>
                                            <span className="text-xs font-medium text-secondary-500 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                Reported: {format(new Date(complaint.createdAt), 'MMM d, yyyy HH:mm')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{complaint.description}</h3>
                                        {complaint.resolutionComment && (
                                            <div className="text-sm text-secondary-600 bg-secondary-50 p-3 rounded-lg border border-secondary-100 mt-3 flex items-start gap-2">
                                                <span className="font-semibold shrink-0">Warden's Note:</span>
                                                <p>{complaint.resolutionComment}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="shrink-0 flex items-center gap-2">
                                        <span className="text-red-600 bg-red-50 px-3 py-1.5 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-1">
                                            <AlertTriangle className="w-4 h-4" />
                                            ESCALATED
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EscalationsList;
