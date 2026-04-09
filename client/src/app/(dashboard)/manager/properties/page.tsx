"use client";

import React, { useState } from "react";
import { useGetManagerPropertiesQuery, useGetAuthUserQuery } from "@/state/api";
import { MapPin, Home, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/LoadingState";
import PropertyModal from "@/components/PropertyModal";

const ManagerPropertiesPage = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);

    const {
        data: properties,
        isLoading,
        isError,
    } = useGetManagerPropertiesQuery(authUser?.clerkInfo.id || "", {
        skip: !authUser?.clerkInfo.id,
    });

    const handleAddProperty = () => {
        setSelectedProperty(null);
        setIsModalOpen(true);
    };

    const handleEditProperty = (property: any) => {
        setSelectedProperty(property);
        setIsModalOpen(true);
    };

    if (isLoading) return <LoadingState />;

    if (isError) {
        return (
            <div className="text-red-500 p-8 text-center bg-red-50 rounded-xl">
                Failed to load properties. Please try again later.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-2 w-full transition-all duration-500">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black bg-linear-to-r from-[#07c2c5] to-[#04a7aa] bg-clip-text text-transparent uppercase tracking-tight leading-[1.1]">
                        Managed <span className="text-foreground/90 font-black">Properties</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium italic pl-1">
                        Manage your property listings and their details.
                    </p>
                </div>
                <Button
                    onClick={handleAddProperty}
                    className="bg-[#1acec8] hover:bg-[#14b2ad] text-white font-bold px-6 py-6 rounded-2xl shadow-[0_4px_15px_rgba(26,206,200,0.3)] transition-all active:scale-[0.98] flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> ADD PROPERTY
                </Button>
            </div>

            {!properties || properties.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border animate-in fade-in zoom-in duration-500">
                    <div className="p-4 bg-muted rounded-full mb-4">
                        <Home className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">No properties found</h2>
                    <p className="text-muted-foreground">You haven't added any properties to manage yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                        <Card key={property.id} className="overflow-hidden border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300 group rounded-3xl">
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={property.photoUrls[0] || "/placeholder.jpg"}
                                    alt={property.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4">
                                    <div className="bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                                        {property.propertyType}
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-foreground group-hover:text-[#1acec8] transition-colors truncate">
                                        {property.name}
                                    </h2>
                                    <div className="flex items-center text-muted-foreground text-sm font-medium">
                                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                                        <span className="truncate">{property.location.address}, {property.location.city}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 py-4 border-y border-border/50">
                                    <div className="flex flex-col items-center">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Beds</div>
                                        <div className="font-bold text-foreground">{property.beds}</div>
                                    </div>
                                    <div className="flex flex-col items-center border-x border-border/50">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Baths</div>
                                        <div className="font-bold text-foreground">{property.baths}</div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">SqFt</div>
                                        <div className="font-bold text-foreground">{property.squareFeet}</div>
                                    </div>
                                </div>

                                <div className="flex items-end justify-between pt-1">
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monthly Rent</div>
                                        <div className="text-2xl font-black text-[#1acec8]">₹{property.pricePerMonth.toLocaleString()}</div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEditProperty(property)}
                                        className="rounded-xl font-bold text-xs uppercase hover:bg-muted transition-colors px-4 border-border"
                                    >
                                        EDIT
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <PropertyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                property={selectedProperty}
                managerClerkId={authUser?.clerkInfo.id || ""}
            />
        </div>
    );
};

export default ManagerPropertiesPage;
