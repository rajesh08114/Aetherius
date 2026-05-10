import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const corsMethods = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const corsHeaders = 'Content-Type, Authorization, X-Requested-With, Accept, Origin';

function getAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const allowedOrigins = new Set([
    request.nextUrl.origin,
    appUrl,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ]);

  return origin && allowedOrigins.has(origin) ? origin : appUrl;
}

function addCorsHeaders(response: NextResponse, request: NextRequest) {
  response.headers.set('Access-Control-Allow-Origin', getAllowedOrigin(request));
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', corsMethods);
  response.headers.set('Access-Control-Allow-Headers', corsHeaders);
  response.headers.set('Vary', 'Origin');
  return response;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return addCorsHeaders(new NextResponse(null, { status: 204 }), request);
    }

    return addCorsHeaders(NextResponse.next(), request);
  }
  
  const isProtectedPath = 
    path.startsWith('/trips') || 
    path.startsWith('/explore') || 
    path.startsWith('/profile') || 
    path.startsWith('/admin') || 
    path.startsWith('/insights');
    
  const isAuthPath = path === '/login' || path === '/signup';
  
  const hasToken = request.cookies.has('refreshToken');

  if (isProtectedPath && !hasToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && hasToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Note: Admin role check should ideally happen here or in the layout
  // Since we only have refreshToken existence check here for speed,
  // we do the deep role check in the API or via a fast edge session lookup.
  
  const response = NextResponse.next();

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
