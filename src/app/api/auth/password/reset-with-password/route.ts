import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/config/firebase-admin';
import { isOTPVerified, consumeVerifiedOTP } from '../reset/route';

/**
 * POST /api/auth/password/reset-with-password
 * Direct password change after OTP verification using Firebase Admin SDK
 * NO current password or email links required!
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

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

    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication service not initialized. Please contact support.' },
        { status: 500 }
      );
    }

    try {
      // Get user by email
      const userRecord = await adminAuth.getUserByEmail(normalizedEmail);
      
      // Update password directly using Admin SDK (no current password needed!)
      await adminAuth.updateUser(userRecord.uid, {
        password: newPassword,
      });

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully! You can now login with your new password.'
      });
    } catch (firebaseError: any) {
      console.error('Firebase Admin password reset error:', firebaseError);

      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 404 }
        );
      }

      if (firebaseError.code === 'auth/invalid-password') {
        return NextResponse.json(
          { error: 'Password is too weak. Please choose a stronger password.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
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
