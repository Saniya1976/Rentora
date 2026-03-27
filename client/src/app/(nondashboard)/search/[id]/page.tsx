"use client";

import { useGetPropertyQuery } from "@/state/api";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import ImagePreviews from "./ImagePreviews";
import PropertyOverview from "./PropertyOverview";
import PropertyDetails from "./PropertyDetails";
import PropertyLocation from "./PropertyLocation";
import ContactWidget from "./ContactWidget";
import ApplicationModal from "./ApplicationModal";

const PropertyPage = () => {
    const { id } = useParams();
    const propertyId = Number(id);
    const {
        data: property,
        isError,
        isLoading,
    } = useGetPropertyQuery(propertyId);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (isLoading) return <>Loading...</>;
    if (isError || !property) {
        return <>Property not Found</>;
    }

    return (
        <div className="max-w-7xl mx-auto px-5 py-10 transition-colors duration-300">
            {/* Upper Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <ImagePreviews images={property.photoUrls} />
                    <PropertyOverview propertyId={propertyId} />
                    <PropertyDetails propertyId={propertyId} />
                    <PropertyLocation propertyId={propertyId} />

                    {/* Reviews Placeholder as requested */}
                    <div className="py-16 border-t border-border">
                        <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-5">
                            Guest Reviews
                        </h3>
                        <div className="bg-muted p-8 rounded-xl text-center text-muted-foreground">
                            Reviews feature is coming soon! This property currently has {property.numberOfReviews} reviews with an average rating of {property.averageRating.toFixed(1)}.
                        </div>
                    </div>
                </div>

                {/* Sidebar / Contact Widget */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <ContactWidget onOpenModal={() => setIsModalOpen(true)} />
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            <ApplicationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                propertyId={propertyId}
            />
        </div>
    );
};

export default PropertyPage;
