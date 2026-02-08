'use client'

import { useSignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react'

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
            <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#1acec8] border-t-transparent" />
            </div>
        )
    }

    const handleVerify = async (): Promise<void> => {
        if (code.length !== 6) {
            setError('Please enter the 6-digit verification code')
            return
        }

        setIsVerifying(true)
        setError('')

        try {
            const result = await signUp.attemptEmailAddressVerification({
                code,
            })

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId })
                router.push('/dashboard')
            } else {
                setError('Verification incomplete. Please check the code and try again.')
            }
        } catch (err: unknown) {
            console.error('Verification error:', err)
            if (typeof err === 'object' && err && 'errors' in err) {
                const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[] }
                const firstError = clerkErr.errors?.[0]
                if (firstError?.code === 'verification_failed') {
                    setError('Invalid verification code. Please try again.')
                } else if (firstError?.code === 'expired') {
                    setError('Code expired. Please request a new one.')
                } else {
                    setError(firstError?.longMessage || firstError?.message || 'Verification failed')
                }
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
            setCountdown(60)
        } catch (err: unknown) {
            console.error('Resend error:', err)
            setError('Failed to resend code. Please try again later.')
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


                    <div className="space-y-2 mb-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1acec8]/10 text-[#1acec8] mb-4">
                            <Mail size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verify Email</h1>
                        <p className="text-gray-500 font-medium whitespace-pre-line">
                            We&apos;ve sent a code to your email.{'\n'}Enter it below to continue.
                        </p>
                    </div>

                    <div className="mb-8">
                        <div className="relative group">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="0 0 0 0 0 0"
                                className="w-full px-4 py-5 text-3xl text-center tracking-[0.5em] font-bold bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 animate-in fade-in slide-in-from-top-2">
                            <p className="text-red-600 text-sm font-medium text-center">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || code.length !== 6}
                        className="w-full py-4 rounded-2xl bg-[#1acec8] text-white font-bold text-lg shadow-[0_10px_20px_rgba(26,206,200,0.3)] hover:bg-[#15b8b3] hover:shadow-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
                    >
                        {isVerifying ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                Verify Account
                                <ShieldCheck size={20} />
                            </>
                        )}
                    </button>

                    <div className="text-center space-y-4">
                        <p className="text-gray-500 font-medium">
                            Didn&apos;t receive the code?
                        </p>
                        <button
                            onClick={handleResendCode}
                            disabled={isResending || countdown > 0}
                            className="inline-flex items-center gap-2 text-[#1acec8] font-bold hover:underline disabled:text-gray-400 disabled:no-underline transition-all"
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw size={16} className="animate-spin" />
                                    Sending...
                                </>
                            ) : countdown > 0 ? (
                                `Resend Code in ${countdown}s`
                            ) : (
                                <>
                                    <RefreshCw size={16} />
                                    Resend Code
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100 flex justify-center">
                        <a href="/signup" className="inline-flex items-center gap-2 text-gray-500 font-semibold hover:text-gray-800 transition-all">
                            <ArrowLeft size={18} />
                            Back to Sign Up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

