import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const Navbar = () => {
  return (
    <div
      className="fixed top-0 left-0 w-full z-50 border-b border-gray-100 shadow-sm"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full px-10 bg-white text-black">
        <Link href="/" className="flex items-center" scroll={false}>
          <Image
            src="/mylogorentora.png"
            alt="Rentora Logo"
            width={160}
            height={50}
            priority
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-6">
          <SignedOut>
            <Link href="/signin">
              <Button variant="ghost" className="px-6 py-2 rounded-xl text-gray-600 font-bold hover:text-[#1acec8] hover:bg-[#1acec8]/5 transition-all">
                Sign In
              </Button>
            </Link>

            <Link href="/signup">
              <Button className="px-6 py-2 rounded-xl bg-[#1acec8] text-white font-bold hover:bg-[#15b8b3] shadow-[0_4px_10px_rgba(26,206,200,0.2)] transition-all">
                Sign Up
              </Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="text-gray-600 font-bold hover:text-[#1acec8] transition-all">
              Dashboard
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 border-2 border-[#1acec8]/20"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </div>
  )
}

export default Navbar

