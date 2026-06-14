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

    const otpDocRef = doc(db, 'otps', email.toLowerCase());
    const otpDoc = await getDoc(otpDocRef);

    if (!otpDoc.exists()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const data = otpDoc.data();
    if (data.otp !== otp || Date.now() > data.expiresAt) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // OTP verified successfully, clean it up
    await deleteDoc(otpDocRef);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("OTP Verify Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
