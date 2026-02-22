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
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";

import firebaseApp, { db } from "../firebase"; // ✅ reuse app and db

const auth = getAuth(firebaseApp);
const AuthContext = createContext();

/* ================= FIRESTORE PROFILES ================= */

const saveUserProfile = async (uid, profile) => {
  try {
    await setDoc(doc(db, "users", uid), profile, { merge: true });
  } catch (err) {
    console.error("Error saving user profile to Firestore:", err);
  }
};

const getUserProfile = async (uid) => {
  try {
    const docSnap = await getDoc(doc(db, "users", uid));
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (err) {
    console.error("Error getting user profile from Firestore:", err);
  }
  return null;
};

export const findProfileByEmail = async (email) => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
  } catch (err) {
    console.error("Error finding profile by email:", err);
  }
  return null;
};

export const findProfileByUsername = async (username) => {
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
  } catch (err) {
    console.error("Error finding profile by username:", err);
  }
  return null;
}

/* ================= PROVIDER ================= */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid) || {};

        if (firebaseUser.emailVerified && !profile.emailVerified) {
          await saveUserProfile(firebaseUser.uid, {
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
    const existingEmail = await findProfileByEmail(email);
    if (existingEmail) {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        throw new Error(`Email already registered as ${existingEmail.role}`);
      }
    }

    const existingUser = await findProfileByUsername(username);
    if (existingUser) {
      throw new Error("Username already in use");
    }

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(cred.user);

    await saveUserProfile(cred.user.uid, {
      uid: cred.user.uid,
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
    const profile = await getUserProfile(cred.user.uid) || {};

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
      const profile = await getUserProfile(user.uid) || {};
      await saveUserProfile(user.uid, { ...profile, emailVerified: true });
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