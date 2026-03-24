"use client";

import React, { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Property } from "@/types/prismaTypes";

const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

const Map = () => {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
      // Fix for default Leaflet marker icons
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
  }, []);
  const filters = useAppSelector((state: any) => state.global.filters);
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  const center = useMemo(() => {
    if (filters.coordinates && filters.coordinates.length === 2) {
      // Leaflet expects [latitude, longitude]
      return [filters.coordinates[1], filters.coordinates[0]] as [number, number];
    }
    return [28.6139, 77.209] as [number, number]; // Delhi, India default
  }, [filters.coordinates]);

  if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (isError || !properties) return <div className="flex items-center justify-center h-full">Failed to fetch properties</div>;

  return (
    <div className="basis-5/12 grow relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
      <MapContainer
        center={center}
        zoom={9}
        scrollWheelZoom={true}
        className="h-full w-full"
        maxBounds={[
          [27.5, 76.0], // Southwestern NCR including parts of Rajasthan/Haryana
          [29.5, 78.5], // Northeastern NCR including parts of Uttar Pradesh
        ]}
        minZoom={8}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
                <div className="h-24 w-full bg-slate-100 dark:bg-zinc-800 rounded-md mb-2 overflow-hidden">
                  {property.photoUrls && property.photoUrls.length > 0 ? (
                    <img src={property.photoUrls[0]} alt={property.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                </div>
                <h4 className="font-bold text-sm mb-1 truncate">
                  <a href={`/search/${property.id}`} className="hover:text-[#1acec8] transition-colors">
                    {property.name}
                  </a>
                </h4>
                <p className="text-xs text-slate-500 mb-2">
                  {property.location.city}, {property.location.state}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1acec8]">
                    ${property.pricePerMonth.toLocaleString()}/mo
                  </span>
                  <span className="text-[10px] text-slate-400">
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

export default Map;