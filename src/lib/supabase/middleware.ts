import { createServerClient } from '@supabase/ssr'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jdbanna34@gmail.com'

// Allow unauthenticated preview access to individual topic pages
const PUBLIC_TOPIC_PATTERN = /^\/app\/subjects\/[^/]+\/topics\/[^/]+$/

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Protect /app routes — except public topic previews and verify-code
  if (
    pathname.startsWith('/app') &&
    !user &&
    !PUBLIC_TOPIC_PATTERN.test(pathname)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect logged-in users away from login page
  if (pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = user.email === ADMIN_EMAIL ? '/admin' : '/app/dashboard'
    return NextResponse.redirect(url)
  }

  // For /app/* routes (authenticated, not admin, not verify-code page):
  // check if user has verified their access code; if not, redirect to verify-code
  if (
    pathname.startsWith('/app') &&
    user &&
    pathname !== '/app/verify-code' &&
    !PUBLIC_TOPIC_PATTERN.test(pathname)
  ) {
    // Admins bypass code check
    if (user.email !== ADMIN_EMAIL) {
      const svcUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (svcUrl && svcKey) {
        const serviceSupabase = createServiceClient(svcUrl, svcKey)
        // Also check admin_allowlist in case admin is using a different email
        const [codeAccessRes, adminRes] = await Promise.all([
          serviceSupabase
            .from('user_code_access')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
          serviceSupabase
            .from('admin_allowlist')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(),
        ])
        if (!codeAccessRes.data && !adminRes.data) {
          const url = request.nextUrl.clone()
          url.pathname = '/app/verify-code'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // Forward pathname to server components via header
  supabaseResponse.headers.set('x-pathname', pathname)

  return supabaseResponse
}
