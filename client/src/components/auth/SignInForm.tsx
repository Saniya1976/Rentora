'use client'

import { useSignIn } from '@clerk/nextjs'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react'

export default function SignInForm() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false)
  const [verifying, setVerifying] = useState<boolean>(false)
  const [code, setCode] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [isResending, setIsResending] = useState<boolean>(false)

  if (!isLoaded || !signIn) return null

  const handleSignIn = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Enter email and password')
      return
    }

    setIsSigningIn(true)
    setError('')

    try {
      const attempt = await signIn.create({
        identifier: email,
      })

      const supportsPassword = attempt.supportedFirstFactors?.some(
        (f) => f.strategy === 'password'
      )

      if (supportsPassword) {
        const result = await attempt.attemptFirstFactor({
          strategy: 'password',
          password,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          router.push('/dashboard')
        } else if (result.status === 'needs_first_factor') {
          const emailCodeFactor = result.supportedFirstFactors?.find(
            (f: any) => f.strategy === 'email_code'
          ) as any
          if (emailCodeFactor) {
            await signIn.prepareFirstFactor({
              strategy: 'email_code',
              emailAddressId: emailCodeFactor.emailAddressId
            })
            setVerifying(true)
          } else {
            setError('Verification required. Check email.')
          }
        } else if (result.status === 'needs_second_factor') {
          setError('2FA required.')
        } else {
          setError(`Incomplete: ${result.status}`)
        }
      } else {
        const emailCodeFactor = attempt.supportedFirstFactors?.find(
          (f: any) => f.strategy === 'email_code'
        ) as any

        if (emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId
          })
          setVerifying(true)
        } else {
          setError('Password sign-in not supported. Use Google.')
        }
      }
    } catch (err: unknown) {
      console.error('Sign in error:', err)
      if (typeof err === 'object' && err && 'errors' in err) {
        const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[] }
        const firstError = clerkErr.errors?.[0]

        if (firstError?.code === 'form_password_incorrect') {
          setError('Invalid email or password.')
        } else if (firstError?.code === 'form_identifier_not_found') {
          setError('No account found.')
        } else if (firstError?.code === 'strategy_not_supported' || firstError?.message?.includes('strategy')) {
          setError('Use Google to sign in.')
        } else {
          setError(firstError?.message || 'Sign in failed')
        }
      } else {
        setError('Error occurred. Try again.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleVerify = async (): Promise<void> => {
    if (code.length !== 6) {
      setError('Enter 6-digit code')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        setError('Verification incomplete.')
      }
    } catch (err: unknown) {
      console.error('Verification error:', err)
      if (typeof err === 'object' && err && 'errors' in err) {
        const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[] }
        const firstError = clerkErr.errors?.[0]
        setError(firstError?.message || 'Verification failed')
      } else {
        setError('Error occurred. Try again.')
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async (): Promise<void> => {
    setIsResending(true)
    setError('')

    try {
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'email_code'
      ) as any

      if (emailCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId
        })
      } else {
        setError('Method not found.')
      }
    } catch (err: unknown) {
      console.error('Resend error:', err)
      setError('Resend failed.')
    } finally {
      setIsResending(false)
    }
  }

  const googleSignIn = (): void => {
    try {
      signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err) {
      console.error('Google sign in error:', err)
      setError('Google sign-in failed')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (verifying && !isVerifying) {
        handleVerify()
      } else if (!verifying && !isSigningIn) {
        handleSignIn()
      }
    }
  }

  return (
    <div className="w-full max-w-[340px] backdrop-blur-3xl bg-white/70 rounded-[28px] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] border border-white/40 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#1acec8]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-xl font-black tracking-tighter text-gray-900 mb-0.5">
            RENT<span className="text-[#1acec8]">ORA</span>
          </h2>
          <div className="h-0.5 w-6 bg-[#1acec8] rounded-full mx-auto" />
        </div>

        <div className="space-y-1 mb-5 text-center">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="text-[12px] text-gray-500 font-medium">Please enter details to sign in</p>
        </div>

        {verifying ? (
          <div className="animate-in fade-in duration-500">
            <div className="space-y-3 mb-4">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#1acec8]/10 text-[#1acec8] mb-2">
                  <Mail size={16} />
                </div>
                <h2 className="text-md font-bold text-gray-900">Verify</h2>
                <p className="text-[11px] text-gray-500">Sent code to {email}</p>
              </div>

              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                className="w-full text-center text-xl tracking-[0.2em] font-bold py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-100/50">
                <p className="text-red-600 text-[11px] font-medium text-center">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleVerify}
                disabled={isVerifying || code.length !== 6}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1acec8] to-[#15b8b3] text-white text-[13px] font-bold shadow-lg shadow-[#1acec8]/10 hover:shadow-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isVerifying ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <>Verify <ShieldCheck size={14} /></>
                )}
              </button>

              <button
                onClick={handleResendCode}
                disabled={isResending}
                className="w-full py-1 text-[#1acec8] font-bold hover:underline text-[11px] disabled:text-gray-400 decoration-1 underline-offset-2"
              >
                Resend Code
              </button>

              <button
                onClick={() => setVerifying(false)}
                className="w-full mt-1 flex items-center justify-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-[11px] font-medium"
              >
                <ArrowLeft size={12} /> Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2.5 mb-5">
              <div className="group relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1acec8] transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900 text-[13px] font-medium placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1acec8] transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900 text-[13px] font-medium placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-end p-0.5">
                <button className="text-[11px] font-bold text-[#1acec8] hover:text-[#15b8b3] transition-colors">
                  Forgot?
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 rounded-lg bg-red-50 border border-red-100/50">
                <p className="text-red-600 text-[11px] font-medium text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1acec8] to-[#15b8b3] text-white text-[13px] font-bold shadow-lg shadow-[#1acec8]/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSigningIn ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <>Sign In <LogIn size={15} /></>
                )}
              </button>

              <div className="relative py-0.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-2 bg-white/0 text-gray-400 font-bold uppercase tracking-widest">or</span>
                </div>
              </div>

              <button
                onClick={googleSignIn}
                className="w-full py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm border-b-2 active:border-b-0 active:translate-y-0.5"
              >
                <Image src="/google.png" alt="Google" width={14} height={14} />
                <span className="text-[13px]">Google</span>
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-gray-500 text-[12px] font-medium">
          New?{' '}
          <a href="/signup" className="text-[#1acec8] font-bold hover:underline decoration-1 underline-offset-2 transition-all">
            Join Rentora <ArrowRight size={12} className="inline" />
          </a>
        </p>
      </div>
    </div>
  )
}