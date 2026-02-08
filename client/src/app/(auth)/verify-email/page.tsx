'use client'

import { useSignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
    const { signUp, isLoaded, setActive } = useSignUp()
    const router = useRouter()

    const [code, setCode] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [isVerifying, setIsVerifying] = useState<boolean>(false)
    const [isResending, setIsResending] = useState<boolean>(false)
    const [countdown, setCountdown] = useState<number>(0)

    // Handle countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    if (!isLoaded || !signUp) {
        return (
            <div
                className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative"
                style={{ backgroundImage: "url('/landing-i2.png')" }}
            >
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-20 w-full max-w-xl bg-white rounded-xl p-8 shadow-lg">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1acec8]" />
                    </div>
                </div>
            </div>
        )
    }

    const handleVerify = async (): Promise<void> => {
        if (!code.trim()) {
            setError('Please enter the verification code')
            return
        }

        setIsVerifying(true)
        setError('')

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (result.status === 'complete') {
                // Set the session as active
                await setActive({ session: result.createdSessionId })
                // Redirect to dashboard
                router.push('/dashboard')
            } else {
                // Handle other statuses
                setError('Verification incomplete. Please try again.')
                console.log('Verification result:', result)
            }
        } catch (err: unknown) {
            if (typeof err === 'object' && err && 'errors' in err) {
                const clerkErr = err as { errors?: { message: string; longMessage?: string }[] }
                setError(clerkErr.errors?.[0]?.longMessage || clerkErr.errors?.[0]?.message || 'Verification failed')
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setIsVerifying(false)
        }
    }

    const handleResendCode = async (): Promise<void> => {
        setIsResending(true)
        setError('')

        try {
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            })
            setCountdown(60) // 60 second cooldown
        } catch (err: unknown) {
            if (typeof err === 'object' && err && 'errors' in err) {
                const clerkErr = err as { errors?: { message: string }[] }
                setError(clerkErr.errors?.[0]?.message || 'Failed to resend code')
            }
        } finally {
            setIsResending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'Enter' && !isVerifying) {
            handleVerify()
        }
    }

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center bg-center bg-cover relative"
            style={{ backgroundImage: "url('/landing-i2.png')" }}
        >
            {/* black overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* content */}
            <div className="relative z-20 w-full max-w-xl bg-white rounded-xl p-8 shadow-lg">
                <div className="flex justify-center mb-4">
                    <Image
                        src="/mylogorentora.png"
                        alt="RENTORA"
                        width={140}
                        height={50}
                        className="text-2xl font-bold"
                    />
                </div>

                <h1 className="text-2xl font-bold text-center mb-2">Verify Your Email</h1>
                <p className="text-center text-gray-500 text-base mb-6">
                    We&apos;ve sent a verification code to your email.
                    <br />
                    Please enter it below to continue.
                </p>

                {/* OTP Input */}
                <div className="mb-6">
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        className="w-full px-4 py-4 text-2xl text-center tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1acec8] focus:border-[#1acec8]"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                )}

                {/* Verify Button */}
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || !code.trim()}
                    className="w-full py-3 text-base rounded-lg bg-[#1acec8] text-white font-semibold mb-4 hover:bg-[#15b8b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isVerifying ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Verifying...
                        </>
                    ) : (
                        'Verify Email'
                    )}
                </button>

                {/* Resend Code */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                        Didn&apos;t receive the code?
                    </p>
                    <button
                        onClick={handleResendCode}
                        disabled={isResending || countdown > 0}
                        className="text-[#1acec8] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                    >
                        {isResending ? (
                            'Sending...'
                        ) : countdown > 0 ? (
                            `Resend in ${countdown}s`
                        ) : (
                            'Resend Code'
                        )}
                    </button>
                </div>

                {/* Back to Sign Up */}
                <div className="mt-6 text-center">
                    <a href="/signup" className="text-sm text-gray-500 hover:text-gray-700">
                        ← Back to Sign Up
                    </a>
                </div>
            </div>
        </div>
    )
}
