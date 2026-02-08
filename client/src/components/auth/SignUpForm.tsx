'use client'

import { useSignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, User, Building2, Mail, Lock, ArrowRight, ShieldCheck, RefreshCw, ArrowLeft, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserRole = 'tenant' | 'manager'

export default function SignUpForm() {
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()

  const [role, setRole] = useState<UserRole>('tenant')
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isSigningUp, setIsSigningUp] = useState<boolean>(false)
  const [verifying, setVerifying] = useState<boolean>(false)
  const [code, setCode] = useState<string>('')
  const [isVerifying, setIsVerifying] = useState<boolean>(false)
  const [isResending, setIsResending] = useState<boolean>(false)

  if (!isLoaded || !signUp || !setActive) return null

  const handleSignUp = async (): Promise<void> => {
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Fill all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Mismatch')
      return
    }

    if (password.length < 8) {
      setError('Min 8 characters')
      return
    }

    setIsSigningUp(true)
    setError('')

    try {
      await signUp.create({
        username,
        emailAddress: email,
        password,
        unsafeMetadata: {
          role,
        },
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      setVerifying(true)
    } catch (err: unknown) {
      console.error('Sign up error:', err)
      if (typeof err === 'object' && err && 'errors' in err) {
        const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[] }
        const firstError = clerkErr.errors?.[0]
        if (firstError?.code === 'form_identifier_exists') {
          setError('Exists.')
        } else {
          setError(firstError?.message || 'Failed')
        }
      } else {
        setError('Error occurred.')
      }
    } finally {
      setIsSigningUp(false)
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
      const result = await signUp.attemptEmailAddressVerification({
        code,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        setError('Incomplete.')
      }
    } catch (err: unknown) {
      console.error('Verification error:', err)
      if (typeof err === 'object' && err && 'errors' in err) {
        const clerkErr = err as { errors?: { message: string; longMessage?: string; code?: string }[] }
        const firstError = clerkErr.errors?.[0]
        setError(firstError?.message || 'Failed')
      } else {
        setError('Error occurred.')
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
    } catch (err: unknown) {
      console.error('Resend error:', err)
      setError('Failed.')
    } finally {
      setIsResending(false)
    }
  }

  const googleSignUp = (): void => {
    try {
      signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
        unsafeMetadata: {
          role,
        },
      })
    } catch (err) {
      console.error('Google sign up error:', err)
      setError('Google failed')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') {
      if (verifying && !isVerifying) {
        handleVerify()
      } else if (!verifying && !isSigningUp) {
        handleSignUp()
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
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-[12px] text-gray-500 font-medium">Join Rentora to start</p>
        </div>

        {/* Role Selection - Side by Side and Small */}
        {!verifying && (
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setRole('tenant')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 transition-all duration-300",
                role === 'tenant'
                  ? "border-[#1acec8] bg-[#1acec8]/10 text-[#1acec8]"
                  : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
              )}
            >
              <User size={14} className={role === 'tenant' ? "text-[#1acec8]" : "text-gray-400"} />
              <span className="font-bold text-[12px]">Tenant</span>
            </button>

            <button
              onClick={() => setRole('manager')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border-2 transition-all duration-300",
                role === 'manager'
                  ? "border-[#1acec8] bg-[#1acec8]/10 text-[#1acec8]"
                  : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-100"
              )}
            >
              <Building2 size={14} className={role === 'manager' ? "text-[#1acec8]" : "text-gray-400"} />
              <span className="font-bold text-[12px]">Manager</span>
            </button>
          </div>
        )}

        {verifying ? (
          <div className="animate-in fade-in duration-500">
            <div className="space-y-3 mb-4">
              <div className="text-center mb-3">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#1acec8]/10 text-[#1acec8] mb-2">
                  <Mail size={16} />
                </div>
                <h2 className="text-md font-bold text-gray-900">Verify</h2>
                <p className="text-[11px] text-gray-500">Code sent to {email}</p>
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
                  <>Complete <ShieldCheck size={14} /></>
                )}
              </button>
              <button onClick={() => setVerifying(false)} className="w-full text-[11px] text-gray-400 font-medium">Back</button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-5">
              <div className="group relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1acec8] transition-colors">
                  <UserCircle size={15} />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900 text-[13px] font-medium placeholder:text-gray-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="group relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1acec8] transition-colors">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900 text-[13px] font-medium placeholder:text-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1acec8] transition-colors">
                  <Lock size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900 text-[13px] font-medium placeholder:text-gray-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="group relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1acec8] transition-colors">
                  <ShieldCheck size={15} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm"
                  className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] focus:bg-white transition-all text-gray-900 text-[13px] font-medium placeholder:text-gray-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2 rounded-lg bg-red-50 border border-red-100/50">
                <p className="text-red-600 text-[11px] font-medium text-center">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleSignUp}
                disabled={isSigningUp}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1acec8] to-[#15b8b3] text-white text-[13px] font-bold shadow-lg shadow-[#1acec8]/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSigningUp ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : (
                  <>Create Account <ArrowRight size={15} /></>
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
                onClick={googleSignUp}
                className="w-full py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm border-b-2 active:border-b-0 active:translate-y-0.5"
              >
                <Image src="/google.png" alt="Google" width={14} height={14} />
                <span className="text-[13px]">Google</span>
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-gray-500 text-[12px] font-medium">
          Have an account?{' '}
          <a href="/signin" className="text-[#1acec8] font-bold hover:underline decoration-1 underline-offset-2 transition-all">
            Sign In
          </a>
        </p>
      </div>
    </div>
  )
}
