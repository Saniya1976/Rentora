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

const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = (require("react-leaflet") as any).useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

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
    if (filters.coordinates && filters.coordinates.length === 2 && (filters.coordinates[0] !== 0 || filters.coordinates[1] !== 0)) {
      // Leaflet expects [latitude, longitude]
      return [filters.coordinates[1], filters.coordinates[0]] as [number, number];
    }
    return [28.6139, 77.209] as [number, number]; // Delhi, India default
  }, [filters.coordinates]);

  const searchMarkerIcon = useMemo(() => {
    if (!L) return null;
    return new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, [L]);

  if (isLoading) return <div className="flex items-center justify-center h-full">Loading...</div>;
  if (isError || !properties) return <div className="flex items-center justify-center h-full">Failed to fetch properties</div>;

  const isSearching = filters.coordinates && (filters.coordinates[0] !== 0 || filters.coordinates[1] !== 0);

  return (
    <div className="basis-5/12 grow relative rounded-xl overflow-hidden border border-border shadow-sm transition-colors duration-300">
      <MapContainer
        center={center}
        zoom={9}
        scrollWheelZoom={true}
        className="h-full w-full dark:invert-[0.85] dark:hue-rotate-180 dark:brightness-[1] dark:contrast-[0.9]"
        maxBounds={[
          [27.5, 76.0], // Southwestern NCR
          [29.5, 78.5], // Northeastern NCR
        ]}
        minZoom={8}
      >
        <ChangeView center={center} zoom={isSearching ? 13 : 9} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isSearching && searchMarkerIcon && (
          <Marker position={center} icon={searchMarkerIcon}>
            <Popup>
              <div className="p-2 font-bold text-center text-foreground bg-background">Searched Location</div>
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
              <div className="p-1 min-w-[200px] bg-background text-foreground">
                <div className="h-24 w-full bg-muted rounded-md mb-2 overflow-hidden border border-border">
                  {property.photoUrls && property.photoUrls.length > 0 ? (
                    <img src={property.photoUrls[0]} alt={property.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">No Image</div>
                  )}
                </div>
                <h4 className="font-bold text-sm mb-1 truncate">
                  <a href={`/search/${property.id}`} className="hover:text-primary transition-colors">
                    {property.name}
                  </a>
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {property.location.city}, {property.location.state}
                </p>
                <div className="flex justify-between items-center border-t border-border pt-2 mt-1">
                  <span className="font-bold text-primary">
                    ₹{property.pricePerMonth.toLocaleString()}/mo
                  </span>
                  <span className="text-[10px] text-muted-foreground">
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