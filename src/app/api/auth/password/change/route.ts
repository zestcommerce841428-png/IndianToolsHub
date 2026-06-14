import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/config/firebase';
import { updatePassword } from 'firebase/auth';
import { withRateLimit } from '@/utils/rateLimiter';
import { getSecurityContext } from '@/utils/securityContext';
import { generateOTPEmail } from '@/utils/emailTemplates';
import nodemailer from 'nodemailer';

// Store OTPs temporarily (use Redis in production)
const otpStore: { [key: string]: { otp: string; expires: number; purpose: string } } = {};

// Email transporter configuration
const port = Number(process.env.SMTP_PORT) || 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD,
  },
});

/**
 * POST /api/auth/password/send-otp
 * Send OTP for password change verification
 */
export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email and userId are required' },
        { status: 400 }
      );
    }

    // Check rate limit and cooldown
    const rateLimitCheck = withRateLimit(`password-change:${email}`, 'PASSWORD_RESET');
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: rateLimitCheck.status || 429 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore[email] = {
      otp,
      expires: expiresAt,
      purpose: 'password-change',
    };

    // Get security context
    const securityContext = await getSecurityContext(req);

    // Generate email content
    const { html, text } = generateOTPEmail({
      otp,
      email,
      subject: 'Password Change Verification',
      context: securityContext,
    });

    // Send email
    await transporter.sendMail({
      from: `"IndianToolsHub Security" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Change Verification - IndianToolsHub',
      text,
      html,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your email',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error sending password change OTP:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/auth/password/change
 * Change password after OTP verification
 */
export async function PUT(req: NextRequest) {
  try {
    const { email, otp, newPassword, userId } = await req.json();

    if (!email || !otp || !newPassword || !userId) {
      return NextResponse.json(
        { error: 'Email, OTP, new password, and userId are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimitCheck = withRateLimit(`password-verify:${email}`, 'PASSWORD_RESET');
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: rateLimitCheck.status || 429 }
      );
    }

    // Verify OTP
    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return NextResponse.json(
        { error: 'OTP expired or not found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (storedOTP.purpose !== 'password-change') {
      return NextResponse.json(
        { error: 'Invalid OTP purpose' },
        { status: 400 }
      );
    }

    if (Date.now() > storedOTP.expires) {
      delete otpStore[email];
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (storedOTP.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // Get current user from Firebase Auth
    const user = auth.currentUser;
    if (!user || user.uid !== userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }

    // Update password in Firebase Auth
    await updatePassword(user, newPassword);

    // Clear OTP
    delete otpStore[email];

    // Get security context for notification email
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
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 Password Changed</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      Your password has been successfully changed.
                    </p>
                    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                      If you did not make this change, please contact our support team immediately.
                    </p>
                    <div style="background-color: #f8f9fa; border-left: 4px solid #FF9933; padding: 15px; margin: 20px 0;">
                      <p style="margin: 0 0 8px; color: #666; font-size: 13px;"><strong>Security Details:</strong></p>
                      <p style="margin: 0; color: #666; font-size: 12px;">IP: ${securityContext.ip}</p>
                      <p style="margin: 0; color: #666; font-size: 12px;">Browser: ${securityContext.browser}</p>
                      <p style="margin: 0; color: #666; font-size: 12px;">Location: ${securityContext.location}</p>
                      <p style="margin: 0; color: #666; font-size: 12px;">Time: ${securityContext.timestamp}</p>
                    </div>
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
      from: `"IndianToolsHub Security" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Password Changed Successfully - IndianToolsHub',
      html: confirmationHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: unknown) {
    console.error('Error changing password:', error);
    
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'auth/requires-recent-login') {
      return NextResponse.json(
        { error: 'For security reasons, please log out and log in again before changing your password.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to change password. Please try again.' },
      { status: 500 }
    );
  }
}
