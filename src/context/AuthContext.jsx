import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  applyActionCode,
  fetchSignInMethodsForEmail,
} from "firebase/auth";

import firebaseApp from "../firebase"; // ✅ reuse app

const auth = getAuth(firebaseApp);
const AuthContext = createContext();

/* ================= STORAGE ================= */
const PROFILE_KEY = "hostel_user_profiles";

const saveUserProfile = (uid, profile) => {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  all[uid] = { ...all[uid], ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(all));
};

const getUserProfile = (uid) => {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  return all[uid] || null;
};

export const findProfileByEmail = (email) => {
  const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  return Object.values(all).find((p) => p.email === email);
};

/* ================= PROVIDER ================= */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = getUserProfile(firebaseUser.uid) || {};

        if (firebaseUser.emailVerified && !profile.emailVerified) {
          saveUserProfile(firebaseUser.uid, {
            ...profile,
            emailVerified: true,
          });
        }

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: profile.role || "Student",
          hostel: profile.hostel || "",
          name: profile.name || "",
          username: profile.username || "",
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const signup = async ({ email, password, role, hostel, name, username }) => {
    const existing = findProfileByEmail(email);
    if (existing) {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        throw new Error(`Email already registered as ${existing.role}`);
      }
    }

    const all = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    if (Object.values(all).some((p) => p.username === username)) {
      throw new Error("Username already in use");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);

    saveUserProfile(cred.user.uid, {
      email,
      role,
      hostel,
      name,
      username,
      emailVerified: false,
    });

    return cred.user;
  };

  const login = async ({ email, password }) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const profile = getUserProfile(cred.user.uid) || {};

    if (profile.role !== "Admin" && !cred.user.emailVerified) {
      await signOut(auth);
      throw new Error("Please verify your email before login");
    }
  };

  const logout = async () => signOut(auth);

  const verifyEmail = async (oobCode) => {
    await applyActionCode(auth, oobCode);
    const user = auth.currentUser;
    if (user) {
      const profile = getUserProfile(user.uid) || {};
      saveUserProfile(user.uid, { ...profile, emailVerified: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, verifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);