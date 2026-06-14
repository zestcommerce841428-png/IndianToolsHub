import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { isOTPVerified, consumeVerifiedOTP } from '../reset/route';

/**
 * POST /api/auth/password/reset-with-password
 * Send Firebase password reset link after OTP verification (NO current password needed!)
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
    const isVerified = await isOTPVerified(normalizedEmail, normalizedOtp);
    if (!isVerified) {
      return NextResponse.json(
        { error: 'OTP expired or not verified. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Consume the verified OTP (can only be used once)
    await consumeVerifiedOTP(normalizedEmail, normalizedOtp);

    if (!auth) {
      return NextResponse.json(
        { error: 'Authentication service not initialized' },
        { status: 500 }
      );
    }

    try {
      // Send Firebase password reset email
      await sendPasswordResetEmail(auth, normalizedEmail);

      return NextResponse.json({
        success: true,
        message: 'Password reset link sent to your email. Please check your inbox.'
      });
    } catch (firebaseError: any) {
      console.error('Firebase password reset error:', firebaseError);

      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 404 }
        );
      }

      if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: 'Invalid email address.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to send password reset link. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Error in reset-with-password:', error);

    return NextResponse.json(
      { error: 'Failed to process password reset. Please try again.' },
      { status: 500 }
    );
  }
}
