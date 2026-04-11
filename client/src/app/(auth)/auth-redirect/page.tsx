'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

/**
 * This page is the `redirectUrlComplete` destination after a successful OAuth sign-in.
 * Clerk sends the user here AFTER the OAuth flow is fully processed (i.e., after
 * /sso-callback has run handleRedirectCallback). At this point the user is already
 * signed in by Clerk, so we can grab the session token and hit our backend to
 * determine the correct role, then redirect to the right dashboard.
 */
export default function AuthRedirectPage() {
    const { user, isLoaded } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!isLoaded || !user) return

        const detectRoleAndRedirect = async () => {
            try {
                const token = await (window as any).Clerk?.session?.getToken()

                if (!token) {
                    console.warn('[AuthRedirect] No token, falling back to metadata')
                    const role = (user.publicMetadata?.userType as string) ||
                        (user.unsafeMetadata?.role as string)
                    router.replace(role === 'manager' ? '/manager' : '/tenant')
                    return
                }

                const base = process.env.NEXT_PUBLIC_API_BASE_URL

                // Check manager table first
                const managerRes = await fetch(`${base}/auth/user?userType=manager`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (managerRes.ok) {
                    const data = await managerRes.json()
                    if (data?.userRole === 'manager') {
                        console.log('[AuthRedirect] Role = manager → /manager')
                        router.replace('/manager')
                        return
                    }
                }

                // Fallback: check tenant table
                const tenantRes = await fetch(`${base}/auth/user?userType=tenant`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (tenantRes.ok) {
                    const data = await tenantRes.json()
                    if (data?.userRole === 'tenant') {
                        console.log('[AuthRedirect] Role = tenant → /tenant')
                        router.replace('/tenant')
                        return
                    }
                }

                // Final fallback
                const role = (user.publicMetadata?.userType as string) ||
                    (user.unsafeMetadata?.role as string)
                console.warn('[AuthRedirect] Backend lookup failed, metadata role:', role)
                router.replace(role === 'manager' ? '/manager' : '/tenant')
            } catch (err) {
                console.error('[AuthRedirect] Error:', err)
                router.replace('/tenant')
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
                    <p className="text-gray-500 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        </div>
    )
}
