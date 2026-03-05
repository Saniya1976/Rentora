"use client"

import React, { useEffect, useState } from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import { Button } from './ui/button'
import { SignedIn, SignedOut, UserButton, SignOutButton, useUser } from '@clerk/nextjs'
import { LayoutDashboard, Settings, LogOut, Menu, Search, Bell, MessageCircle, Sun, Moon, HouseHeart } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { SidebarContext, SidebarTrigger } from '@/components/ui/sidebar'
import { useGetAuthUserQuery } from '@/state/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

const Navbar = () => {
  const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
  const { data: authUser } = useGetAuthUserQuery(undefined, {
    skip: !isClerkLoaded || !clerkUser,
  });
  const userRole = authUser?.userRole;

  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/manager') || pathname.startsWith('/tenant');
  const sidebar = React.useContext(SidebarContext);

  const handleDashboardClick = () => {
    if (isDashboardPage && sidebar) {
      sidebar.setOpen(true);
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const ThemeToggle = () => {
    const isDark = resolvedTheme === 'dark';

    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-gray-700 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all rounded-xl w-11 h-11"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        <Sun className={cn(
          "h-7 w-7 transition-all",
          isDark ? "-rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )} />
        <Moon className={cn(
          "absolute h-7 w-7 transition-all",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
        )} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  };

  const SearchBar = () => (
    <div className="relative group max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-4 h-4 text-gray-400 group-focus-within:text-[#1acec8] transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search..."
        className="block w-full pl-10 pr-3 h-11 border border-gray-100 dark:border-white/10 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1acec8]/20 focus:border-[#1acec8] transition-all bg-gray-50/50 dark:bg-zinc-700/50 text-gray-900 dark:text-gray-100"
      />
    </div>
  );

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "flex flex-col gap-1 w-full" : "flex items-center gap-6"}>
      {isDashboardPage && (
        <Link href="/" className="w-full md:w-auto">
          <div className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold",
            mobile
              ? "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 w-full"
              : "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/5"
          )}>
            <HouseHeart className="w-6 h-6" />
            <span>Home</span>
          </div>
        </Link>
      )}
      <Link href={userRole === 'manager' ? '/manager' : '/tenant'} className="w-full md:w-auto" onClick={handleDashboardClick}>
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold",
          mobile
            ? "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 w-full"
            : "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/5"
        )}>
          <LayoutDashboard className="w-6 h-6" />
          <span>Dashboard</span>
        </div>
      </Link>
      <Link href="/settings" className="w-full md:w-auto">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold",
          mobile
            ? "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 w-full"
            : "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/5"
        )}>
          <Settings className="w-6 h-6" />
          <span>Settings</span>
        </div>
      </Link>
      <SignOutButton>
        <button className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold cursor-pointer text-left",
          mobile
            ? "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 w-full"
            : "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/5"
        )}>
          <LogOut className="w-6 h-6" />
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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 transition-all">
              <HouseHeart className="w-11 h-11 text-black dark:text-white shrink-0" />
            </div>
            <span className="text-xl font-bold tracking-wider font-cute text-black dark:text-white">
              RENTORA
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 w-full z-50 border-b border-gray-100 dark:border-white/10 shadow-sm transition-colors duration-300"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      <div className="flex justify-between items-center w-full h-full px-4 md:px-10 bg-white dark:bg-zinc-700 text-black dark:text-white transition-colors duration-300">
        <Link href="/" className="flex items-center gap-2 group" scroll={false}>
          {isDashboardPage && sidebar && (
            <div className="mr-2">
              <SidebarTrigger />
            </div>
          )}
          <div className="p-2 transition-all">
            <HouseHeart className="w-11 h-11 text-black dark:text-white shrink-0" />
          </div>
          <span className="text-2xl font-bold tracking-wider font-cute text-black dark:text-white">
            RENTORA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <SignedOut>
            <Link href="/signin">
              <Button variant="ghost" className="px-6 h-11 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all">
                Sign In
              </Button>
            </Link>

            <Link href="/signup">
              <Button className="px-6 h-11 rounded-xl bg-[#1acec8] text-white font-bold hover:bg-[#15b8b3] hover:shadow-[0_6px_15px_rgba(26,206,200,0.3)] shadow-[0_4px_10px_rgba(26,206,200,0.2)] transition-all">
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
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all rounded-xl relative group w-11 h-11">
                <MessageCircle className="w-7 h-7" strokeWidth={2.2} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#1acec8] rounded-full ring-2 ring-white dark:ring-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <div className="relative group">
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all rounded-xl w-11 h-11">
                  <Bell className="w-7 h-7" strokeWidth={2.2} />
                </Button>
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#1acec8] rounded-full ring-2 ring-white dark:ring-zinc-700" />
              </div>
            </div>

            <div className="h-6 w-px bg-gray-100 dark:bg-white/10 mx-2" />

            <NavLinks />
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-11 h-11 border-2 border-[#1acec8]/20"
                }
              }}
            />
          </SignedIn>

          <div className="flex items-center ml-2 border-l border-gray-100 dark:border-white/10 pl-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-4">
          <SignedIn>
            {isDashboardPage && (
              <div className="hidden sm:block md:hidden w-48 mr-2">
                <SearchBar />
              </div>
            )}
            <div className="flex items-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-11 h-11 border-2 border-[#1acec8]/20"
                  }
                }}
              />
            </div>
          </SignedIn>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-[#1acec8]/10 hover:text-[#1acec8] rounded-xl transition-all">
                <Menu className="w-7 h-7" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] p-2 rounded-2xl shadow-xl border-gray-100 dark:border-white/10 bg-white dark:bg-zinc-700 mt-2">
              <div className="p-1">
                <div className="flex items-center justify-between px-2 py-2 mb-2 bg-gray-50 dark:bg-zinc-700/50 rounded-xl">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-2">App Settings</span>
                  <div className="flex items-center gap-1">
                    <SignedIn>
                      <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all rounded-lg h-11 w-11">
                        <MessageCircle className="w-7 h-7" strokeWidth={2.2} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all rounded-lg h-11 w-11">
                        <Bell className="w-7 h-7" strokeWidth={2.2} />
                      </Button>
                    </SignedIn>
                    <ThemeToggle />
                  </div>
                </div>
              </div>

              <SignedOut>
                <div className="p-2 flex flex-col gap-2">
                  <Link href="/signin" className="w-full">
                    <Button variant="outline" className="w-full justify-center rounded-xl font-bold border-gray-200 dark:border-white/10 dark:text-white hover:bg-[#1acec8]/5 hover:text-[#1acec8] hover:border-[#1acec8]/30 transition-all">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full">
                    <Button className="w-full justify-center rounded-xl bg-[#1acec8] text-white font-bold hover:bg-[#15b8b3] transition-all">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </SignedOut>

              <SignedIn>
                {isDashboardPage && (
                  <div className="px-2 py-2 mb-2">
                    <SearchBar />
                  </div>
                )}
                <div className="p-1">
                  <NavLinks mobile />
                </div>
              </SignedIn>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default Navbar


