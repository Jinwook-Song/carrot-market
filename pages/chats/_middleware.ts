// eslint-disable-next-line @next/next/no-server-import-in-page
import type { NextFetchEvent, NextRequest } from 'next/server';

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  console.log('chat only middleware');
}
