import { NextResponse } from 'next/server';
import { generateTOTPSecret } from '@/utils/totp';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Generate TOTP secret, QR code, and backup codes
    const { secret, qrCode, backupCodes } = await generateTOTPSecret(email);

    return NextResponse.json({ 
      success: true, 
      secret, 
      qrCode, 
      backupCodes 
    });
  } catch (err: unknown) {
    console.error("2FA Setup Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to setup 2FA';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
