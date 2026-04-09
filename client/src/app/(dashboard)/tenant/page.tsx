"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, Wallet, Calendar, Home, CreditCard, Heart, MessageSquare, Search } from 'lucide-react'
import { useGetAuthUserQuery } from '@/state/api'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

const DashboardPage = () => {
    const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
    const { data: authUser, isLoading, error, isError } = useGetAuthUserQuery(undefined, {
        skip: !isClerkLoaded || !clerkUser,
    });

    if (!isClerkLoaded || isLoading) return <div className="flex items-center justify-center min-h-[400px] text-black font-medium">Initializing session...</div>;
    if (isError || !authUser) {
        console.error('Dashboard Auth Error:', error);
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <p className="text-red-500 font-bold">Error fetching user data.</p>
                <p className="text-red-400 text-xs italic opacity-80 max-w-xs">
                    {typeof error === 'object' && error && 'data' in error
                        ? (error.data as any).message || JSON.stringify(error.data)
                        : 'Please check your connection or try signing in again.'
                    }
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-[#1acec8] text-white rounded-lg text-sm font-bold shadow-sm"
                >
                    Retry
                </button>
            </div>
        );
    }

    const userRole = authUser.userRole;

    if (userRole !== 'tenant') return null;

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black bg-linear-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                tenant dashboard
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm italic">
                Welcome back! Here's your rental overview.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {[
                    { title: 'Active Leases', value: '1', color: 'text-blue-600' },
                    { title: 'Rent Due', value: '$1,200', color: 'text-orange-600' },
                    { title: 'Saved', value: '15', color: 'text-rose-600' },
                    { title: 'Maintenance', value: '2', color: 'text-purple-600' },
                ].map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 h-10 flex items-center cursor-pointer transition-all active:scale-[0.98] outline-none hover:bg-muted/10 focus-within:ring-2 focus-within:ring-[#1acec8]">
                        <CardContent className="p-0 px-3 w-full flex items-center justify-between gap-2">
                            <span className="text-[9px] uppercase tracking-tighter font-bold text-gray-500 dark:text-neutral-200 whitespace-nowrap transition-colors">
                                {stat.title}
                            </span>
                            <span className={cn("text-sm font-black dark:text-[#1acec8] transition-colors", stat.color)}>
                                {stat.value}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default DashboardPage
