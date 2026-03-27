"use client";

import React, { useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useGetPropertyQuery } from "@/state/api";

// Fix for default Leaflet marker icons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 14);
    }, [center, map]);
    return null;
};

const PropertyLocationLeaflet = ({ propertyId }: PropertyDetailsProps) => {
    const { data: property, isLoading, isError } = useGetPropertyQuery(propertyId);

    const center = useMemo<[number, number] | null>(() => {
        if (property?.location?.coordinates) {
            return [
                property.location.coordinates.latitude,
                property.location.coordinates.longitude,
            ];
        }
        return null;
    }, [property]);

    if (isLoading) return <>Loading map...</>;
    if (isError || !property || !center) return <>Property location not found</>;

    return (
        <div className="relative mt-4 h-[300px] rounded-lg overflow-hidden border border-border">
            <MapContainer
                center={center}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full dark:invert-[0.85] dark:hue-rotate-180 dark:brightness-[1] dark:contrast-[0.9]"
            >
                <ChangeView center={center} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={center} />
            </MapContainer>
        </div>
    );
};

export default PropertyLocationLeaflet;
