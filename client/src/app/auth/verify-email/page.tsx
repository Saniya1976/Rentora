'use client'

import { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { ClerkAPIError } from '@clerk/types'

export default function VerifyEmailPage() {
  const { signUp, isLoaded } = useSignUp()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  if (!isLoaded) return null

  const verify = async () => {
    try {
      await signUp.attemptEmailAddressVerification({ code })
      router.push('/')
    } catch (err) {
      const clerkError = err as { errors?: ClerkAPIError[] }
      setError(clerkError.errors?.[0]?.message || 'Invalid code')
    }
  }

  return (
    <div className="w-full bg-white p-8 rounded-2xl shadow-xl">
      <h1 className="text-2xl font-semibold mb-6">Verify Email</h1>

      <input
        className="w-full mb-4 px-4 py-3 border rounded-full"
        placeholder="Verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <Button
        onClick={verify}
        className="w-full rounded-full bg-[#1acec8]"
      >
        Verify
      </Button>
    </div>
  )
}
