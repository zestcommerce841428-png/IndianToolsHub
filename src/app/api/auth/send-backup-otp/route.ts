import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { generateOTPEmail } from '@/utils/emailTemplates';
import { getSecurityContext } from '@/utils/securityContext';
import { withRateLimit } from '@/utils/rateLimiter';

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Check rate limit and cooldown
    const rateLimitCheck = withRateLimit(`backup-otp:${email}`, 'OTP');
    if (!rateLimitCheck.success) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: rateLimitCheck.status || 429 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    // Get security context
    const securityContext = await getSecurityContext(req);

    // Store OTP with type identifier
    if (db) {
      await setDoc(doc(db, 'otps', email.toLowerCase()), {
        otp,
        expiresAt,
        type: type || 'verification', // 'verification', 'backup-email', etc.
        context: securityContext,
      });
    } else {
      console.warn("Firestore not initialized, cannot save OTP.");
    }

    const port = Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Customize subject based on type
    let mailSubject = 'Your Authorization OTP - IndianToolsHub';
    if (type === 'backup-email') {
      mailSubject = 'Verify Your Backup Email - IndianToolsHub';
    }

    const { html, text } = generateOTPEmail({
      otp,
      email,
      subject: mailSubject,
      context: {
        ip: securityContext.ip,
        browser: securityContext.browser,
        location: securityContext.location,
        timestamp: new Date(securityContext.timestamp).toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short'
        }),
      }
    });

    await transporter.sendMail({
      from: `IndianToolsHub <${process.env.SMTP_USER}>`,
      to: email,
      subject: mailSubject,
      text,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("OTP Send Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
