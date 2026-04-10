"use client";

import React from "react";
import { useGetApplicationsQuery, useGetAuthUserQuery, useUpdateApplicationStatusMutation, useGetManagerPropertiesQuery } from "@/state/api";
import { format } from "date-fns";
import { FileText, MapPin, Calendar, User, Phone, Mail, CheckCircle, XCircle, Building, ArrowRight, PlusCircle, DollarSign, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const ManagerDashboard = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const {
        data: applications,
        isLoading: isAppsLoading,
        isError: isAppsError,
    } = useGetApplicationsQuery({
        userId: authUser?.clerkId,
        userType: "manager",
    });

    const {
        data: properties,
        isLoading: isPropsLoading,
    } = useGetManagerPropertiesQuery(authUser?.clerkId || "", {
        skip: !authUser?.clerkId,
    });

    const isLoading = isAppsLoading || isPropsLoading;
    const isError = isAppsError;

    const [updateStatus, { isLoading: isUpdating }] = useUpdateApplicationStatusMutation();

    const handleStatusUpdate = async (id: number, status: "Approved" | "Denied") => {
        try {
            await updateStatus({ id, status }).unwrap();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1acec8]"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl">
                Failed to load applications. Please try again later.
            </div>
        );
    }

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
                    Manager Dashboard
                </h1>
                <p className="text-muted-foreground text-sm italic font-medium">
                    Overview of your properties and incoming applications.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 h-10 flex items-center">
                    <CardContent className="p-0 px-3 w-full flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-tighter font-bold text-gray-500 dark:text-neutral-200 whitespace-nowrap">Managed</span>
                        <span className="text-sm font-black text-[#1acec8]">{properties?.length || 0}</span>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 h-10 flex items-center">
                    <CardContent className="p-0 px-3 w-full flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-tighter font-bold text-gray-500 dark:text-neutral-200 whitespace-nowrap">Pending</span>
                        <span className="text-sm font-black text-amber-500">{applications?.filter(a => a.status === "Pending").length || 0}</span>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 h-10 flex items-center">
                    <CardContent className="p-0 px-3 w-full flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-tighter font-bold text-gray-500 dark:text-neutral-200 whitespace-nowrap">Approved</span>
                        <span className="text-sm font-black text-emerald-500">{applications?.filter(a => a.status === "Approved").length || 0}</span>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm dark:bg-zinc-700/50 dark:border dark:border-white/5 h-10 flex items-center">
                    <CardContent className="p-0 px-3 w-full flex items-center justify-between gap-2">
                        <span className="text-[9px] uppercase tracking-tighter font-bold text-gray-500 dark:text-neutral-200 whitespace-nowrap">Denied</span>
                        <span className="text-sm font-black text-rose-500">{applications?.filter(a => a.status === "Denied").length || 0}</span>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Applications Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                        <h2 className="text-xl font-bold uppercase tracking-tight">Incoming Applications</h2>
                    </div>

                    <div className="space-y-4">
                        {!applications || applications.length === 0 ? (
                            <Card className="border-border bg-muted/20 border-dashed py-10 flex flex-col items-center justify-center text-center">
                                <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground font-medium">No applications received yet.</p>
                            </Card>
                        ) : (
                            applications.map((app) => (
                                <Card key={app.id} className="border-border bg-card/40 hover:bg-card/60 transition-all group overflow-hidden">
                                    <CardContent className="p-0 flex flex-col sm:flex-row">
                                        <div className="w-full sm:w-48 h-full min-h-[160px] shrink-0 overflow-hidden relative border-b sm:border-b-0 sm:border-r border-border">
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
                                        <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
                                            <div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <h3 className="font-bold text-lg leading-tight group-hover:text-[#1acec8] transition-colors truncate">{app.property.name}</h3>
                                                    <span className="text-xs font-black text-[#1acec8] whitespace-nowrap">
                                                        ${app.property.pricePerMonth}/mo
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-xs text-muted-foreground mt-1 font-medium">
                                                    <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                                    <span className="truncate">{app.property.location.address}</span>
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applicant</div>
                                                        <div className="text-sm font-bold truncate flex items-center gap-1.5">
                                                            <User className="w-3 h-3 text-[#1acec8]" /> {app.name}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-medium truncate italic">{app.email}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</div>
                                                        <div className="text-sm font-bold flex items-center gap-1.5">
                                                            <Phone className="w-3 h-3 text-[#1acec8]" /> {app.phoneNumber}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground font-medium italic">
                                                            Applied {format(new Date(app.applicationDate), "MMM dd")}
                                                        </div>
                                                    </div>
                                                </div>

                                                {app.message && (
                                                    <div className="mt-3 p-2 bg-muted/40 rounded-lg text-[11px] italic text-muted-foreground line-clamp-1">
                                                        &ldquo;{app.message}&rdquo;
                                                    </div>
                                                )}
                                            </div>

                                            {app.status === "Pending" && (
                                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                                                    <Button
                                                        onClick={() => handleStatusUpdate(app.id, "Approved")}
                                                        disabled={isUpdating}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] h-8 shadow-sm"
                                                    >
                                                        APPROVE
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleStatusUpdate(app.id, "Denied")}
                                                        disabled={isUpdating}
                                                        className="flex-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-[10px] h-8 border border-rose-100 dark:border-rose-900/30"
                                                    >
                                                        REJECT
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions Sidebar */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold uppercase tracking-tight border-b border-border pb-2">Manager Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { label: "Add New Property", icon: PlusCircle, href: "/manager/properties", desc: "Create a new listing" },
                            { label: "My Properties", icon: Building, href: "/manager/properties", desc: "View managed homes" },
                            { label: "Earnings Overview", icon: DollarSign, href: "/manager/dashboard", desc: "Track rental income" },
                            { label: "Account Settings", icon: Settings, href: "/manager/settings", desc: "Update your profile" }
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
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
