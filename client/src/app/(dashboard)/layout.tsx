"use client"

import React from 'react'
import Navbar from '@/components/Navbar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import { usePathname, useRouter } from 'next/navigation'
import { useGetAuthUserQuery } from '@/state/api'
import { useUser } from '@clerk/nextjs'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
    const { data: authUser, isLoading } = useGetAuthUserQuery(undefined, {
        skip: !isClerkLoaded || !clerkUser,
    });
    const pathname = usePathname();
    const router = useRouter();

    // Cast userRole to the expected type and handle potential undefined
    const userRole = authUser?.userRole?.toLowerCase() as "manager" | "tenant" | undefined;

    React.useEffect(() => {
        if (isClerkLoaded && !isLoading && userRole) {
            if (userRole === "manager" && pathname.startsWith("/tenant")) {
                router.push("/manager");
            } else if (userRole === "tenant" && pathname.startsWith("/manager")) {
                router.push("/tenant");
            }
        }
    }, [isClerkLoaded, isLoading, userRole, pathname, router]);

    return (
        <SidebarProvider defaultOpen={true}>
            <div className='w-full min-h-screen bg-white dark:bg-zinc-700 transition-colors duration-300'>
                <Navbar />
                <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
                    <main className='flex w-full'>
                        {isClerkLoaded && !isLoading && userRole && (
                            <AppSidebar userType={userRole as "manager" | "tenant"} />
                        )}
                        <div className='flex-1 transition-all duration-300 p-4 md:p-8 min-h-[calc(100vh-NAVBAR_HEIGHT)]'>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout