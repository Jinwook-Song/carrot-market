import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.ua?.isBot) {
    return new Response("Plz don't be a bot. Be humon.", { status: 403 });
  }
  if (!req.url.includes('/api')) {
    if (!req.url.includes('/enter') && !req.cookies.carrot_cookie) {
      return NextResponse.redirect('/enter');
    }
  }
}
