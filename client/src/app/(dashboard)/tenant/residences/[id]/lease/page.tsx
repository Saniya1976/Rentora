"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetAuthUserQuery, useGetCurrentResidencesQuery } from "@/state/api";
import LoadingState from "@/components/LoadingState";
import { format } from "date-fns";
import {
    FileText,
    Download,
    ArrowLeft,
    CheckCircle,
    Building2,
    User,
    Calendar,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LeaseAgreementPage = () => {
    const { id: propertyId } = useParams();
    const router = useRouter();
    const { data: authUser } = useGetAuthUserQuery();
    const {
        data: residences,
        isLoading
    } = useGetCurrentResidencesQuery(authUser?.clerkId || "", {
        skip: !authUser?.clerkId
    });

    const property = residences?.find((r) => r.id === Number(propertyId));
    const lease = property?.leases?.[0];

    if (isLoading) return <LoadingState />;
    if (!property || !lease) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <FileText className="w-16 h-16 text-muted-foreground opacity-20" />
                <h2 className="text-2xl font-bold">Lease Not Found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 print:p-0">
            {/* Header / Actions */}
            <div className="flex items-center justify-between print:hidden">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    BACK TO DASHBOARD
                </Button>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="font-bold border-2 rounded-xl"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        DOWNLOAD PDF
                    </Button>
                    <Button
                        className="bg-[#1acec8] hover:bg-[#15b8b3] text-white font-bold rounded-xl px-6"
                    >
                        SIGNED & ACTIVE
                    </Button>
                </div>
            </div>

            {/* Document Body */}
            <Card className="border-none shadow-2xl rounded-none print:shadow-none">
                <CardContent className="p-12 md:p-16 space-y-12 bg-white text-zinc-800 font-serif leading-relaxed">

                    {/* Legal Header */}
                    <div className="flex flex-col items-center text-center space-y-4 border-b pb-10">
                        <div className="p-3 bg-zinc-100 rounded-2xl mb-2">
                            <ShieldCheck className="w-10 h-10 text-zinc-900" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase font-sans">
                            Residential Lease Agreement
                        </h1>
                        <p className="text-sm text-zinc-500 font-sans tracking-widest uppercase font-bold">
                            Document #RLA-{lease.id}-{property.id}
                        </p>
                    </div>

                    {/* Parties Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <h3 className="font-sans font-black text-xs uppercase tracking-widest text-[#1acec8] flex items-center gap-2">
                                <Building2 className="w-3 h-3" /> Landlord / Manager
                            </h3>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{property.manager.name}</p>
                                <p className="text-sm text-zinc-600 font-sans">Rentora Property Management</p>
                                <p className="text-sm text-zinc-600 font-sans">{property.location.address}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-sans font-black text-xs uppercase tracking-widest text-[#1acec8] flex items-center gap-2">
                                <User className="w-3 h-3" /> Tenant / Resident
                            </h3>
                            <div className="space-y-1">
                                <p className="font-bold text-lg">{authUser?.name || "Resident"}</p>
                                <p className="text-sm text-zinc-600 font-sans">{authUser?.email}</p>
                                <p className="text-sm text-zinc-600 font-sans">{authUser?.phoneNumber}</p>
                            </div>
                        </div>
                    </div>

                    {/* Property Details */}
                    <div className="bg-zinc-50 p-8 rounded-2xl border border-zinc-100 space-y-6">
                        <h3 className="font-sans font-black text-sm uppercase tracking-widest border-b pb-4">
                            1. Premises & Occupancy
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                            <div className="space-y-2">
                                <p className="font-bold">Property Address:</p>
                                <p className="text-zinc-600">{property.name}</p>
                                <p className="text-zinc-600">{property.location.address}, {property.location.city}, {property.location.state}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-bold">Premises Type:</p>
                                <p className="text-zinc-600">{property.propertyType} • {property.squareFeet} SqFt</p>
                                <p className="text-zinc-600">{property.beds} Bedrooms / {property.baths} Bathrooms</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial & Term Section */}
                    <div className="space-y-8">
                        <h3 className="font-sans font-black text-sm uppercase tracking-widest border-b pb-4">
                            2. Term, Rent & Deposits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Calendar className="w-4 h-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Lease Term</p>
                                </div>
                                <p className="text-sm font-bold">12 Months</p>
                                <p className="text-xs text-zinc-500">
                                    {format(new Date(lease.startDate), "MMM dd, yyyy")} — {format(new Date(lease.endDate), "MMM dd, yyyy")}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <Building2 className="w-4 h-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Monthly Rent</p>
                                </div>
                                <p className="text-sm font-bold text-[#1acec8]">₹{lease.rent.toLocaleString()}</p>
                                <p className="text-xs text-zinc-500">Due on the 1st of every month</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                                    <ShieldCheck className="w-4 h-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Security Deposit</p>
                                </div>
                                <p className="text-sm font-bold">₹{lease.deposit.toLocaleString()}</p>
                                <p className="text-xs text-zinc-500">Held by Management</p>
                            </div>
                        </div>
                    </div>

                    {/* Legal Clauses */}
                    <div className="space-y-6 text-sm text-zinc-600">
                        <h3 className="font-sans font-black text-sm uppercase tracking-widest border-b pb-4 text-zinc-800">
                            3. Standard Terms & Conditions
                        </h3>
                        <p>
                            <strong>Utilities:</strong> Unless otherwise specified, the Tenant is responsible for all utility payments including electricity, water, and internet services for the duration of the lease.
                        </p>
                        <p>
                            <strong>Maintenance:</strong> The Landlord shall be responsible for structural maintenance, while the Tenant is responsible for the general upkeep and cleanliness of the premises.
                        </p>
                        <p>
                            <strong>Default:</strong> Failure to pay rent for more than 15 days past the due date shall constitute a default of the lease agreement and may lead to eviction proceedings as per local laws.
                        </p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-16 border-t font-sans">
                        <div className="space-y-8">
                            <div className="h-16 flex items-end border-b-2 border-zinc-200 italic font-medium text-2xl text-zinc-400/50">
                                Digital Signature: {property.manager.name}
                            </div>
                            <div>
                                <p className="font-black text-[10px] uppercase tracking-widest text-[#1acec8]">Landlord / Agent</p>
                                <p className="font-bold">{property.manager.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Signed on {format(new Date(lease.startDate), "MMM dd, yyyy")}</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="h-16 flex items-end border-b-2 border-zinc-200 italic font-medium text-2xl text-blue-800/80">
                                {authUser?.name}
                            </div>
                            <div>
                                <p className="font-black text-[10px] uppercase tracking-widest text-[#1acec8]">Tenant</p>
                                <p className="font-bold">{authUser?.name}</p>
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-500 text-xs" />
                                    Verified via Clerk Digital Auth • {format(new Date(lease.startDate), "MMM dd, yyyy")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Watermarks */}
                    <div className="text-center pt-20 border-t border-zinc-50">
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.5em]">
                            Generated by Rentora Property Management System
                        </p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default LeaseAgreementPage;
