"use client"

import React, { useEffect, useState } from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from './ui/button'
import { SignedIn, SignedOut, UserButton, SignOutButton } from '@clerk/nextjs'
import { LayoutDashboard, Settings, LogOut, Menu, Search, Bell, MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const Navbar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const isDashboardPage = pathname.includes('dashboard');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const SearchBar = () => (
    <div className="relative group max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[#1acec8] transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search..."
        className="block w-full pl-10 pr-3 py-2 border border-gray-100 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] transition-all bg-gray-50/50"
      />
    </div>
  );

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col gap-4 mt-8" : "flex items-center gap-6"}>
      <Link
        href="/dashboard"
        className="text-gray-600 font-bold hover:text-[#1acec8] transition-all flex items-center gap-2"
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </Link>
      <Link
        href="/settings"
        className="text-gray-600 font-bold hover:text-[#1acec8] transition-all flex items-center gap-2"
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
      <SignOutButton>
        <button className="text-gray-600 font-bold hover:text-[#1acec8] transition-all flex items-center gap-2 cursor-pointer w-full text-left">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </SignOutButton>
    </div>
  )

  if (!mounted) {
    return (
      <div
        className="fixed top-0 left-0 w-full z-50 border-b border-gray-100 shadow-sm bg-white"
        style={{ height: `${NAVBAR_HEIGHT}px` }}
      >
        <div className="flex justify-between items-center w-full h-full px-4 md:px-10">
          <Link href="/" className="flex items-center">
            <Image
              src="/mylogorentora.png"
              alt="Rentora Logo"
              width={140}
              height={40}
              priority
              className="object-contain w-auto h-auto md:w-[160px]"
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 border-b border-gray-100 shadow-sm"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full px-4 md:px-10 bg-white text-black">
        <Link href="/" className="flex items-center" scroll={false}>
          <Image
            src="/mylogorentora.png"
            alt="Rentora Logo"
            width={140}
            height={40}
            priority
            className="object-contain w-auto h-auto md:w-[160px]"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
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
            {isDashboardPage && (
              <div className="hidden lg:block w-72 mr-4">
                <SearchBar />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#1acec8] hover:bg-[#1acec8]/5 transition-all rounded-xl relative group">
                <MessageCircle className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#1acec8] rounded-full ring-2 ring-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <div className="relative group">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#1acec8] hover:bg-[#1acec8]/5 transition-all rounded-xl">
                  <Bell className="w-5 h-5" />
                </Button>
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#1acec8] rounded-full ring-2 ring-white" />
              </div>
            </div>

            <div className="h-6 w-px bg-gray-100 mx-2" />

            <NavLinks />
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

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-4">
          <SignedIn>
            {isDashboardPage && (
              <div className="hidden sm:block md:hidden w-48 mr-2">
                <SearchBar />
              </div>
            )}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#1acec8] transition-all">
                <MessageCircle className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#1acec8] transition-all">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 border-2 border-[#1acec8]/20"
                }
              }}
            />
          </SignedIn>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Menu className="w-6 h-6 text-gray-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Image
                    src="/mylogorentora.png"
                    alt="Rentora Logo"
                    width={120}
                    height={35}
                    className="object-contain"
                  />
                </SheetTitle>
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-4">
                <SignedOut>
                  <Link href="/signin">
                    <Button variant="outline" className="w-full justify-start rounded-xl font-bold">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full justify-start rounded-xl bg-[#1acec8] text-white font-bold hover:bg-[#15b8b3]">
                      Sign Up
                    </Button>
                  </Link>
                </SignedOut>

                <SignedIn>
                  {isDashboardPage && (
                    <div className="px-1 mb-4">
                      <SearchBar />
                    </div>
                  )}
                  <NavLinks mobile />
                </SignedIn>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}

export default Navbar


