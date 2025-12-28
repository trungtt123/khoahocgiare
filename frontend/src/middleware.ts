import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check if user is authenticated and is admin
    const token = request.cookies.get('token')?.value;
    const userCookie = request.cookies.get('user')?.value;
    
    if (!token || !userCookie) {
      // Not authenticated - redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(userCookie);
      
      if (user.role !== 'admin') {
        // Not admin - redirect to home
        const homeUrl = new URL('/', request.url);
        return NextResponse.redirect(homeUrl);
      }
    } catch (error) {
      // Invalid user cookie - redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
