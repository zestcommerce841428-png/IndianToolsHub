import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Test Email Endpoint
 * GET /api/test-email
 * Tests SMTP configuration and sends a test email
 */
export async function GET() {
  try {
    // Check environment variables
    const config = {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
    };

    console.log('SMTP Configuration:', {
      ...config,
      pass: config.hasPassword ? '***configured***' : '❌ MISSING',
    });

    if (!config.host || !config.port || !config.user || !config.hasPassword) {
      return NextResponse.json({
        success: false,
        error: 'Missing SMTP configuration',
        config: {
          SMTP_HOST: config.host || '❌ Missing',
          SMTP_PORT: config.port || '❌ Missing',
          SMTP_USER: config.user || '❌ Missing',
          SMTP_PASS: config.hasPassword ? '✅ Configured' : '❌ Missing',
        },
        message: 'Please configure all SMTP environment variables in Vercel',
      });
    }

    const port = parseInt(process.env.SMTP_PORT || '465');
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true, // Enable debug logging
      logger: true, // Log to console
    });

    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    console.log('Sending test email...');
    const testEmail = process.env.SMTP_USER; // Send to self
    
    const info = await transporter.sendMail({
      from: `"IndianToolsHub Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ SMTP Test - IndianToolsHub',
      text: `SMTP Configuration Test
      
This is a test email to verify your SMTP configuration is working correctly.

Configuration:
- Host: ${process.env.SMTP_HOST}
- Port: ${port}
- User: ${process.env.SMTP_USER}
- Secure: ${port === 465 ? 'Yes (SSL)' : 'No (TLS)'}

If you received this email, your SMTP configuration is working!

Timestamp: ${new Date().toISOString()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #10b981; margin: 0 0 20px;">✅ SMTP Test Successful!</h1>
            <p style="color: #333; line-height: 1.6;">
              This is a test email to verify your SMTP configuration is working correctly.
            </p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px; color: #666;">Configuration Details:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #666;">
                <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
                <li><strong>Port:</strong> ${port}</li>
                <li><strong>User:</strong> ${process.env.SMTP_USER}</li>
                <li><strong>Secure:</strong> ${port === 465 ? 'Yes (SSL)' : 'No (TLS)'}</li>
              </ul>
            </div>
            <p style="color: #10b981; font-weight: bold;">
              ✅ If you received this email, your SMTP configuration is working perfectly!
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              Timestamp: ${new Date().toISOString()}<br>
              IndianToolsHub Email System
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      details: {
        messageId: info.messageId,
        response: info.response,
        sentTo: testEmail,
        configuration: {
          host: process.env.SMTP_HOST,
          port: port,
          user: process.env.SMTP_USER,
          secure: port === 465,
        },
      },
    });

  } catch (error: unknown) {
    console.error('❌ Email test failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    return NextResponse.json({
      success: false,
      error: 'Email sending failed',
      message: errorMessage,
      details: {
        error: errorMessage,
        stack: errorStack,
        hint: getErrorHint(errorMessage),
      },
    }, { status: 500 });
  }
}

function getErrorHint(errorMessage: string): string {
  if (errorMessage.includes('EAUTH') || errorMessage.includes('authentication')) {
    return 'Authentication failed. Check your SMTP_USER and SMTP_PASS credentials.';
  }
  if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connect')) {
    return 'Connection refused. Check SMTP_HOST and SMTP_PORT. Verify firewall settings.';
  }
  if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('timeout')) {
    return 'Connection timeout. Check network connectivity and SMTP server availability.';
  }
  if (errorMessage.includes('ENOTFOUND')) {
    return 'SMTP host not found. Verify SMTP_HOST is correct (e.g., smtp.gmail.com).';
  }
  if (errorMessage.includes('535')) {
    return 'Invalid credentials. For Gmail, use an App Password instead of your regular password.';
  }
  return 'Check all SMTP environment variables are correctly configured in Vercel.';
}
