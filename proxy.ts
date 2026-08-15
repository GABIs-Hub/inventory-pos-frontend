import { auth } from '@/lib/auth/server';

export default auth.middleware({
  loginUrl: '/auth/sign-in',
});

export const config = {
  matcher: [
    '/account/:path*',
    // add every route prefix that requires a logged-in user
  ],
};