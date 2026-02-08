'use client'

import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SSOCallbackPage() {
    const { handleRedirectCallback } = useClerk()
    const router = useRouter()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                await handleRedirectCallback({
                    afterSignInUrl: '/dashboard',
                    afterSignUpUrl: '/dashboard',
                })
            } catch (err) {
                console.error('SSO callback error:', err)
                // Redirect to signin on error
                router.push('/signin')
            }
        }

        handleCallback()
    }, [handleRedirectCallback, router])

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative"
            style={{ backgroundImage: "url('/landing-i2.png')" }}
        >
            {/* black overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* content */}
            <div className="relative z-20 w-full max-w-xl bg-white rounded-xl p-8 shadow-lg">
                <div className="flex justify-center mb-6">
                    <Image
                        src="/mylogorentora.png"
                        alt="RENTORA"
                        width={140}
                        height={50}
                        className="text-2xl font-bold"
                    />
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1acec8] mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Completing Sign In
                    </h2>
                    <p className="text-gray-500 text-center">
                        Please wait while we complete your authentication...
                    </p>
                </div>
            </div>
        </div>
    )
}
