"use client";

import React, { useMemo, useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";

// Fix default Leaflet icon paths (must run once, client-side only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Red icon for the searched location marker
const searchMarkerIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// This component lives INSIDE MapContainer so useMap() always works
const ChangeView = ({
    center,
    zoom,
}: {
    center: [number, number];
    zoom: number;
}) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.2 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center[0], center[1], zoom]);
    return null;
};

const MapLeaflet = () => {
    const filters = useAppSelector((state: any) => state.global.filters);
    const { data: properties, isLoading, isError } = useGetPropertiesQuery(filters);

    const isSearching =
        filters.coordinates &&
        (filters.coordinates[0] !== 0 || filters.coordinates[1] !== 0);

    const center = useMemo<[number, number]>(() => {
        if (isSearching) {
            // Leaflet uses [lat, lng]; coordinates are stored as [lng, lat]
            return [filters.coordinates[1], filters.coordinates[0]];
        }
        return [28.6139, 77.209]; // Default: Delhi
    }, [filters.coordinates]);

    const zoom = isSearching ? 13 : 9;

    if (isLoading)
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading map...
            </div>
        );
    if (isError || !properties)
        return (
            <div className="flex items-center justify-center h-full text-destructive">
                Failed to fetch properties
            </div>
        );

    return (
        <div className="basis-5/12 grow relative rounded-xl overflow-hidden border border-border shadow-sm transition-colors duration-300">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full dark:invert-[0.85] dark:hue-rotate-180 dark:brightness-[1] dark:contrast-[0.9]"
                maxBounds={[
                    [27.5, 76.0],
                    [29.5, 78.5],
                ]}
                minZoom={8}
            >
                {/* ChangeView is inside MapContainer so useMap() context is guaranteed */}
                <ChangeView center={center} zoom={zoom} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {isSearching && (
                    <Marker position={center} icon={searchMarkerIcon}>
                        <Popup>
                            <div className="p-2 font-bold text-center">Searched Location</div>
                        </Popup>
                    </Marker>
                )}

                {properties.map((property) => (
                    <Marker
                        key={property.id}
                        position={[
                            property.location.coordinates.latitude,
                            property.location.coordinates.longitude,
                        ]}
                    >
                        <Popup>
                            <div className="p-1 min-w-[200px]">
                                <div className="h-24 w-full bg-gray-100 rounded-md mb-2 overflow-hidden">
                                    {property.photoUrls && property.photoUrls.length > 0 ? (
                                        <img
                                            src={property.photoUrls[0]}
                                            alt={property.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-bold text-sm mb-1 truncate">
                                    <a
                                        href={`/search/${property.id}`}
                                        className="hover:text-blue-600 transition-colors"
                                    >
                                        {property.name}
                                    </a>
                                </h4>
                                <p className="text-xs text-gray-500 mb-2">
                                    {property.location.city}, {property.location.state}
                                </p>
                                <div className="flex justify-between items-center border-t pt-2 mt-1">
                                    <span className="font-bold text-blue-600">
                                        ₹{property.pricePerMonth.toLocaleString()}/mo
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {property.beds}bd | {property.baths}ba
                                    </span>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapLeaflet;
