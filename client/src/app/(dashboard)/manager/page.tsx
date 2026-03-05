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

    const managerStats = [
        {
            title: 'Total Properties',
            value: '12',
            icon: Building2,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Active Tenants',
            value: '45',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
        {
            title: 'Total Revenue',
            value: '$12,450',
            icon: Wallet,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
        },
        {
            title: 'Pending Viewings',
            value: '8',
            icon: Calendar,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
    ]

    const tenantStats = [
        {
            title: 'Active Leases',
            value: '1',
            icon: Home,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
        },
        {
            title: 'Rent Due',
            value: '$1,200',
            icon: Wallet,
            color: 'text-orange-600',
            bg: 'bg-orange-100',
        },
        {
            title: 'Saved Properties',
            value: '15',
            icon: Heart,
            color: 'text-rose-600',
            bg: 'bg-rose-100',
        },
        {
            title: 'Maintenance',
            value: '2',
            icon: MessageSquare,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
        },
    ]

    const stats = userRole === 'manager' ? managerStats : tenantStats;

    if (userRole === 'tenant') {
        return (
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-black bg-gradient-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                    tenant
                </h1>
                <p className="text-gray-500 dark:text-neutral-400 text-sm italic">
                    Start building your dashboard here...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-3 transition-colors">
                    Manager Dashboard
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full font-black border bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800 transition-colors">
                        manager
                    </span>
                </h1>
                <p className="text-gray-500 dark:text-neutral-400 mt-2 transition-colors">Welcome back! Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {managerStats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm dark:shadow-zinc-800/50 hover:shadow-md transition-all dark:bg-zinc-700/50 dark:border dark:border-white/5">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-gray-500 dark:text-neutral-400 transition-colors">
                                {stat.title}
                            </CardTitle>
                            <div className={`${stat.bg} dark:bg-zinc-700/50 p-2 rounded-lg transition-colors`}>
                                <stat.icon className={`w-5 h-5 ${stat.color} dark:text-[#1acec8] transition-colors`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold dark:text-neutral-100 transition-colors">{stat.value}</div>
                            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">+2.5% from last month</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 transition-all">
                    <CardHeader>
                        <CardTitle className="dark:text-neutral-100">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-xl transition-all">
                                    <div className="w-10 h-10 rounded-full bg-[#1acec8]/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#1acec8]" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold text-gray-800 dark:text-neutral-200 transition-colors">
                                            New tenant application
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-neutral-400 transition-colors">2 hours ago</p>
                                    </div>
                                    <div className="text-xs font-medium text-gray-400 dark:text-neutral-500">#4521</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 transition-all">
                    <CardHeader>
                        <CardTitle className="dark:text-neutral-100">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-[#1acec8] dark:hover:border-[#1acec8] hover:bg-[#1acec8]/5 transition-all text-left group">
                                <Building2 className="w-6 h-6 text-gray-400 group-hover:text-[#1acec8] mb-2" />
                                <p className="font-semibold text-gray-700 dark:text-neutral-200 group-hover:text-[#1acec8] transition-colors">Add Property</p>
                                <p className="text-xs text-gray-400 dark:text-neutral-500">List a new rental unit</p>
                            </button>
                            <button className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 hover:border-[#1acec8] dark:hover:border-[#1acec8] hover:bg-[#1acec8]/5 transition-all text-left group">
                                <Users className="w-6 h-6 text-gray-400 group-hover:text-[#1acec8] mb-2" />
                                <p className="font-semibold text-gray-700 dark:text-neutral-200 group-hover:text-[#1acec8] transition-colors">Invite Tenant</p>
                                <p className="text-xs text-gray-400 dark:text-neutral-500">Send an onboarding link</p>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DashboardPage
