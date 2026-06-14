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
let app: any;
let auth: any = null;
let db: any = null;

// Function to initialize Firebase (can be called multiple times safely)
function initializeFirebase() {
  if (db !== null) return; // Already initialized
  
  // Check if we have the minimum required config
  const hasRequiredConfig = firebaseConfig.apiKey && firebaseConfig.projectId;
  
  if (!hasRequiredConfig) {
    if (typeof window === 'undefined') {
      console.error('Firebase config incomplete on server:', {
        hasApiKey: !!firebaseConfig.apiKey,
        hasProjectId: !!firebaseConfig.projectId,
        envKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE'))
      });
    }
    return;
  }

  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Log successful initialization
    if (typeof window === 'undefined') {
      console.log('✓ Firebase initialized on server:', {
        hasAuth: !!auth,
        hasDb: !!db,
        projectId: firebaseConfig.projectId
      });
    }
  } catch (error: any) {
    console.error('✗ Firebase initialization failed:', {
      error: error.message,
      code: error.code,
      stack: error.stack?.split('\n')[0]
    });
  }
}

// Try to initialize immediately
initializeFirebase();

// Also export a function to retry initialization (useful for lazy init in API routes)
export function ensureFirebaseInitialized() {
  if (!db) {
    initializeFirebase();
  }
  return { app, auth, db };
}

export { app, auth, db };
