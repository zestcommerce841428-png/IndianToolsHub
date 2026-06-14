import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';

/**
 * Diagnostic endpoint to check Firebase initialization on server
 * Visit: /api/test-firebase-init
 */
export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      isServer: typeof window === 'undefined',
      
      // Check if db exists
      dbInitialized: db !== null && db !== undefined,
      dbType: db === null ? 'null' : db === undefined ? 'undefined' : typeof db,
      
      // Check environment variables (without exposing values)
      envVars: {
        NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      },
      
      // Show which are missing
      missingVars: Object.entries({
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      })
        .filter(([_, value]) => !value)
        .map(([key]) => key),
    };

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Firestore (db) is not initialized',
        diagnostics,
        recommendation: diagnostics.missingVars.length > 0
          ? `Missing environment variables: ${diagnostics.missingVars.join(', ')}. Add them in Vercel dashboard.`
          : 'Environment variables are set but Firebase failed to initialize. Check Vercel function logs for initialization errors.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Firebase Firestore initialized successfully on server!',
      diagnostics,
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Exception during diagnostic check',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
