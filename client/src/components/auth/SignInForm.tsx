'use client'

import { useSignIn } from '@clerk/nextjs'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function SignInForm() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false)

  if (!isLoaded || !signIn) return null

  const handleSignIn = async (): Promise<void> => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }

    setIsSigningIn(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        // Set the session as active
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else if (result.status === 'needs_first_factor') {
        // Handle cases where additional verification is needed
        setError('Additional verification required')
      } else if (result.status === 'needs_second_factor') {
        // Handle 2FA if enabled
        setError('Two-factor authentication required')
      } else {
        setError('Sign in incomplete. Please try again.')
      }
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'errors' in err) {
        const clerkErr = err as { errors?: { message: string; longMessage?: string }[] }
        setError(clerkErr.errors?.[0]?.longMessage || clerkErr.errors?.[0]?.message || 'Sign in failed')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSigningIn(false)
    }
  }

  const googleSignIn = (): void => {
    signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/dashboard',
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !isSigningIn) {
      handleSignIn()
    }
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-xl p-6 shadow-lg">
      <div className="flex justify-center mb-4">
        <Image
          src="/mylogorentora.png"
          alt="RENTORA"
          width={140}
          height={50}
          className="text-2xl font-bold"
        />
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">Welcome Back!</h1>
      <p className="text-center text-gray-500 text-base mb-6">
        Let&apos;s find whom you belong.
      </p>

      <div className="space-y-4 mb-6">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1acec8] focus:border-[#1acec8]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1acec8] focus:border-[#1acec8] pr-12"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="w-full py-3 text-base rounded-lg bg-[#1acec8] text-white font-semibold mb-4 hover:bg-[#15b8b3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isSigningIn ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Signing In...
          </>
        ) : (
          'Sign In'
        )}
      </button>

      <button
        onClick={googleSignIn}
        className="w-full py-3 text-base border border-gray-300 rounded-lg font-medium mb-6 hover:bg-gray-50 transition-colors"
      >
        Continue with Google
      </button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <a href="/signup" className="text-[#1acec8] font-medium hover:underline">
          Sign Up
        </a>
      </p>
    </div>
  )
}