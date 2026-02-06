'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ClerkAPIError } from '@clerk/types'

export default function SignUpForm() {
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isLoaded) return null

  const handleSignUp = async () => {
    try {
      await signUp.create({
        emailAddress: email,
        password,
      })

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      })

      router.push('/verify-email')
    } catch (err) {
      const clerkError = err as { errors?: ClerkAPIError[] }
      setError(clerkError.errors?.[0]?.message || 'Sign up failed')
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-semibold mb-6">Sign Up</h1>

      <input
        className="w-full mb-4 px-4 py-3 border rounded-full"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full mb-4 px-4 py-3 border rounded-full"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <Button
        onClick={handleSignUp}
        className="w-full rounded-full bg-[#1acec8] hover:bg-[#10b9bc]"
      >
        Create Account
      </Button>
    </div>
  )
}
