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
        <SidebarProvider>
            <div className='min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300'>
                <Navbar />
                <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
                    <main className='flex '>
                        {isClerkLoaded && !isLoading && userRole && (
                            <AppSidebar userType={userRole} />
                        )}
                        <div className='flex-grow transition-all duration-300 '>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default DashboardLayout