import React from 'react'
import Navbar from '@/components/Navbar'
import { NAVBAR_HEIGHT } from '@/lib/constants'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Sidebar } from 'lucide-react'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
        <div>
            <Navbar />
            <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
                <main className='flex '>
                    <Sidebar />
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