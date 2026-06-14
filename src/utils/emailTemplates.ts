// Professional Email Templates for IndianToolsHub

interface EmailContext {
  ip?: string;
  browser?: string;
  location?: string;
  timestamp?: string;
}

interface OTPEmailData {
  otp: string;
  email: string;
  subject: string;
  context?: EmailContext;
}

export function generateOTPEmail(data: OTPEmailData): { html: string; text: string } {
  const { otp, email, subject, context } = data;
  const currentYear = new Date().getFullYear();
  const formattedTime = context?.timestamp || new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <!-- Main Container -->
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);" cellpadding="0" cellspacing="0">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF9933 0%, #138808 50%, #000080 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <table role="presentation" style="width: 100%;" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="background-color: white; padding: 15px; border-radius: 8px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <h1 style="margin: 0; color: #FF9933; font-size: 28px; font-weight: bold;">🇮🇳 IndianToolsHub</h1>
                      <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Your Trusted Online Tools Platform</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px; font-weight: 600;">Security Verification Required</h2>
              
              <p style="margin: 0 0 25px 0; color: #555; font-size: 16px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="margin: 0 0 30px 0; color: #555; font-size: 16px; line-height: 1.6;">
                We received a request to verify your identity. Please use the One-Time Password (OTP) below to complete your verification:
              </p>

              <!-- OTP Box -->
              <table role="presentation" style="width: 100%; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #0284c7; border-radius: 8px; padding: 25px; margin: 0 0 30px 0;" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; color: #0369a1; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                    <h1 style="margin: 0; font-size: 42px; letter-spacing: 8px; color: #0c4a6e; font-weight: bold; font-family: 'Courier New', monospace;">${otp}</h1>
                  </td>
                </tr>
              </table>

              <table role="presentation" style="width: 100%; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px; margin: 0 0 30px 0;" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                      <strong>⏱️ Important:</strong> This code will expire in <strong>10 minutes</strong> for your security.
                    </p>
                  </td>
                </tr>
              </table>

              ${context ? `
              <!-- Security Context -->
              <table role="presentation" style="width: 100%; background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px 0; color: #475569; font-size: 16px; font-weight: 600;">🔒 Security Information</h3>
                    <table role="presentation" style="width: 100%;" cellpadding="0" cellspacing="0">
                      ${context.timestamp ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; width: 120px;">
                          <strong>Time:</strong>
                        </td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;">
                          ${formattedTime}
                        </td>
                      </tr>
                      ` : ''}
                      ${context.ip ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">
                          <strong>IP Address:</strong>
                        </td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;">
                          ${context.ip}
                        </td>
                      </tr>
                      ` : ''}
                      ${context.browser ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">
                          <strong>Browser:</strong>
                        </td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;">
                          ${context.browser}
                        </td>
                      </tr>
                      ` : ''}
                      ${context.location ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px;">
                          <strong>Location:</strong>
                        </td>
                        <td style="padding: 6px 0; color: #334155; font-size: 14px;">
                          ${context.location}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                    <p style="margin: 15px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                      If you don't recognize this activity, please secure your account immediately.
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Warning -->
              <table role="presentation" style="width: 100%; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 15px; margin: 0 0 20px 0;" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Security Reminder:</strong> Never share this code with anyone. IndianToolsHub will never ask for your OTP via phone or email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.6;">
                If you didn't request this verification, please ignore this email and ensure your account is secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 14px;">
                <strong>IndianToolsHub</strong> - Empowering India with Digital Tools
              </p>
              <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 12px;">
                This is an automated message, please do not reply to this email.
              </p>
              <div style="margin: 15px 0;">
                <a href="https://indian-tools-hub.vercel.app" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Visit Website</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="https://indian-tools-hub.vercel.app/privacy-policy" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Privacy Policy</a>
                <span style="color: #cbd5e1;">|</span>
                <a href="https://indian-tools-hub.vercel.app/term-conditions" style="color: #3b82f6; text-decoration: none; font-size: 13px; margin: 0 10px;">Terms</a>
              </div>
              <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 11px;">
                © ${currentYear} IndianToolsHub. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
IndianToolsHub - Security Verification

Your One-Time Password (OTP) is: ${otp}

This code will expire in 10 minutes.

${context ? `
Security Information:
${context.timestamp ? `Time: ${formattedTime}` : ''}
${context.ip ? `IP Address: ${context.ip}` : ''}
${context.browser ? `Browser: ${context.browser}` : ''}
${context.location ? `Location: ${context.location}` : ''}
` : ''}

If you didn't request this verification, please ignore this email and ensure your account is secure.

Never share this code with anyone. IndianToolsHub will never ask for your OTP via phone or email.

---
IndianToolsHub - Empowering India with Digital Tools
© ${currentYear} IndianToolsHub. All rights reserved.

Visit: https://indian-tools-hub.vercel.app
  `.trim();

  return { html, text };
}
