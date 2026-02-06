'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ClerkAPIError } from '@clerk/types'

export default function SignInForm() {
  const { signIn, isLoaded } = useSignIn()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (!isLoaded) return null

  const handleSignIn = async () => {
    try {
      await signIn.create({
        identifier: email,
        password,
      })
      router.push('/')
    } catch (err) {
      const clerkError = err as { errors?: ClerkAPIError[] }
      setError(clerkError.errors?.[0]?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-semibold mb-6">Sign In</h1>

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
        onClick={handleSignIn}
        className="w-full rounded-full bg-[#1acec8] hover:bg-[#10b9bc]"
      >
        Sign In
      </Button>
    </div>
  )
}
