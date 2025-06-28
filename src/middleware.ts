import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabase } from './lib/supabase';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow requests to login page, public assets, and masses page
  if (
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname === '/' ||
    pathname.startsWith('/mass/')
  ) {
    return NextResponse.next();
  }

  // Get session from Supabase
  const { data: { session } } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)'],
};

