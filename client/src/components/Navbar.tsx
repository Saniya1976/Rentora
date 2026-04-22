"use client"

import React, { useEffect, useState } from 'react'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import { Button } from './ui/button'
import { SignedIn, SignedOut, UserButton, SignOutButton, useUser } from '@clerk/nextjs'
import { LayoutDashboard, Settings, LogOut, Menu, Search, Bell, MessageCircle, Sun, Moon, HouseHeart, Info, FileText } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { SidebarContext, SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
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
  const pathname = usePathname();

  const clerkRoleHint = (
    (clerkUser?.publicMetadata?.userType as string) ||
    (clerkUser?.unsafeMetadata?.role as string)
  )?.toLowerCase();

  const { data: authUser } = useGetAuthUserQuery(clerkRoleHint, {
    skip: !isClerkLoaded || !clerkUser,
  });
  const userRole = authUser?.userRole;

  const notifications = React.useMemo(() => {
    if (userRole === "manager") {
      return [
        { title: "New Application", desc: "A new tenant has applied for Modern Sea View.", time: "10m ago", icon: FileText, color: "text-[#1acec8]", bg: "bg-[#1acec8]/10" },
        { title: "Upcoming Lease End", desc: "Lease for Unit 402 ends in 30 days.", time: "Reminder", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" }
      ];
    } else {
      return [
        { title: "Application Under Review", desc: "The manager of White House is reviewing your profile.", time: "2 hours ago", icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Upcoming Rent", desc: "Your next payment is due in 3 days.", time: "Urgent", icon: Bell, color: "text-amber-600", bg: "bg-amber-50" }
      ];
    }
  }, [userRole]);

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
      <Link href="/search" className="w-full md:w-auto">
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-bold",
          mobile
            ? "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 w-full"
            : "text-gray-600 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/5"
        )}>
          <Search className="w-6 h-6" />
          <span>Search</span>
        </div>
      </Link>
      <Link href={userRole === 'manager' ? '/manager/settings' : '/tenant/settings'} className="w-full md:w-auto">
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-all duration-300" style={{ height: NAVBAR_HEIGHT }}>
      <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-linear-to-br from-[#1acec8] to-[#15b8b3] rounded-xl flex items-center justify-center shadow-[0_4px_15px_rgba(26,206,200,0.3)] group-hover:scale-105 transition-all">
              <HouseHeart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">rentora</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-1">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300 hover:text-[#1acec8] hover:bg-[#1acec8]/10 transition-all rounded-xl w-11 h-11 relative">
                    <Bell className="w-7 h-7" strokeWidth={2.2} />
                    {notifications.length > 0 && (
                      <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-zinc-800" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0 border border-border shadow-2xl rounded-2xl overflow-hidden mt-2">
                  <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                    <h3 className="font-black uppercase tracking-tighter text-sm">Notifications</h3>
                    <Badge className="bg-[#1acec8] text-white text-[9px] h-4 px-1.5 uppercase font-bold">{notifications.length} New</Badge>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs font-medium italic">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notif, i) => (
                        <DropdownMenuItem key={i} className="p-4 flex items-start gap-4 cursor-pointer focus:bg-muted/50 transition-colors border-b border-border last:border-0 outline-none group/item">
                          <div className={cn("p-2 rounded-xl shrink-0 transition-transform group-hover/item:scale-110", notif.bg)}>
                            <notif.icon className={cn("w-4 h-4", notif.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h4 className="font-bold text-xs tracking-tight">{notif.title}</h4>
                              <span className="text-[8px] font-black text-muted-foreground uppercase">{notif.time}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">{notif.desc}</p>
                          </div>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-muted/10 text-center">
                    <button className="text-[10px] font-black uppercase text-[#1acec8] hover:underline tracking-widest">
                      Mark all as read
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <SignedOut>
            <div className="flex items-center gap-4">
              <Link href="/signin">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 font-bold hover:text-[#1acec8] hover:bg-[#1acec8]/5 transition-all">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#1acec8] hover:bg-[#15b8b3] text-white font-bold rounded-xl px-6 shadow-lg shadow-[#1acec8]/20 transition-all active:scale-95">
                  Sign Up
                </Button>
              </Link>
            </div>
          </SignedOut>

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
                    <Button className="w-full justify-center rounded-xl bg-[#1acec8] hover:bg-[#15b8b3] text-white font-bold transition-all">
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
    </nav>
  )
}

export default Navbar
