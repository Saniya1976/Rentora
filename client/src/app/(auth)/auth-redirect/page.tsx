'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

/**
 * Central post-login role detector.
 *
 * Strategy: fire BOTH manager + tenant checks in parallel to halve cold-start
 * latency, then pick the winner based on intended role from metadata.
 *
 * All auth paths (email/password sign-in, Google OAuth) land here.
 */
export default function AuthRedirectPage() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    // ── Wake up Render backend immediately on page load ──────────
    useEffect(() => {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL
        if (base) {
            fetch(`${base}/properties?limit=1`).catch(() => { })
        }
    }, [])

    useEffect(() => {
        if (!isLoaded || !user) return

        const detectRoleAndRedirect = async () => {
            try {
                // Retry until we have a fresh session token
                const token = await (window as any).Clerk?.session?.getToken()
                if (!token) {
                    console.warn('[AuthRedirect] No token yet, retrying in 500ms...')
                    setTimeout(detectRoleAndRedirect, 500)
                    return
                }

                const base = process.env.NEXT_PUBLIC_API_BASE_URL
                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }

                // ── Determine intended role from metadata ────────────
                const intendedRole =
                    (user.unsafeMetadata?.role as string)?.toLowerCase() ||
                    (user.publicMetadata?.userType as string)?.toLowerCase() ||
                    'tenant'

                console.log(`[AuthRedirect] Intended role from metadata: ${intendedRole}`)

                // ── Fire BOTH checks in parallel to halve cold-start wait ──
                const [managerRes, tenantRes] = await Promise.allSettled([
                    fetch(`${base}/auth/user?userType=manager`, { headers }),
                    fetch(`${base}/auth/user?userType=tenant`, { headers }),
                ])

                let isManager = false
                let isTenant = false

                if (managerRes.status === 'fulfilled' && managerRes.value.ok) {
                    const data = await managerRes.value.json()
                    isManager = data?.userRole === 'manager'
                }
                if (tenantRes.status === 'fulfilled' && tenantRes.value.ok) {
                    const data = await tenantRes.value.json()
                    isTenant = data?.userRole === 'tenant'
                }

                // ── Route based on intended role + what exists ──
                if (intendedRole === 'manager') {
                    if (isManager) {
                        console.log('[AuthRedirect] ✅ Role confirmed = manager → /manager')
                        router.replace('/manager')
                        return
                    }
                    if (isTenant) {
                        console.log('[AuthRedirect] ✅ Role confirmed (fallback) = tenant → /tenant/favourites')
                        router.replace('/tenant/favourites')
                        return
                    }
                } else {
                    if (isTenant) {
                        console.log('[AuthRedirect] ✅ Role confirmed = tenant → /tenant/favourites')
                        router.replace('/tenant/favourites')
                        return
                    }
                    if (isManager) {
                        console.log('[AuthRedirect] ✅ Role confirmed (fallback) = manager → /manager')
                        router.replace('/manager')
                        return
                    }
                }

                // ── User not in DB at all (new Google OAuth user) ─────
                console.log(`[AuthRedirect] 🆕 New user — creating ${intendedRole} profile...`)

                const profileEndpoint = intendedRole === 'manager' ? 'managers' : 'tenants'
                const createRes = await fetch(`${base}/${profileEndpoint}`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        clerkId: user.id,
                        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.username || 'New User',
                        email: user.emailAddresses?.[0]?.emailAddress ?? '',
                        phoneNumber: '',
                    }),
                })

                if (createRes.ok) {
                    console.log(`[AuthRedirect] ✅ Profile created → ${intendedRole}`)
                    router.replace(intendedRole === 'manager' ? '/manager' : '/tenant/favourites')
                } else {
                    console.error('[AuthRedirect] ❌ Profile creation failed — falling back to metadata role')
                    router.replace(intendedRole === 'manager' ? '/manager' : '/tenant/favourites')
                }

            } catch (err) {
                console.error('[AuthRedirect] Error:', err)
                router.replace('/tenant/favourites')
            }
        }

        detectRoleAndRedirect()
    }, [isLoaded, user, router])

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative p-4"
            style={{ backgroundImage: "url('/auth_bg.png')" }}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div className="relative z-20 w-full flex justify-center">
                <div className="w-full max-w-[480px] backdrop-blur-xl bg-white/90 rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 flex flex-col items-center justify-center py-16 text-center">
                    <div className="relative mb-6">
                        <div className="w-16 h-16 rounded-full border-4 border-[#1acec8]/20 border-t-[#1acec8] animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-[#1acec8]/10" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Almost there!</h2>
                    <p className="text-gray-500 font-medium">Setting up your dashboard...</p>
                </div>
            </div>
        </div>
    )
}

