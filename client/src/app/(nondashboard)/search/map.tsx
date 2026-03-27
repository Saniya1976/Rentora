import dynamic from "next/dynamic";

// Dynamically import the inner map (which uses leaflet) with SSR disabled.
// All react-leaflet components and useMap() are inside _mapLeaflet.tsx where
// they run as regular imports — this is the correct Next.js + Leaflet pattern.
const Map = dynamic(() => import("./_mapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="basis-5/12 grow flex items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground text-sm">
      Loading map...
    </div>
  ),
});

export default Map;
