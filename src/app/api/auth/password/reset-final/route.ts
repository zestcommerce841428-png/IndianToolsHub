import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { isOTPVerified, consumeVerifiedOTP } from '../reset/route';

/**
 * POST /api/auth/password/reset-final
 * Send Firebase password reset link after OTP verification
 *
 * Note: Direct password update requires Firebase Admin SDK
 * This endpoint sends a Firebase reset link as a workaround
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();

    // Check if OTP was recently verified (within last 10 minutes)
    if (!isOTPVerified(normalizedEmail, normalizedOtp)) {
      return NextResponse.json(
        { error: 'OTP expired or not verified. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Consume the verified OTP (can only be used once)
    consumeVerifiedOTP(normalizedEmail, normalizedOtp);

    // Send Firebase password reset email
    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
      
      return NextResponse.json({
        success: true,
        message: 'Password reset link sent! Check your email to complete the password reset.'
      });
    } catch (firebaseError: any) {
      console.error('Firebase reset error:', firebaseError);
      
      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to send password reset link. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error in reset-final:', error);
    
    return NextResponse.json(
      { error: 'Failed to process password reset. Please try again.' },
      { status: 500 }
    );
  }
}
