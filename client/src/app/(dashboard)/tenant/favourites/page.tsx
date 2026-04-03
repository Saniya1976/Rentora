"use client";

import React from 'react';
import { useGetAuthUserQuery, useGetTenantQuery, useRemoveFavoritePropertyMutation } from '@/state/api';
import CardCompact from '@/components/CardCompact';
import Card from '@/components/Card';
import { Property } from '@/types/prismaTypes';
import { useAppDispatch, useAppSelector } from '@/state/redux';
import { setViewMode } from '@/state';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Favourites = () => {
    const dispatch = useAppDispatch();
    const { data: authUser } = useGetAuthUserQuery();
    const { data: tenant, isLoading, isError } = useGetTenantQuery(
        authUser?.clerkInfo?.id || "",
        {
            skip: !authUser?.clerkInfo?.id,
        }
    );
    const [removeFavorite] = useRemoveFavoritePropertyMutation();
    const viewMode = useAppSelector((state) => state.global.viewMode);

    const handleRemoveFavorite = async (propertyId: number) => {
        if (!authUser?.clerkInfo?.id) return;
        await removeFavorite({
            clerkId: authUser.clerkInfo.id,
            propertyId,
        });
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Loading your favorites...</div>;
    if (isError) return <div className="p-8 text-center text-destructive font-bold bg-destructive/10 rounded-xl border border-destructive/20">Failed to load favorites. Please try again.</div>;

    const favorites = tenant?.favorites || [];

    return (
        <div className="flex flex-col gap-8 p-2 w-full transition-all duration-500">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-5xl font-black bg-linear-to-r from-[#07c2c5] to-[#04a7aa] bg-clip-text text-transparent uppercase tracking-tight leading-[1.1]">
                        Shortlisted <span className="text-foreground/90 font-black">Homes</span>
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium italic pl-1">
                        Keep track of the spaces you love.
                    </p>
                </div>

                {/* View Switcher */}
                <div className="flex border border-border rounded-xl overflow-hidden shadow-sm bg-background mb-1">
                    <Button
                        variant="ghost"
                        title="List View"
                        className={cn(
                            "h-10 w-11 p-0 rounded-none hover:bg-primary/10 text-muted-foreground transition-all",
                            viewMode === "list" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                        )}
                        onClick={() => dispatch(setViewMode("list"))}
                    >
                        <List className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        title="Grid View"
                        className={cn(
                            "h-10 w-11 p-0 rounded-none hover:bg-primary/10 text-muted-foreground transition-all",
                            viewMode === "grid" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                        )}
                        onClick={() => dispatch(setViewMode("grid"))}
                    >
                        <Grid className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {favorites.length > 0 ? (
                <div className={cn(
                    "mt-4",
                    viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4 max-w-5xl"
                )}>
                    {favorites.map((property: Property) => (
                        viewMode === "grid" ? (
                            <Card
                                key={property.id}
                                property={property}
                                isFavorite={true}
                                onFavoriteToggle={() => handleRemoveFavorite(property.id)}
                                propertyLink={`/search/${property.id}`}
                            />
                        ) : (
                            <CardCompact
                                key={property.id}
                                property={property}
                                isFavorite={true}
                                onFavoriteToggle={() => handleRemoveFavorite(property.id)}
                                propertyLink={`/search/${property.id}`}
                            />
                        )
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 px-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-[32px] border border-dashed border-border transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/50 max-w-4xl">
                    <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center mb-6">
                        <span className="text-3xl">❤️</span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">No favorites yet</h3>
                    <p className="text-muted-foreground text-center max-w-sm leading-relaxed mb-8">
                        Browse our curated rentals in Delhi NCR and tap the heart icon to save your top picks here.
                    </p>
                    <a
                        href="/search"
                        className="px-10 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/20 active:scale-95"
                    >
                        Start Searching
                    </a>
                </div>
            )}
        </div>
    )
}

export default Favourites;
