"use client"

import React from 'react'
import Navbar from '@/components/Navbar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar'
import { useGetAuthUserQuery } from '@/state/api'
import { useUser } from '@clerk/nextjs'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
    const { data: authUser, isLoading } = useGetAuthUserQuery(undefined, {
        skip: !isClerkLoaded || !clerkUser,
    });

    const userRole = authUser?.userRole as "manager" | "tenant" | undefined;

    return (
        <SidebarProvider defaultOpen={true}>
            <div className='w-full min-h-screen bg-white dark:bg-zinc-700 transition-colors duration-300'>
                <Navbar />
                <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
                    <main className='flex w-full'>
                        {isClerkLoaded && !isLoading && userRole && (
                            <AppSidebar userType={userRole} />
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