import { createContext, useContext, useState, useEffect } from 'react';
import { dummyComplaints } from '../utils/dummyData';
import { useAuth, findProfileByEmail } from './AuthContext';
import { HOSTELS } from '../utils/constants';

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
    const { user } = useAuth();
    // normalize a hostel string to one of the known keys (or return trimmed value)
    const normalizeHostel = (h) => {
        if (!h) return '';
        const trimmed = h.trim();
        const lower = trimmed.toLowerCase();
        const match = Object.keys(HOSTELS).find(k => k.toLowerCase() === lower);
        return match || trimmed;
    };

    const [complaints, setComplaints] = useState(() => {
        const saved = localStorage.getItem('hostel_complaints');
        if (saved) {
            try {
                const arr = JSON.parse(saved);
                // migrate past data: normalize hostel and backfill from profile if missing
                const migrated = arr.map(c => {
                    const before = c.reporterHostel;
                    let h = normalizeHostel(c.reporterHostel);
                    if (!h || h.toLowerCase() === 'not specified') {
                        // lookup profile by email
                        const prof = findProfileByEmail(c.reporterEmail);
                        if (prof && prof.hostel) {
                            h = normalizeHostel(prof.hostel);
                        }
                    }
                    // try to fill reporterUid if missing
                    if (!c.reporterUid && c.reporterEmail) {
                        const prof = findProfileByEmail(c.reporterEmail);
                        if (prof && prof.uid) {
                            c.reporterUid = prof.uid;
                        }
                    }
                    // no change yet to assignedWardenUid
                    if (h !== before) {
                        console.log('Migrating complaint', c.id, 'hostel', before, '=>', h, 'email', c.reporterEmail);
                    }
                    return { ...c, reporterHostel: h };
                });
                // if anything changed, persist it immediately
                localStorage.setItem('hostel_complaints', JSON.stringify(migrated));
                return migrated;
            } catch (err) {
                console.error('Error parsing complaints during migration', err);
            }
        }
        const initial = dummyComplaints.map(c => ({
            ...c,
            reporterHostel: normalizeHostel(c.reporterHostel)
        }));
        localStorage.setItem('hostel_complaints', JSON.stringify(initial));
        return initial;
    });

    useEffect(() => {
        localStorage.setItem('hostel_complaints', JSON.stringify(complaints));
    }, [complaints]);

    // listen for storage events (other tabs) to keep data in sync
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === 'hostel_complaints') {
                try {
                    const updated = JSON.parse(e.newValue) || [];
                    setComplaints(updated);
                } catch {
                    // ignore parse errors
                }
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // repair any complaints that still lack a hostel after initial load
    useEffect(() => {
        if (!complaints.length) return;
        let changed = false;
        const repaired = complaints.map(c => {
            let hostel = normalizeHostel(c.reporterHostel);
            if (!hostel || hostel.toLowerCase() === 'not specified') {
                // try lookup by email
                if (!c.reporterEmail) {
                    console.warn('Complaint missing email, cannot determine hostel', c);
                }
                const prof = c.reporterEmail ? findProfileByEmail(c.reporterEmail) : null;
                const profHostel = prof?.hostel ? normalizeHostel(prof.hostel) : '';
                const newHostel = profHostel || hostel;
                if (newHostel !== c.reporterHostel) {
                    console.log('Repairing complaint', c.id, 'hostel', c.reporterHostel, '=>', newHostel);
                    changed = true;
                    return { ...c, reporterHostel: newHostel };
                }
            }
            return c;
        });
        if (changed) {
            setComplaints(repaired);
            broadcast(repaired);
            localStorage.setItem('hostel_complaints', JSON.stringify(repaired));
        }
    }, [complaints]);

    // periodic poll as fallback (some browsers don't fire storage events when same origin)
    useEffect(() => {
        const check = () => {
            const saved = localStorage.getItem('hostel_complaints');
            if (saved) {
                try {
                    const arr = JSON.parse(saved);
                    setComplaints(arr);
                } catch {}
            }
        };
        const id = setInterval(check, 5000);
        return () => clearInterval(id);
    }, []);

    // broadcast channel listener for immediate sync
    useEffect(() => {
        if (!window.BroadcastChannel) return;
        const ch = new BroadcastChannel('hostel_complaints');
        const handler = (e) => {
            if (e.data) {
                setComplaints(e.data);
            }
        };
        ch.addEventListener('message', handler);
        return () => {
            ch.removeEventListener('message', handler);
            ch.close();
        };
    }, []);

    const broadcast = (data) => {
        if (window.BroadcastChannel) {
            try {
                const ch = new BroadcastChannel('hostel_complaints');
                ch.postMessage(data);
                ch.close();
            } catch {}
        }
    };

    const addComplaint = (complaint) => {
        if (!user?.hostel) {
            console.error('addComplaint called with user missing hostel', user);
        }
        const newComplaint = {
            ...complaint,
            id: Date.now().toString(),
            status: 'Pending',
            createdAt: new Date().toISOString(),
            resolutionComment: '',
            reporterUid: user?.uid || '',
            reporterName: user?.name || 'Unknown Student',
            reporterHostel: normalizeHostel(user?.hostel || 'Not Specified'),
            reporterUsername: user?.username || user?.email || 'unknown',
            reporterEmail: user?.email || '',
            assignedWardenUid: ''
        };
        console.log('Adding complaint', newComplaint);
        setComplaints(prev => {
            const updated = [newComplaint, ...prev];
            broadcast(updated);
            return updated;
        });
    };

    const updateComplaint = (id, updates) => {
        setComplaints(prev => {
            const updated = prev.map(c => {
                if (c.id !== id) return c;
                let newC = { ...c, ...updates };
                // if a warden is performing the update and the complaint has no assigned warden yet,
                // assign it automatically
                if (user?.role === 'Warden') {
                    if (!newC.assignedWardenUid) {
                        newC.assignedWardenUid = user.uid;
                        console.log('Auto-assigning warden', user.uid, 'to complaint', id);
                    }
                }
                return newC;
            });
            console.log('Updating complaint', id, updates);
            broadcast(updated);
            return updated;
        });
    };

    const clearComplaints = () => {
        setComplaints([]);
        localStorage.removeItem('hostel_complaints');
        broadcast([]);
    };

    return (
        <ComplaintContext.Provider value={{ complaints, addComplaint, updateComplaint, clearComplaints, user }}>
            {children}
        </ComplaintContext.Provider>
    );
};

export const useComplaints = () => useContext(ComplaintContext);
