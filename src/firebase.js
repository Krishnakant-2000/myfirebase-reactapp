// src/firebase.js
// This file initializes your Firebase app and services.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // If you plan to use Cloud Storage

// Your Firebase configuration.
// IMPORTANT: This should be your actual Firebase config from the Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyAWWGMXkgvlBRJ-rIGXoeLm35cxO_QuJs8",
  authDomain: "login-signup-a241a.firebaseapp.com",
  projectId: "login-signup-a241a",
  storageBucket: "login-signup-a241a.firebasestorage.app",
  messagingSenderId: "130296734852",
  appId: "1:130296734852:web:ecd3d1740e11c1537e0ed1",
  measurementId: "G-J1Z9211MT3"
};


// Check if config is provided to avoid errors
if (!firebaseConfig.apiKey) {
  console.error("Firebase config is missing or empty in src/firebase.js. Please provide your actual Firebase configuration.");
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export if you use Storage