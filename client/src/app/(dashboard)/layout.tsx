import React from 'react'
import Navbar from '@/components/Navbar'
import { NAVBAR_HEIGHT } from '@/lib/constants'

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
            <Navbar />
            <main
                className="flex-grow w-full"
                style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {children}
                </div>
            </main>
        </div>
    )
}

export default DashboardLayout
