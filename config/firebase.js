/**
 * @fileoverview
 * Master Configuration File for Firebase. Required for any Firebase functionality to work on the site.
 */

// Import the functions you need from the SDKs you need.
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

// Initialize Firebase Config Object with values from the .env file.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
export const analytics = typeof window !== "undefined" && getAnalytics(app);

// Enforce Experimenal Long Polling for Firestore.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Cloud Functions
export const functions = getFunctions(app);

// Initialize Firebase Authentication
export const auth = getAuth(app);
