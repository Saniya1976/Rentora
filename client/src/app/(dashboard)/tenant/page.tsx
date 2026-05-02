"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Wallet, CreditCard, Search, MapPin, ArrowRight, FileText, Heart } from 'lucide-react'
import { useGetAuthUserQuery, useGetApplicationsQuery } from '@/state/api'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const DashboardPage = () => {
    const { isLoaded: isClerkLoaded, user: clerkUser } = useUser();
    const { data: authUser, isLoading: isAuthLoading } = useGetAuthUserQuery("tenant", {
        skip: !isClerkLoaded || !clerkUser,
    });

    const { data: applications, isLoading: isAppsLoading } = useGetApplicationsQuery({
        userId: authUser?.clerkId,
        userType: "tenant"
    }, {
        skip: !authUser?.clerkId,
        pollingInterval: 3000
    });

    const isLoading = isAuthLoading || isAppsLoading;

    if (!isClerkLoaded || isLoading) return <div className="flex items-center justify-center min-h-[400px] text-black font-medium transition-all duration-300">Initializing session...</div>;

    if (!authUser || authUser.userRole !== 'tenant') return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved": return "bg-emerald-600 text-white border-emerald-700 shadow-md";
            case "Denied": return "bg-rose-600 text-white border-rose-700 shadow-md";
            default: return "bg-amber-500 text-white border-amber-600 shadow-md";
        }
    };

    return (
        <div className="flex flex-col gap-8 pb-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h1 className="text-4xl font-black bg-linear-to-r from-[#1acec8] to-[#15b8b3] bg-clip-text text-transparent uppercase tracking-tight">
                    tenant dashboard
                </h1>
                <p className="text-muted-foreground text-sm italic font-medium">
                    Welcome back! Here's your rental overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { title: 'Active Leases', value: '1', color: 'text-blue-600' },
                    { title: 'Rent Due', value: '$1,200', color: 'text-orange-600' },
                    { title: 'Applied', value: applications?.length.toString() || '0', color: 'text-rose-600' },
                    { title: 'Maintenance', value: '2', color: 'text-purple-600' },
                ].map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 h-10 flex items-center cursor-pointer transition-all active:scale-[0.98] outline-none hover:bg-muted/10 focus-within:ring-2 focus-within:ring-[#1acec8]">
                        <CardContent className="p-0 px-3 w-full flex items-center justify-between gap-2">
                            <span className="text-[9px] uppercase tracking-tighter font-bold text-gray-500 dark:text-neutral-200 whitespace-nowrap transition-colors">
                                {stat.title}
                            </span>
                            <span className={cn("text-sm font-black transition-colors", stat.color)}>
                                {stat.value}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Applications Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h2 className="text-xl font-bold uppercase tracking-tight">Recent Applications</h2>
                        <Link href="/tenant/applications" className="text-xs font-bold text-[#1acec8] hover:underline flex items-center gap-1">
                            VIEW ALL <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {!applications || applications.length === 0 ? (
                            <Card className="border-border bg-muted/20 border-dashed py-10 flex flex-col items-center justify-center text-center">
                                <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">No applications submitted yet.</p>
                                <Link href="/search">
                                    <button className="text-xs font-bold text-[#1acec8] mt-2 underline">Start Searching</button>
                                </Link>
                            </Card>
                        ) : (
                            applications.slice(0, 3).map((app) => (
                                <Card key={app.id} className="border-border bg-card/40 hover:bg-card/60 transition-all group overflow-hidden">
                                    <CardContent className="p-0 flex flex-col sm:flex-row">
                                        <div className="w-full sm:w-48 h-32 shrink-0 overflow-hidden relative border-b sm:border-b-0 sm:border-r border-border">
                                            <img
                                                src={app.property.photoUrls[0] || "/placeholder-property.jpg"}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={app.property.name}
                                            />
                                            <div className="absolute top-2 left-2">
                                                <Badge className={cn("rounded-md font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 border shadow-lg", getStatusColor(app.status))}>
                                                    {app.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                                            <div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="font-bold text-base leading-tight group-hover:text-[#1acec8] transition-colors truncate">{app.property.name}</h3>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                                                        ${app.property.pricePerMonth}/mo
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-[11px] text-muted-foreground mt-1 font-medium">
                                                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                                    <span className="truncate">{app.property.location.address}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground/80 mt-2 line-clamp-2 italic">
                                                    {app.property.description}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                                                <span className="text-[10px] text-muted-foreground font-medium italic">Applied {new Date(app.applicationDate).toLocaleDateString()}</span>
                                                <Link href={`/search/${app.propertyId}`} className="text-[10px] font-black text-[#1acec8] flex items-center gap-1 hover:underline">
                                                    DETAILS <ArrowRight className="w-2.5 h-2.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight border-b border-border pb-2">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { label: "Find New Property", icon: Search, href: "/search", desc: "Browse available homes" },
                            { label: "Pay Rent", icon: Wallet, href: "/tenant/residences", desc: "Submit monthly payment" },
                            { label: "Saved Homes", icon: Heart, href: "/tenant/favourites", desc: "View your favorites" },
                            { label: "Profile Settings", icon: CreditCard, href: "/tenant/settings", desc: "Manage your info" }
                        ].map((action, i) => (
                            <Link href={action.href} key={i}>
                                <Card className="border-border bg-card/40 hover:border-[#1acec8]/50 hover:bg-[#1acec8]/5 transition-all group cursor-pointer">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-muted group-hover:bg-[#1acec8]/10 transition-colors">
                                            <action.icon className="w-5 h-5 group-hover:text-[#1acec8] transition-colors" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm tracking-tight">{action.label}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-medium">{action.desc}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pro-Tips / Extra Section */}
                    <div className="mt-6">
                        <Card className="border-[#1acec8]/20 bg-[#1acec8]/5 p-4 rounded-2xl">
                            <h3 className="font-bold text-sm text-[#1acec8] mb-1">Rental Tip</h3>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                Keep your profile 100% complete to increase your approval chances by up to 40%.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
