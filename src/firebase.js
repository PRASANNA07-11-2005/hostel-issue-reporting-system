import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCH4YkuFYUQ4jLIEBHGCODTZW0b04uCi7o",
  authDomain: "hostel-issue-reporting-s-65dce.firebaseapp.com",
  projectId: "hostel-issue-reporting-s-65dce",
  storageBucket: "hostel-issue-reporting-s-65dce.firebasestorage.app",
  messagingSenderId: "79190632358",
  appId: "1:79190632358:web:798f48e8af1ff831a7d167",
  measurementId: "G-KHZXK8VCH8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export db so Context files can use Firestore
export const db = getFirestore(app);

// Export 'app' as default so AuthContext can use it: import firebaseApp from "../firebase"
export default app;