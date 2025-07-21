// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFBTqM2oebxKhxX8jJSg8MKI9c1lNcBLY",
  authDomain: "amiquiz.firebaseapp.com",
  projectId: "amiquiz",
  storageBucket: "amiquiz.firebasestorage.app",
  messagingSenderId: "480899019191",
  appId: "1:480899019191:web:8f24a8e14dfad172d87832",
  measurementId: "G-ML6WWQ4GV8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage }; 