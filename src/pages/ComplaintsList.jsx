import React, { useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth, findProfileByEmail } from '../context/AuthContext';
import { format } from 'date-fns';

const ComplaintsList = () => {
    const { complaints, updateComplaint } = useComplaints();

    // filter complaints based on logged-in role
    const { user } = useAuth();

    // diagnostic logs for debugging visibility issues
    console.log('ComplaintsList user', user);
    console.log('All complaints', complaints);

    // newer spec: student sees only their complaints, warden sees those assigned to them
    let visible = complaints;
    let ignored = [];

    if (user?.role === 'Student') {
        visible = complaints.filter(c => c.reporterUid === user.uid);
    } else if (user?.role === 'Warden') {
        visible = complaints.filter(c => c.assignedWardenUid === user.uid);
        // for diagnostics show ones with a different assignment
        ignored = complaints.filter(c => c.assignedWardenUid && c.assignedWardenUid !== user.uid);
        // also log unassigned complaints if any
        const unassigned = complaints.filter(c => !c.assignedWardenUid);
        if (unassigned.length) {
            console.log('Warden dashboard: unassigned complaints', unassigned);
        }
    } else if (user?.role === 'Admin') {
        // admin sees everything so visible stays as complaints
    }

    if (user?.role === 'Warden') {
        console.log('visible complaints after filter', visible);
        console.log('ignored (other assignments)', ignored);
    }

    // if a warden opens the list and there are complaints with no assigned warden,
    // automatically assign them to the current warden so they appear immediately
    React.useEffect(() => {
        if (user?.role === 'Warden' && complaints.length > 0) {
            const unassigned = complaints.filter(c => !c.assignedWardenUid);
            if (unassigned.length) {
                console.log('auto-assigning', unassigned.length, 'unassigned complaints to warden', user.uid);
                unassigned.forEach(c => {
                    updateComplaint(c.id, { assignedWardenUid: user.uid });
                });
            }
        }
    }, [user, complaints, updateComplaint]);

    const pendingCount = visible.filter(c => c.status === 'Pending').length;
    const newCount = visible.filter(c => {
        const hours = (new Date() - new Date(c.createdAt)) / (1000*60*60);
        return hours < 24;
    }).length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Escalated': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'text-red-600 bg-red-50';
            case 'Medium': return 'text-orange-600 bg-orange-50';
            case 'Low': return 'text-green-600 bg-green-50';
            default: return '';
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">Complaints</h1>
            {user?.role === 'Warden' && user.hostel && (
                <p className="text-sm text-secondary-600 mb-2">Showing complaints for {user.hostel}</p>
            )}
            {user && (
                <p className="text-sm text-secondary-600 mb-2">
                    Role: {user.role} {user.hostel && `(Hostel: ${user.hostel})`}
                </p>
            )}
            {(user?.role === 'Warden' || user?.role === 'Admin') && (
                <p className="text-sm text-secondary-600 mb-4">
                    Pending: {pendingCount} &middot; New (24h): {newCount}
                </p>
            )}
            {/* show warden diagnostic list when there are complaints but none visible */}
            {user?.role === 'Warden' && complaints.length > 0 && visible.length === 0 && (
                <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-yellow-800 text-sm">
                        <strong>Debug:</strong> You currently have no assigned complaints (total stored: {complaints.length}).
                        Below is a summary of all complaints, showing their assigned warden (if any).
                    </p>
                    <ul className="mt-2 list-disc list-inside text-xs text-yellow-800">
                        {complaints.map(c => (
                            <li key={c.id}>
                                #{c.id.slice(-4)} – assigned_warden: &quot;{c.assignedWardenUid || '<none>'}&quot;; reporter_uid: &quot;{c.reporterUid || '<unknown>'}&quot;
                            </li>
                        ))}
                    </ul>
                    {ignored.length > 0 && (
                        <div className="mt-2 text-yellow-800 text-xs">
                            Additionally, the following complaints are assigned to others:
                            <ul className="list-disc list-inside">
                                {ignored.map(c => (
                                    <li key={c.id}>
                                        #{c.id.slice(-4)} (warden {c.assignedWardenUid})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-primary-700 to-primary-500 text-white text-sm font-semibold uppercase tracking-wider shadow-sm">
                                <th className="px-6 py-4">ID / Date</th>
                                {(user?.role === 'Warden' || user?.role === 'Admin') && (
                                    <th className="px-6 py-4">Reporter</th>
                                )}
                                {(user?.role === 'Warden' || user?.role === 'Admin') && (
                                    <th className="px-6 py-4">Assigned Warden</th>
                                )}
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-100">
                            {visible.length === 0 ? (
                                <tr>
                                    <td colSpan={user?.role === 'Warden' || user?.role === 'Admin' ? 6 : 5} className="px-6 py-20">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                                                <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-secondary-900">No complaints raised yet.</h3>
                                            <p className="text-secondary-500 mt-1">Everything is running smoothly!</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                visible.map(complaint => (
                                    <tr key={complaint.id} className="hover:bg-secondary-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-secondary-900">#{complaint.id.slice(-4)}</div>
                                            <div className="text-xs text-secondary-500 mt-1">
                                                {format(new Date(complaint.createdAt), 'MMM d, HH:mm')}
                                            </div>
                                        </td>
                                        {(user?.role === 'Warden' || user?.role === 'Admin') && (
                                            <td className="px-6 py-4 text-sm text-secondary-700">
                                                {complaint.reporterName || complaint.reporterUsername}
                                            </td>
                                        )}
                                        {(user?.role === 'Warden' || user?.role === 'Admin') && (
                                            <td className="px-6 py-4 text-sm text-secondary-700">
                                                {complaint.assignedWardenUid || '-'}
                                            </td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary-100 text-secondary-800">
                                                {complaint.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${getPriorityColor(complaint.priority)}`}>
                                                {complaint.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-secondary-600 max-w-xs truncate" title={complaint.description}>
                                            {complaint.description}
                                            {complaint.resolutionComment && (
                                                <div className="mt-1 text-xs text-secondary-400">
                                                    <span className="font-semibold">Note:</span> {complaint.resolutionComment}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user?.role === 'Warden' || user?.role === 'Admin' ? (
                                                <div className="space-y-1">
                                                    <select
                                                        value={complaint.status}
                                                        onChange={(e) => updateComplaint(complaint.id, { status: e.target.value })}
                                                        className="rounded-md border border-secondary-300 px-2 py-1 text-sm"
                                                    >
                                                        <option>Pending</option>
                                                        <option>In Progress</option>
                                                        <option>Resolved</option>
                                                        <option>Escalated</option>
                                                    </select>
                                                    {complaint.status === 'Resolved' || complaint.status === 'Escalated' ? null : (
                                                        <button
                                                            onClick={() => {
                                                                const comment = prompt('Add a note or resolution comment');
                                                                if (comment !== null) {
                                                                    updateComplaint(complaint.id, { resolutionComment: comment });
                                                                }
                                                            }}
                                                            className="text-xs text-primary-600 hover:underline"
                                                        >
                                                            Add note
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                                                    {complaint.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplaintsList;
