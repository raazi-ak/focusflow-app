import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { recordHttpRequest } from './app/api/metrics/route'

export function middleware(request: NextRequest) {
  // Skip metrics endpoint to avoid circular references
  if (request.nextUrl.pathname === '/api/metrics') {
    return NextResponse.next()
  }

  // Record start time
  const start = Date.now()

  // Continue to the next middleware or route handler
  const response = NextResponse.next()

  // Record metrics after response is generated
  response.headers.set('x-middleware-cache', 'no-cache')

  // Use setTimeout to ensure this runs after the response is sent
  setTimeout(() => {
    const duration = (Date.now() - start) / 1000 // Convert to seconds
    const method = request.method
    const path = request.nextUrl.pathname
    const status = 200 // We don't have access to the actual status code in middleware

    // Record the HTTP request metrics
    recordHttpRequest(method, path, status, duration)
  }, 0)

  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api/metrics, and _next
    '/((?!_next/static|_next/image|favicon.ico|api/metrics).*)',
  ],
}