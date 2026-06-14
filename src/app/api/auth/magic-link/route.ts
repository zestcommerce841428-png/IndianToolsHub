import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (optional - only if credentials provided)
if (!admin.apps.length) {
  try {
    // ⚠️ SECURITY WARNING: Using NEXT_PUBLIC_ prefix exposes variables to client-side!
    // This is INSECURE for private keys. Please use non-prefixed variables in production.
    
    // Check both with and without NEXT_PUBLIC_ prefix (for backwards compatibility)
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY;

    const hasFirebaseCredentials = projectId && clientEmail && privateKey;

    if (hasFirebaseCredentials) {
      // Log security warning if using NEXT_PUBLIC_ variables
      if (process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY) {
        console.warn('⚠️ [SECURITY] Firebase private key exposed via NEXT_PUBLIC_ prefix!');
        console.warn('⚠️ [SECURITY] Please rename to FIREBASE_PRIVATE_KEY (without NEXT_PUBLIC_) in Vercel!');
      }

      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : {
            project_id: projectId,  // snake_case required by Firebase
            client_email: clientEmail,  // snake_case required by Firebase
            private_key: privateKey?.replace(/\\n/g, '\n'),
          };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      
      console.log('[Firebase Admin] Initialized successfully');
    } else {
      console.log('[Firebase Admin] Skipped - credentials not provided. Magic link auto-login disabled.');
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
    console.log('[Firebase Admin] Magic link will work but auto-login disabled. Add Firebase credentials to enable auto-login.');
  }
}

// Temporary storage for magic links (use Redis in production)
const magicLinkStore: { [key: string]: { email: string; expires: number } } = {};

// Cleanup expired links every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(magicLinkStore).forEach(token => {
    if (magicLinkStore[token].expires < now) {
      delete magicLinkStore[token];
    }
  });
}, 5 * 60 * 1000);

/**
 * POST /api/auth/magic-link
 * Generate and send magic login link via email
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store token
    magicLinkStore[token] = {
      email: email.toLowerCase(),
      expires: expiresAt,
    };

    // Create magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://indian-tools-hub.vercel.app';
    const magicLink = `${baseUrl}/auth/magic-link/verify?token=${token}`;

    const port = Number(process.env.SMTP_PORT) || 465;
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; border-radius: 10px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🔐</span>
              </div>
              <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 700;">Magic Link Login</h1>
            </div>

            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
              Click the button below to instantly log in to your <strong>IndianToolsHub</strong> account. No password needed!
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                🚀 Login to IndianToolsHub
              </a>
            </div>

            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; font-weight: 600;">
                Or copy and paste this link:
              </p>
              <p style="margin: 0; color: #3b82f6; font-size: 13px; word-break: break-all; font-family: monospace;">
                ${magicLink}
              </p>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 25px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⏰ This link expires in 15 minutes</strong> for security reasons.
              </p>
            </div>

            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; margin: 25px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>⚠️ Security Notice:</strong> If you didn't request this login link, please ignore this email. Someone may have entered your email address by mistake.
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                For security reasons, this magic link can only be used once and will expire in 15 minutes.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0 0 5px;">
                © ${new Date().getFullYear()} IndianToolsHub. All rights reserved.
              </p>
              <p style="margin: 0;">
                <a href="https://indian-tools-hub.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 12px;">Visit Website</a>
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: `"IndianToolsHub" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🔐 Your Magic Login Link - IndianToolsHub',
      text: `Magic Link Login

Click this link to instantly log in to your IndianToolsHub account:
${magicLink}

This link expires in 15 minutes for security reasons.

If you didn't request this login link, please ignore this email.

© ${new Date().getFullYear()} IndianToolsHub
https://indian-tools-hub.vercel.app`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email! Check your inbox.',
      expiresIn: 900, // 15 minutes in seconds
    });

  } catch (error: unknown) {
    console.error('Magic link error:', error);
    
    return NextResponse.json(
      { error: 'Failed to send magic link. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/magic-link?token=xxx
 * Verify magic link token
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token
    const linkData = magicLinkStore[token];
    
    if (!linkData) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 400 }
      );
    }

    if (Date.now() > linkData.expires) {
      delete magicLinkStore[token];
      return NextResponse.json(
        { error: 'Magic link has expired' },
        { status: 400 }
      );
    }

    // Token is valid
    const email = linkData.email;
    
    // Delete token (single use)
    delete magicLinkStore[token];

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      console.log('[Magic Link] Firebase Admin not initialized. Returning success without custom token.');
      return NextResponse.json({
        success: true,
        email,
        message: 'Magic link verified successfully. Please log in with your email.',
        fallback: true,
      });
    }

    try {
      // Get or create user in Firebase
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().getUserByEmail(email);
      } catch (error) {
        // User doesn't exist, create them
        firebaseUser = await admin.auth().createUser({
          email: email,
          emailVerified: true, // Magic link implies email is verified
        });
      }

      // Create custom token for Firebase authentication
      const customToken = await admin.auth().createCustomToken(firebaseUser.uid);

      return NextResponse.json({
        success: true,
        email,
        customToken,
        uid: firebaseUser.uid,
        message: 'Magic link verified successfully',
      });
    } catch (firebaseError) {
      console.error('[Magic Link] Firebase error during verification:', firebaseError);
      
      // Fallback: return success without custom token (will redirect to login)
      return NextResponse.json({
        success: true,
        email,
        message: 'Magic link verified successfully. Please log in with your email.',
        fallback: true,
      });
    }

  } catch (error: unknown) {
    console.error('Magic link verification error:', error);
    
    return NextResponse.json(
      { error: 'Failed to verify magic link' },
      { status: 500 }
    );
  }
}
