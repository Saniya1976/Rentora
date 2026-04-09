"use client";

import React from "react";
import { useGetApplicationsQuery, useGetAuthUserQuery } from "@/state/api";
import { format } from "date-fns";
import { FileText, MapPin, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ApplicationsPage = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const {
        data: applications,
        isLoading,
        isError,
    } = useGetApplicationsQuery({
        userId: authUser?.clerkInfo.id,
        userType: "tenant",
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
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
            case "Approved":
                return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200";
            case "Denied":
                return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200";
            default: // Pending
                return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
        }
    };

    return (
        <div className="flex flex-col gap-8 p-2 w-full transition-all duration-500">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black bg-linear-to-r from-[#07c2c5] to-[#04a7aa] bg-clip-text text-transparent uppercase tracking-tight leading-[1.1]">
                        Your <span className="text-foreground/90 font-black">Applications</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium italic pl-1">
                        Keep track of your rental applications and their current status.
                    </p>
                </div>
            </div>

            {!applications || applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border animate-in fade-in zoom-in duration-500 max-w-4xl">
                    <div className="p-3 bg-muted rounded-full mb-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-bold text-foreground">No applications found</h2>
                    <p className="text-muted-foreground text-sm">You haven't applied to any properties yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all">
                    {applications.map((app) => (
                        <Card key={app.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 group">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                            {app.property.name}
                                        </h2>
                                        <div className="flex items-center text-muted-foreground text-xs font-medium">
                                            <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                            <span className="line-clamp-1">{app.property.location.city}, {app.property.location.state}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`${getStatusColor(app.status)} px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0 border`}>
                                        {app.status}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                            <Calendar className="w-3 h-3 mr-1" /> Applied
                                        </div>
                                        <div className="font-semibold text-sm text-foreground">
                                            {format(new Date(app.applicationDate), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                            Rent
                                        </div>
                                        <div className="font-bold text-sm text-primary">
                                            ₹{app.property.pricePerMonth.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {app.message && (
                                    <div className="p-3 bg-muted/40 rounded-lg text-xs italic text-muted-foreground line-clamp-2">
                                        &ldquo;{app.message}&rdquo;
                                    </div>
                                )}

                                <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <span>ID: #{app.id}</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {app.status === "Pending" ? "Pending Review" : "Processed"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ApplicationsPage;
