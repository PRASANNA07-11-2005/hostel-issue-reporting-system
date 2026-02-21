// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCH4YkuFYUQ4jLIEBHGCODTZW0b04uCi7o",
  authDomain: "hostel-issue-reporting-s-65dce.firebaseapp.com",
  projectId: "hostel-issue-reporting-s-65dce",
  storageBucket: "hostel-issue-reporting-s-65dce.firebasestorage.app",
  messagingSenderId: "79190632358",
  appId: "1:79190632358:web:798f48e8af1ff831a7d167",
  measurementId: "G-KHZXK8VCH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default firebaseConfig;