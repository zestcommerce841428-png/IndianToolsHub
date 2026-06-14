import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { isOTPVerified, consumeVerifiedOTP } from '../reset/route';

/**
 * POST /api/auth/password/reset-with-password
 * Reset password directly after OTP verification using current password
 */
export async function POST(req: NextRequest) {
  try {
    const { email, otp, oldPassword, newPassword } = await req.json();

    if (!email || !otp || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, current password, and new password are required' },
        { status: 400 }
      );
    }

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
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

    try {
      // Verify old password by attempting to sign in
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, oldPassword);
      const user = userCredential.user;

      // Update password
      await updatePassword(user, newPassword);

      // Sign out after password change for security
      await auth.signOut();

      return NextResponse.json({
        success: true,
        message: 'Password reset successfully! Please log in with your new password.'
      });
    } catch (firebaseError: any) {
      console.error('Firebase password reset error:', firebaseError);

      if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        return NextResponse.json(
          { error: 'Current password is incorrect. Please try again.' },
          { status: 401 }
        );
      }

      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 404 }
        );
      }

      if (firebaseError.code === 'auth/requires-recent-login') {
        return NextResponse.json(
          { error: 'Session expired. Please try the password reset flow again.' },
          { status: 401 }
        );
      }

      if (firebaseError.code === 'auth/weak-password') {
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
