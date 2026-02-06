'use client'

import { useSignIn } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function GoogleAuthButton() {
  const { signIn, isLoaded } = useSignIn()

  if (!isLoaded || !signIn) return null

  const signInWithGoogle = async () => {
    await signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: '/dashboard',
      redirectUrlComplete: '/dashboard',
    })
  }

  return (
    <Button
      onClick={signInWithGoogle}
      className="w-full rounded-full bg-[#007BFF] hover:bg-[#006ae6]"
    >
      Continue with Google
    </Button>
  )
}
