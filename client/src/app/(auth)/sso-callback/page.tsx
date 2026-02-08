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
                    signInFallbackRedirectUrl: '/dashboard',
                    signUpFallbackRedirectUrl: '/dashboard',
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
            className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative p-4"
            style={{ backgroundImage: "url('/auth_bg.png')" }}
        >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

            <div className="relative z-20 w-full flex justify-center">
                <div className="w-full max-w-[480px] backdrop-blur-xl bg-white/90 rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20">
                    <div className="flex justify-center mb-8">
                        <Image
                            src="/mylogorentora.png"
                            alt="RENTORA"
                            width={180}
                            height={60}
                            className="object-contain"
                            priority
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <div className="relative mb-6">
                            <div className="w-16 h-16 rounded-full border-4 border-[#1acec8]/20 border-t-[#1acec8] animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-[#1acec8]/10" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 whitespace-nowrap">
                            Completing Sign In
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Please wait while we complete your authentication...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

