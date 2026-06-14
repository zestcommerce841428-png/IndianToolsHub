import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

/**
 * GET /api/test-firebase-admin
 * Test endpoint to verify Firebase Admin SDK configuration
 */
export async function GET() {
  try {
    // Check if environment variables are set
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyConfigured: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length || 0,
    };

    if (!config.projectId || !config.clientEmail || !config.privateKeyConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin environment variables not configured',
        config: {
          ...config,
          privateKey: 'hidden for security',
        },
        instructions: 'Please add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to Vercel environment variables',
      }, { status: 500 });
    }

    // Try to initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      try {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
      } catch (initError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to initialize Firebase Admin',
          details: (initError as Error).message,
          hint: 'Check that FIREBASE_PRIVATE_KEY is formatted correctly with \\n line breaks',
        }, { status: 500 });
      }
    }

    // Test Firebase Admin functionality
    try {
      // Try to list users (limited to 1 for testing)
      const listUsersResult = await admin.auth().listUsers(1);
      
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin SDK is configured correctly!',
        config: {
          projectId: config.projectId,
          clientEmail: config.clientEmail,
          privateKeyLength: config.privateKeyLength,
          privateKey: '***hidden***',
        },
        test: {
          canListUsers: true,
          userCount: listUsersResult.users.length,
          message: 'Successfully connected to Firebase Admin',
        },
        status: 'Magic link auto-login should work now!',
      });
    } catch (authError) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin initialized but cannot access Auth',
        details: (authError as Error).message,
        hint: 'Check Firebase project permissions and make sure Auth is enabled',
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Firebase Admin test error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Unexpected error testing Firebase Admin',
      details: (error as Error).message,
    }, { status: 500 });
  }
}
