"use client";

import React from "react";
import { useGetApplicationsQuery, useGetAuthUserQuery, useUpdateApplicationStatusMutation } from "@/state/api";
import { format } from "date-fns";
import { FileText, MapPin, Calendar, User, Phone, Mail, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ManagerDashboard = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const {
        data: applications,
        isLoading,
        isError,
    } = useGetApplicationsQuery({
        userId: authUser?.clerkInfo.id,
        userType: "manager",
    });

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
                        Manager <span className="text-foreground/90 font-black">Dashboard</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium italic pl-1">
                        Overview of your properties and incoming applications.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border bg-card/40 shadow-sm">
                    <CardHeader className="pb-1 p-4">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-black text-[#1acec8]">{applications?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 shadow-sm">
                    <CardHeader className="pb-1 p-4">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pending</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-black text-amber-500">
                            {applications?.filter(a => a.status === "Pending").length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 shadow-sm">
                    <CardHeader className="pb-1 p-4">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Approved</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-black text-emerald-500">
                            {applications?.filter(a => a.status === "Approved").length || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border bg-card/40 shadow-sm">
                    <CardHeader className="pb-1 p-4">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-black text-rose-500">
                            {applications?.filter(a => a.status === "Denied").length || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4 mt-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">Recent Applications</h2>
                </div>

                {!applications || applications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-3xl border-2 border-dashed border-border animate-in fade-in zoom-in duration-500 max-w-4xl">
                        <div className="p-3 bg-muted rounded-full mb-3">
                            <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No applications yet</h3>
                        <p className="text-muted-foreground text-sm">Applications for your properties will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {applications.map((app) => (
                            <Card key={app.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="flex-1 p-6 md:p-8 space-y-4">
                                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center text-[#1acec8] text-[10px] font-black uppercase tracking-widest">
                                                        Incoming for
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-foreground line-clamp-1">
                                                        {app.property.name}
                                                    </h3>
                                                    <div className="flex items-center text-muted-foreground text-sm">
                                                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                                                        <span className="line-clamp-1">{app.property.location.address}, {app.property.location.city}</span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={`${getStatusColor(app.status)} px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-widest shrink-0`}>
                                                    {app.status}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                                                <div className="space-y-2.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Applicant</div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                                            <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                            {app.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Mail className="w-3.5 h-3.5" />
                                                            {app.email}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {app.phoneNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2.5">
                                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Submission Info</div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            Applied on {format(new Date(app.applicationDate), "MMM dd, yyyy")}
                                                        </div>
                                                        <div className="mt-1 p-2.5 bg-muted/40 rounded-lg text-xs italic text-muted-foreground line-clamp-2">
                                                            &ldquo;{app.message || "No message provided."}&rdquo;
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {app.status === "Pending" && (
                                            <div className="lg:w-40 bg-muted/10 border-t lg:border-t-0 lg:border-l border-border p-4 flex flex-col justify-center gap-2">
                                                <Button
                                                    onClick={() => handleStatusUpdate(app.id, "Approved")}
                                                    disabled={isUpdating}
                                                    size="sm"
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 shadow-sm"
                                                >
                                                    APPROVE
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleStatusUpdate(app.id, "Denied")}
                                                    disabled={isUpdating}
                                                    size="sm"
                                                    className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold h-9"
                                                >
                                                    REJECT
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
