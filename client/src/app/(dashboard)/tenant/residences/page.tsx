"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import LoadingState from "@/components/LoadingState";
import {
    useGetAuthUserQuery,
    useGetCurrentResidencesQuery,
    useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Residences = () => {
    const { data: authUser } = useGetAuthUserQuery();
    const { data: tenant } = useGetTenantQuery(
        authUser?.clerkId || "",
        {
            skip: !authUser?.clerkId,
        }
    );

    const {
        data: currentResidences,
        isLoading,
        error,
    } = useGetCurrentResidencesQuery(authUser?.clerkId || "", {
        skip: !authUser?.clerkId,
    });

    if (isLoading) return <LoadingState />;
    if (error) return <div>Error loading current residences</div>;

    return (
        <div className="dashboard-container">
            <Header
                title="Current Residences"
                subtitle="View and manage your current living spaces"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentResidences?.map((property) => (
                    <Card
                        key={property.id}
                        property={property}
                        isFavorite={tenant?.favorites?.some((fav) => fav.id === property.id) || false}
                        onFavoriteToggle={() => { }}
                        showFavoriteButton={false}
                        propertyLink={`/tenant/residences/${property.id}`}
                    />
                ))}
            </div>
            {(!currentResidences || currentResidences.length === 0) && (
                <p>You don&lsquo;t have any current residences</p>
            )}
        </div>
    );
};

export default Residences;