import { useEffect } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { differenceInHours } from 'date-fns';

export const useEscalation = () => {
    const { complaints, updateComplaint } = useComplaints();

    useEffect(() => {
        const checkEscalation = () => {
            const now = new Date();
            complaints.forEach(complaint => {
                if (complaint.status !== 'Resolved' && complaint.status !== 'Escalated') {
                    const hours = differenceInHours(now, new Date(complaint.createdAt));
                    if (hours > 48) {
                        updateComplaint(complaint.id, { status: 'Escalated' });
                    }
                }
            });
        };

        // Check on mount
        checkEscalation();

        // Check every minute
        const interval = setInterval(checkEscalation, 60000);

        return () => clearInterval(interval);
    }, [complaints, updateComplaint]);
};
