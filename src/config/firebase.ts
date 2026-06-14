import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase safely to prevent Next.js SSG build crashes
let app;
let auth: any = null;
let db: any = null;

// Initialize on client (window exists) or server (when env vars are available)
const shouldInitialize = typeof window !== 'undefined' ||
  (process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
   process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

if (shouldInitialize) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Log initialization for debugging server-side issues
    if (typeof window === 'undefined') {
      console.log('Firebase initialized on server:', {
        hasAuth: !!auth,
        hasDb: !!db,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, auth, db };
