import { NextResponse } from 'next/server';
import { db } from '@/config/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Normalize inputs - trim whitespace and ensure string comparison
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = String(otp).trim();

    const otpDocRef = doc(db, 'otps', normalizedEmail);
    const otpDoc = await getDoc(otpDocRef);

    if (!otpDoc.exists()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const data = otpDoc.data();
    const storedOtp = String(data.otp).trim();
    
    // Check expiration first
    if (Date.now() > data.expiresAt) {
      await deleteDoc(otpDocRef); // Clean up expired OTP
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }
    
    // Check OTP match
    if (storedOtp !== normalizedOtp) {
      return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });
    }

    // OTP verified successfully, clean it up
    await deleteDoc(otpDocRef);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("OTP Verify Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
