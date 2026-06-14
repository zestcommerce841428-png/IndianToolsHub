import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { withRateLimit, resetRateLimit } from '@/utils/rateLimiter';
import { getSecurityContext } from '@/utils/securityContext';
import { generateOTPEmail } from '@/utils/emailTemplates';
import nodemailer from 'nodemailer';
import { collection, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
  },
});

/**
 * POST /api/auth/password/reset
 * Send OTP for password reset verification
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Normalize email - trim whitespace and lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check rate limit and cooldown
    const rateLimitCheck = withRateLimit(`password-reset:${normalizedEmail}`, 'PASSWORD_RESET');
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: rateLimitCheck.status || 429 }
      );
    }

    // Check database availability
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP in Firestore for cross-instance persistence
    const otpCollection = collection(db, 'passwordResetOTPs');
    const otpDocRef = doc(otpCollection, normalizedEmail.replace(/[@.]/g, '_'));
    
    await setDoc(otpDocRef, {
      otp,
      expiresAt,
      purpose: 'password-reset',
      createdAt: Date.now(),
      email: normalizedEmail
    });

    // Get security context
    const securityContext = await getSecurityContext(req);

    // Generate email content
    const { html, text } = generateOTPEmail({
      otp,
      email: normalizedEmail,
      subject: 'Password Reset Request',
      context: securityContext,
    });

    // Send email
    await transporter.sendMail({
      from: `"IndianToolsHub Security" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: '🔐 Password Reset Request - IndianToolsHub',
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset OTP sent to your email',
      expiresIn: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending password reset OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send password reset OTP. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/password/reset
 * Verify OTP and reset password
 */
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Normalize inputs - trim whitespace and ensure string comparison
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();

    // Check rate limit for verification attempts
    const rateLimitCheck = withRateLimit(`password-verify:${normalizedEmail}`, 'PASSWORD_RESET');
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: rateLimitCheck.status || 429 }
      );
    }

    // Check database availability
    if (!db) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Verify OTP from Firestore
    const otpCollection = collection(db, 'passwordResetOTPs');
    const otpDocRef = doc(otpCollection, normalizedEmail.replace(/[@.]/g, '_'));
    const otpDoc = await getDoc(otpDocRef);

    if (!otpDoc.exists()) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      );
    }

    const storedOTP = otpDoc.data();
    
    if (storedOTP.purpose !== 'password-reset') {
      return NextResponse.json(
        { error: 'Invalid OTP purpose' },
        { status: 400 }
      );
    }

    if (Date.now() > storedOTP.expiresAt) {
      await deleteDoc(otpDocRef); // Clean up expired OTP
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const storedOtp = String(storedOTP.otp).trim();
    if (storedOtp !== normalizedOtp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully
    // Store verified OTP in Firestore for cross-instance persistence
    const verifiedKey = `${normalizedEmail}:${normalizedOtp}`;
    const verifiedOtpsRef = collection(db, 'verifiedOTPs');
    const verifiedOtpDocRef = doc(verifiedOtpsRef, verifiedKey.replace(/[:.@]/g, '_'));
    
    await setDoc(verifiedOtpDocRef, {
      email: normalizedEmail,
      otp: normalizedOtp,
      verified: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    // Clear the original OTP from Firestore
    await deleteDoc(otpDocRef);
    
    // Reset rate limits for this email
    resetRateLimit(`password-reset:${normalizedEmail}`);
    resetRateLimit(`password-verify:${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully. You can now set a new password.',
    });
  } catch (error: unknown) {
    console.error('Error resetting password:', error);
    
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      
      if (firebaseError.code === 'auth/user-not-found') {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 404 }
        );
      }
      
      if (firebaseError.code === 'auth/invalid-email') {
        return NextResponse.json(
          { error: 'Invalid email address format.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper to check if OTP is verified (exported for use by reset-with-password)
export async function isOTPVerified(email: string, otp: string): Promise<boolean> {
  try {
    if (!db) {
      console.error('Database not initialized in isOTPVerified');
      return false;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();
    const key = `${normalizedEmail}:${normalizedOtp}`;
    const sanitizedKey = key.replace(/[:.@]/g, '_');
    
    const verifiedOtpsRef = collection(db, 'verifiedOTPs');
    const verifiedOtpDocRef = doc(verifiedOtpsRef, sanitizedKey);
    const verifiedOtpDoc = await getDoc(verifiedOtpDocRef);
    
    if (!verifiedOtpDoc.exists()) {
      return false;
    }
    
    const data = verifiedOtpDoc.data();
    
    // Check if OTP is expired
    if (Date.now() > data.expiresAt) {
      // Clean up expired OTP
      await deleteDoc(verifiedOtpDocRef);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking OTP verification:', error);
    return false;
  }
}

// Helper to consume verified OTP (remove after use)
export async function consumeVerifiedOTP(email: string, otp: string): Promise<boolean> {
  try {
    if (!db) {
      console.error('Database not initialized in consumeVerifiedOTP');
      return false;
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();
    const key = `${normalizedEmail}:${normalizedOtp}`;
    const sanitizedKey = key.replace(/[:.@]/g, '_');
    
    const verifiedOtpsRef = collection(db, 'verifiedOTPs');
    const verifiedOtpDocRef = doc(verifiedOtpsRef, sanitizedKey);
    const verifiedOtpDoc = await getDoc(verifiedOtpDocRef);
    
    if (verifiedOtpDoc.exists()) {
      await deleteDoc(verifiedOtpDocRef);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error consuming verified OTP:', error);
    return false;
  }
}

/* LEGACY CODE - Keeping for reference but not used anymore
    
    // Get security context for notification
    const securityContext = await getSecurityContext(req);

    // Send confirmation email
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="background: linear-gradient(135deg, #FF9933 0%, #138808 100%); padding: 30px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 Password Reset Verified</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Your identity has been verified successfully.
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      We've sent you a secure password reset link via Firebase. Please check your email and click the link to complete your password reset.
                    </p>
                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
                      <strong>Note:</strong> The password reset link will expire in 1 hour for security reasons.
                    </p>
                    <div style="background-color: #f8f9fa; border-left: 4px solid #FF9933; padding: 15px; margin: 20px 0;">
                      <p style="margin: 0 0 8px; color: #666; font-size: 13px;"><strong>Security Details:</strong></p>
                      <p style="margin: 0; color: #666; font-size: 12px;">IP: ${securityContext.ip}</p>
                      <p style="margin: 0; color: #666; font-size: 12px;">Browser: ${securityContext.browser}</p>
                      <p style="margin: 0; color: #666; font-size: 12px;">Location: ${securityContext.location}</p>
                      <p style="margin: 0; color: #666; font-size: 12px;">Time: ${securityContext.timestamp}</p>
                    </div>
                    <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 20px 0 0;">
                      If you didn't request this password reset, please ignore this email and contact our support team immediately.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #dee2e6;">
                    <p style="margin: 0; color: #666; font-size: 12px;">© 2026 IndianToolsHub. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: \`"IndianToolsHub Security" <\${process.env.SMTP_USER || process.env.EMAIL_USER}>\`,
      to: normalizedEmail,
      subject: '✅ Password Reset Verified - Check Your Email',
      html: confirmationHtml,
    });

*/
