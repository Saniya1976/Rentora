import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'

const Navbar = () => {
  return (
    <div
      className="fixed top-0 left-0 w-full z-50"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full px-10 bg-[#f9f8f8] text-black">
        <Link href="/" scroll={false}>
          <Image
            src="/mylogorentora.png"
            alt="Rentora Logo"
            width={180}
            height={60}
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* When user is NOT signed in */}
          <SignedOut>
            <SignInButton mode="modal">
              <Button
                className="px-8 py-3 rounded-full bg-[#1acec8] text-white text-lg
                font-medium hover:bg-[#10b9bc] transition-colors duration-200"
              >
                Sign In
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button
                className="px-8 py-3 rounded-full bg-white text-[#02c1c5]
                font-medium shadow-sm text-lg hover:bg-[#e0f7f7]
                transition-colors duration-200"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>

          {/* When user IS signed in */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </div>
  )
}

export default Navbar
