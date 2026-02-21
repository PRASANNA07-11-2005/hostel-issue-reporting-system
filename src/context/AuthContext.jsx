import { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  applyActionCode,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import firebaseConfig from '../firebase';

// initialize firebase app/auth once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const AuthContext = createContext();

// simple client-side storage for extra profile data
const PROFILE_KEY = 'hostel_user_profiles';

const saveUserProfile = (uid, profile) => {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    all[uid] = { ...all[uid], ...profile };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
};

const getUserProfile = (uid) => {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    return all[uid] || null;
};

// helpers for lookup
export const findProfileByEmail = (email) => {
    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    return Object.values(all).find(p => p.email === email);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const profile = getUserProfile(firebaseUser.uid) || {};
                // if firebase says it's verified but our profile still false, update it
                if (firebaseUser.emailVerified && !profile.emailVerified) {
                    saveUserProfile(firebaseUser.uid, { ...profile, emailVerified: true });
                }
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    emailVerified: firebaseUser.emailVerified,
                    role: profile.role || 'Student',
                    hostel: profile.hostel || '',
                    name: profile.name || '',
                    username: profile.username || ''
                });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signup = async ({ email, password, role, hostel, name, username }) => {
        // check local profile for the email
        const existing = findProfileByEmail(email);
        if (existing) {
            // verify if the firebase account still exists
            try {
                const methods = await fetchSignInMethodsForEmail(auth, email);
                if (methods.length === 0) {
                    // stale profile, remove it and continue
                    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
                    Object.keys(all).forEach(uid => {
                        if (all[uid].email === email) delete all[uid];
                    });
                    localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
                } else {
                    throw new Error(`Email already registered as ${existing.role}.`);
                }
            } catch (err) {
                // if fetchSignInMethods fails for some reason, still block
                if (err.code) throw err;
            }
        }
        // prevent duplicate username
        {
            const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
            const parent = Object.values(all).find(p => p.username === username);
            if (parent) {
                throw new Error('Username already in use.');
            }
        }

        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                const existing2 = findProfileByEmail(email);
                throw new Error(existing2 ? `Email already registered as ${existing2.role}.` : 'Email already in use.');
            }
            throw err;
        }
        await sendEmailVerification(userCredential.user);
        // persist additional info in local storage, since we don't have a backend
        saveUserProfile(userCredential.user.uid, { role, hostel, name, username, email, emailVerified: false });
        return userCredential.user;
    };

    const login = async ({ email, password }) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = getUserProfile(userCredential.user.uid) || {};
        // only enforce verification for non-admins
        if (profile.role !== 'Admin' && !userCredential.user.emailVerified) {
            throw new Error('Please verify your email before login');
        }
        // onAuthStateChanged will update user state (and sync profile)
    };

    const logout = async () => {
        await signOut(auth);
    };

    const verifyEmail = async (oobCode) => {
        // action code from verify link query parameter
        await applyActionCode(auth, oobCode);
        // if the user is signed in after clicking link, update local profile
        const current = auth.currentUser;
        if (current) {
            const profile = getUserProfile(current.uid) || {};
            saveUserProfile(current.uid, { ...profile, emailVerified: true });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signup, login, logout, verifyEmail }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
