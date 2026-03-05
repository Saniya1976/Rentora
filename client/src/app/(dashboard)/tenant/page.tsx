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
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                tenant dashboard
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm italic">
                Welcome back! Here's your rental overview.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                {[
                    { title: 'Active Leases', value: '1', icon: Home, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { title: 'Rent Due', value: '$1,200', icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { title: 'Saved Properties', value: '15', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-100' },
                    { title: 'Maintenance', value: '2', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm dark:shadow-zinc-800/50 hover:shadow-md transition-all dark:bg-zinc-700/50 dark:border dark:border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-zinc-400 transition-colors">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} dark:bg-zinc-700/50 p-2 rounded-lg transition-colors`}>
                                <stat.icon className={`w-5 h-5 ${stat.color} dark:text-[#1acec8] transition-colors`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold dark:text-neutral-100 transition-colors">{stat.value}</div>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">Updated just now</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default DashboardPage
