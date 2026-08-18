// TODO: DELETE BEFORE DEPLOYMENT
import { auth } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[test-auth] request body:', body);

    const { step, email, password, name, otp } = body;

    switch (step) {
      case 'sign-up':
        return NextResponse.json(
          await auth.signUp.email({
            email,
            password,
            name,
          })
        );

      case 'verify-email':
        return NextResponse.json(
          await auth.emailOtp.verifyEmail({
            email,
            otp,
          })
        );

      case 'sign-in':
        return NextResponse.json(
          await auth.signIn.email({
            email,
            password,
          })
        );

      case 'session':
        return NextResponse.json(
          await auth.getSession()
        );

      default:
        return NextResponse.json(
          { error: `unknown step: ${step}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[test-auth] error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}