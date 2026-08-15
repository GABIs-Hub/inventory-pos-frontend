//TODO: DELETE BEFORE DEPLOYMENT
import { auth } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { step, email, password, name, otp } = await request.json();

  switch (step) {
    case 'sign-up':
      return NextResponse.json(await auth.signUp.email({ email, password, name }));

    case 'verify-email':
      return NextResponse.json(await auth.emailOtp.verifyEmail({ email, otp }));

    case 'sign-in':
      return NextResponse.json(await auth.signIn.email({ email, password }));

    case 'session':
      return NextResponse.json(await auth.getSession());

    default:
      return NextResponse.json({ error: 'unknown step' }, { status: 400 });
  }
}