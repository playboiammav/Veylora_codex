import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCk9JDdLqNLsF-eC66A3IE-BnJtNZagSRE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "aura-music-568f9.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://aura-music-568f9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "aura-music-568f9",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "aura-music-568f9.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "246707705856",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:246707705856:web:187797f695cbc8750620e5",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-9CFKKR885F",
};

// Initialize Firebase safely for SSR & client environments
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported or blocked by privacy extensions
  });
}

// Optional helper services
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const rtdb: Database = getDatabase(app);
const storage: FirebaseStorage = getStorage(app);

export { app, analytics, auth, firestore, rtdb, storage };
export default app;
