'use client'

import { useSignUp } from '@clerk/nextjs'
import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUpForm() {
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  if (!isLoaded || !signUp) return null

  const handleSignUp = async (): Promise<void> => {
    try {
      await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      router.push('/verify-email')
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'errors' in err) {
        const clerkErr = err as { errors?: { message: string }[] }
        setError(clerkErr.errors?.[0]?.message ?? 'Sign up failed')
      }
    }
  }

  const googleSignUp = (): void => {
    signUp.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/sso-callback',
      redirectUrlComplete: '/',
    })
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-xl p-8 shadow-lg">
      <div className="flex justify-center mb-4">
        <Image 
          src="/mylogorentora.png" 
          alt="RENTORA" 
          width={140} 
          height={50} 
          className="text-2xl font-bold"
        />
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
      <p className="text-center text-gray-500 text-base mb-6">
        Start your journey with Rentora
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
        onClick={googleSignUp}
        className="w-full py-3 text-base border border-gray-300 rounded-lg font-medium mb-4 hover:bg-gray-50 transition-colors"
      >
        Continue with Google
      </button>

      <button
        onClick={handleSignUp}
        className="w-full py-3 text-base rounded-lg bg-[#1acec8] text-white font-semibold mb-6 hover:bg-[#15b8b3] transition-colors"
      >
        Sign Up
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <a href="/signin" className="text-[#1acec8] font-medium hover:underline">
          Sign In
        </a>
      </p>
    </div>
  )
}