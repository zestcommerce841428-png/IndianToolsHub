import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * GET /api/test-magic-link-email
 * Test endpoint to verify magic link email configuration and delivery
 */
export async function GET() {
  try {
    const testEmail = 'test@example.com';
    const testToken = 'test-token-123';
    const magicLink = `https://indian-tools-hub.vercel.app/auth/magic-link/verify?token=${testToken}`;

    // Check environment variables
    const config = {
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: Number(process.env.SMTP_PORT) || 465,
      user: process.env.SMTP_USER,
      passConfigured: !!process.env.SMTP_PASS,
    };

    const port = Number(process.env.SMTP_PORT) || 465;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: port,
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    await transporter.verify();

    // Email HTML (same as actual magic link email)
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
              <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 700;">TEST - Magic Link Login</h1>
            </div>

            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 25px;">
              This is a TEST email. Click the button below to test the magic link functionality.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                🚀 Test Magic Link
              </a>
            </div>

            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; font-weight: 600;">
                Test Link:
              </p>
              <p style="margin: 0; color: #3b82f6; font-size: 13px; word-break: break-all; font-family: monospace;">
                ${magicLink}
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 25px; margin-top: 30px;">
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
                This is a TEST email sent from IndianToolsHub to verify magic link email configuration.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send test email
    const info = await transporter.sendMail({
      from: `"IndianToolsHub TEST" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '🧪 TEST - Magic Link Email Configuration',
      text: `This is a TEST magic link email.\n\nLink: ${magicLink}\n\nIf you received this, magic link emails are working!`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Test magic link email sent successfully!',
      details: {
        config,
        messageId: info.messageId,
        response: info.response,
        testEmail,
        note: 'If email not in inbox, CHECK SPAM FOLDER. Hostinger SMTP emails often go to spam initially.',
      },
    });

  } catch (error: unknown) {
    console.error('Test magic link email error:', error);
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      hint: 'Check SMTP_USER and SMTP_PASS environment variables in Vercel',
      config: {
        host: process.env.SMTP_HOST || 'not set',
        port: process.env.SMTP_PORT || 'not set',
        user: process.env.SMTP_USER || 'not set',
        passConfigured: !!process.env.SMTP_PASS,
      },
    }, { status: 500 });
  }
}
