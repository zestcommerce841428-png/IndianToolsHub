import { NextResponse } from 'next/server';
import { verifyTOTP, isBackupCodeUsed } from '@/utils/totp';

export async function POST(req: Request) {
  try {
    const { token, secret, backupCodes, usedBackupCodes } = await req.json();
    
    if (!token || !secret) {
      return NextResponse.json({ error: 'Token and secret required' }, { status: 400 });
    }

    // First try TOTP verification
    const isTOTPValid = await verifyTOTP(token, secret);
    
    if (isTOTPValid) {
      return NextResponse.json({ success: true, method: 'totp' });
    }

    // If TOTP fails, try backup code
    if (backupCodes && Array.isArray(backupCodes)) {
      const normalizedToken = token.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const usedCodes = usedBackupCodes || [];
      
      if (backupCodes.includes(normalizedToken) && !isBackupCodeUsed(normalizedToken, usedCodes)) {
        return NextResponse.json({ 
          success: true, 
          method: 'backup', 
          usedCode: normalizedToken 
        });
      }
    }

    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  } catch (err: unknown) {
    console.error("2FA Verify Error:", err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to verify 2FA';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
