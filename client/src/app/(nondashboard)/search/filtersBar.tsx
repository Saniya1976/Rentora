import {
  FiltersState,
  setFilters,
  setViewMode,
  toggleFiltersFullOpen,
} from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";

const FiltersBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [searchInput, setSearchInput] = useState(filters.location);
  const [isGeocoding, setIsGeocoding] = useState(false);

  React.useEffect(() => {
    setSearchInput(filters.location);
  }, [filters.location]);

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const currentArrayRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : (value.map(Number) as [number, number]);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  const handleLocationSearch = async () => {
    if (!searchInput.trim()) {
      const newFilters = {
        ...filters,
        location: "",
        coordinates: [0, 0] as [number, number],
      };
      dispatch(setFilters(newFilters));
      updateURL(newFilters);
      return;
    }

    setIsGeocoding(true);
    try {
      // Using Nominatim (OpenStreetMap) restricted to wider NCR area
      const viewbox = "76.0,29.5,78.5,27.5";
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchInput
        )}+Delhi+NCR&format=json&limit=1&bounded=1&viewbox=${viewbox}`,
        {
          headers: {
            "User-Agent": "RentoraApp/1.0",
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newFilters = {
          ...filters,
          location: searchInput,
          coordinates: [Number(lon), Number(lat)] as [number, number],
        };
        dispatch(setFilters(newFilters));
        updateURL(newFilters);
      } else {
        // Fallback search without Delhi suffix if no results
        const fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchInput
          )}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "RentoraApp/1.0",
            },
          }
        );
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          const { lat, lon } = fallbackData[0];
          const newFilters = {
            ...filters,
            location: searchInput,
            coordinates: [Number(lon), Number(lat)] as [number, number],
          };
          dispatch(setFilters(newFilters));
          updateURL(newFilters);
        }
      }
    } catch (err) {
      console.error("Error searching location:", err);
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className="flex justify-between items-center w-full py-5 transition-colors duration-300 border-b border-border relative z-40">
      {/* Filters */}
      <div className="flex items-center gap-4 p-2">
        {/* All Filters */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary hover:bg-primary/10 transition-all font-semibold h-11 px-4",
            isFiltersFullOpen && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="w-4 h-4" />
          <span>All Filters</span>
        </Button>

        {/* Search Location */}
        <div className="flex items-center shadow-sm rounded-xl overflow-hidden">
          <Input
            placeholder="Search location..."
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (!val.trim()) {
                const newFilters = {
                  ...filters,
                  location: "",
                  coordinates: [0, 0] as [number, number],
                };
                dispatch(setFilters(newFilters));
                updateURL(newFilters);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLocationSearch();
              }
            }}
            className="w-64 h-11 rounded-l-xl rounded-r-none border-primary border-r-0 bg-background text-foreground text-sm focus-visible:ring-primary/20"
          />
          <Button
            onClick={handleLocationSearch}
            disabled={isGeocoding}
            className={`rounded-r-xl rounded-l-none border-l-none border-primary shadow-none 
              border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-11 w-12 flex items-center justify-center p-0`}
          >
            {isGeocoding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Price Range */}
        <div className="flex gap-1">
          {/* Minimum Price Selector */}
          <Select
            value={filters.priceRange[0]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="w-32 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
              <SelectValue>
                {formatPriceValue(filters.priceRange[0], true)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border-border z-[9999]">
              <SelectItem value="any">Min Price</SelectItem>
              {[10000, 20000, 30000, 50000, 75000, 100000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  ₹{(price / 1000).toFixed(0)}k+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Maximum Price Selector */}
          <Select
            value={filters.priceRange[1]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="w-32 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1], false)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border-border z-[9999]">
              <SelectItem value="any">Max Price</SelectItem>
              {[20000, 30000, 50000, 75000, 100000, 150000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  &lt; ₹{(price / 1000).toFixed(0)}k
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Beds and Baths */}
        <div className="flex gap-1">
          {/* Beds */}
          <Select
            value={filters.beds}
            onValueChange={(value) => handleFilterChange("beds", value, null)}
          >
            <SelectTrigger className="w-28 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border-border z-[9999]">
              <SelectItem value="any">Any Beds</SelectItem>
              <SelectItem value="1">1+ bed</SelectItem>
              <SelectItem value="2">2+ beds</SelectItem>
              <SelectItem value="3">3+ beds</SelectItem>
              <SelectItem value="4">4+ beds</SelectItem>
            </SelectContent>
          </Select>

          {/* Baths */}
          <Select
            value={filters.baths}
            onValueChange={(value) => handleFilterChange("baths", value, null)}
          >
            <SelectTrigger className="w-28 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
              <SelectValue placeholder="Baths" />
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border-border z-[9999]">
              <SelectItem value="any">Any Baths</SelectItem>
              <SelectItem value="1">1+ bath</SelectItem>
              <SelectItem value="2">2+ baths</SelectItem>
              <SelectItem value="3">3+ baths</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <Select
          value={filters.propertyType || "any"}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value, null)
          }
        >
          <SelectTrigger className="w-40 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
            <SelectValue placeholder="Home Type" />
          </SelectTrigger>
          <SelectContent className="bg-card text-card-foreground border-border z-[9999]">
            <SelectItem value="any">Any Type</SelectItem>
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <SelectItem key={type} value={type}>
                <div className="flex items-center group">
                  <Icon className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                  <span className="group-hover:text-primary transition-colors text-sm">{type}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View Mode */}
      <div className="flex items-center gap-4">
        <div className="flex border border-border rounded-xl overflow-hidden shadow-sm bg-background">
          <Button
            variant="ghost"
            title="List View"
            className={cn(
              "h-11 w-12 p-0 rounded-none hover:bg-primary/10 text-muted-foreground transition-all duration-300",
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
              "h-11 w-12 p-0 rounded-none hover:bg-primary/10 text-muted-foreground transition-all duration-300",
              viewMode === "grid" ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
            )}
            onClick={() => dispatch(setViewMode("grid"))}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;