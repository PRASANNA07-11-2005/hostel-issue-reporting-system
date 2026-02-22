import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy, deleteDoc, getDocs } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { HOSTELS } from '../utils/constants';

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState([]);

    const normalizeHostel = (h) => {
        if (!h) return '';
        const trimmed = h.trim();
        const lower = trimmed.toLowerCase();
        const match = Object.keys(HOSTELS).find(k => k.toLowerCase() === lower);
        return match || trimmed;
    };

    // Real-time listener for complaints from Firestore
    useEffect(() => {
        const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const complaintsData = [];
            snapshot.forEach((doc) => {
                complaintsData.push({ id: doc.id, ...doc.data() });
            });
            setComplaints(complaintsData);
        }, (error) => {
            console.error("Error fetching live complaints form Firestore:", error);
        });

        return () => unsubscribe();
    }, []);

    const addComplaint = async (complaint) => {
        if (!user) {
            console.error('addComplaint called with no user');
            return;
        }

        const newComplaint = {
            ...complaint,
            status: 'Pending',
            createdAt: new Date().toISOString(),
            resolutionComment: '',
            reporterUid: user.uid || '',
            reporterName: user.name || 'Unknown Student',
            reporterHostel: normalizeHostel(user.hostel || 'Not Specified'),
            reporterUsername: user.username || user.email || 'unknown',
            reporterEmail: user.email || '',
            assignedWardenUid: ''
        };

        try {
            await addDoc(collection(db, 'complaints'), newComplaint);
            console.log('Successfully wrote new complaint to Firestore');
        } catch (error) {
            console.error('Error adding complaint to Firestore:', error);
        }
    };

    const updateComplaint = async (id, updates) => {
        try {
            let changes = { ...updates };
            // if a warden is performing the update and the complaint has no assigned warden yet,
            // assign it automatically
            if (user?.role === 'Warden' && !changes.assignedWardenUid) {
                // We need to look up if the complaint currently has an assignedWardenUid
                const existingC = complaints.find(c => c.id === id);
                if (existingC && !existingC.assignedWardenUid) {
                    changes.assignedWardenUid = user.uid;
                }
            }

            const complaintRef = doc(db, 'complaints', id);
            await updateDoc(complaintRef, changes);
            console.log('Successfully updated complaint in Firestore', id, changes);
        } catch (error) {
            console.error('Error updating complaint in Firestore:', error);
        }
    };

    const clearComplaints = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'complaints'));
            snapshot.forEach(async (document) => {
                await deleteDoc(doc(db, 'complaints', document.id));
            });
            console.log('All complaints cleared from Firestore.');
        } catch (error) {
            console.error("Error clearing complaints from Firestore:", error);
        }
    };

    return (
        <ComplaintContext.Provider value={{ complaints, addComplaint, updateComplaint, clearComplaints, user }}>
            {children}
        </ComplaintContext.Provider>
    );
};

export const useComplaints = () => useContext(ComplaintContext);
