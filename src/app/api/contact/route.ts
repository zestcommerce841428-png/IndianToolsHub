import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * POST /api/contact
 * Handle contact form submissions with ReCAPTCHA verification
 */
export async function POST(req: Request) {
  try {
    const { name, email, subject, message, recaptchaToken } = await req.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA
    if (!recaptchaToken) {
      return NextResponse.json(
        { error: 'ReCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret) {
      const recaptchaResponse = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${recaptchaToken}`,
        { method: 'POST' }
      );

      const recaptchaData = await recaptchaResponse.json();

      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return NextResponse.json(
          { error: 'ReCAPTCHA verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

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

    // Email to admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #FF9933 0%, #2563eb 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📬 New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px; color: #333;">Contact Details:</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin: 0 0 15px; color: #333;">Message:</h3>
            <p style="margin: 0; color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST<br>
              IndianToolsHub Contact System
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    await transporter.sendMail({
      from: `"IndianToolsHub Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to admin email
      replyTo: email, // Reply to sender
      subject: `📬 Contact Form: ${subject}`,
      html: adminEmailHtml,
      text: `New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
    });

    // Confirmation email to sender
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Message Received!</h1>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hi <strong>${name}</strong>,
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for contacting <strong>IndianToolsHub</strong>! We've received your message and will get back to you as soon as possible.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px; color: #333;">Your Message Details:</h3>
            <p style="margin: 5px 0; color: #666;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Submitted:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
          </div>
          
          <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>📧 Expected Response Time:</strong> We typically respond within 24 hours during business days (Monday-Friday).
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            In the meantime, feel free to explore our <a href="https://indian-tools-hub.vercel.app" style="color: #2563eb; text-decoration: none;">tools</a> and <a href="https://indian-tools-hub.vercel.app/blog" style="color: #2563eb; text-decoration: none;">blog</a>.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; color: #333; font-weight: 600;">Best regards,</p>
            <p style="margin: 0; color: #666;">The IndianToolsHub Team</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} IndianToolsHub. All rights reserved.<br>
              <a href="https://indian-tools-hub.vercel.app" style="color: #2563eb; text-decoration: none;">Visit Website</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send confirmation email to user
    await transporter.sendMail({
      from: `"IndianToolsHub" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '✅ Thank You for Contacting IndianToolsHub',
      html: confirmationEmailHtml,
      text: `Hi ${name},

Thank you for contacting IndianToolsHub! We've received your message and will get back to you as soon as possible.

Your Message Details:
Subject: ${subject}
Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST

Expected Response Time: We typically respond within 24 hours during business days (Monday-Friday).

In the meantime, feel free to explore our tools and blog.

Best regards,
The IndianToolsHub Team

© ${new Date().getFullYear()} IndianToolsHub. All rights reserved.
Visit: https://indian-tools-hub.vercel.app`,
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! Check your email for confirmation.',
    });

  } catch (error: unknown) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to send message. Please try again or email us directly at admin@zestcommerce.in',
      },
      { status: 500 }
    );
  }
}
