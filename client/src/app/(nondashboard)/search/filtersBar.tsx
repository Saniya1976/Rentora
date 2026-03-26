"use client";

import { useAppDispatch, useAppSelector } from "@/state/redux";
import { FiltersState, setFilters, toggleFiltersFullOpen } from "@/state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid, List, Search } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { cleanParams } from "@/lib/utils";
import { PropertyTypeIcons } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { setViewMode } from "@/state";

const FiltersBar = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );
  const viewMode = useAppSelector((state) => state.global.viewMode);

  const [searchInput, setSearchInput] = useState(filters.location || "");
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    setSearchInput(filters.location || "");
  }, [filters.location]);

  const updateURL = useCallback(
    (newFilters: FiltersState) => {
      const filtersToClean: Partial<FiltersState> = { ...newFilters };
      if (
        newFilters.coordinates?.[0] === 0 &&
        newFilters.coordinates?.[1] === 0
      ) {
        delete filtersToClean.coordinates;
      }
      const updatedParams = cleanParams(filtersToClean as Record<string, unknown>);

      const queryString = new URLSearchParams(updatedParams).toString();
      window.history.replaceState(null, "", `?${queryString}`);
    },
    []
  );

  const handleFilterChange = useCallback(
    (key: keyof FiltersState, value: string, isMinMax: boolean | null = null) => {
      const newFilters: FiltersState = { ...filters };

      if (key === "priceRange" || key === "squareFeet") {
        const currentRange = newFilters[key] || [null, null];
        const parsedValue = value === "any" ? null : Number(value);

        if (isMinMax === true) {
          (newFilters[key] as [number | null, number | null]) = [parsedValue, currentRange[1]];
        } else if (isMinMax === false) {
          (newFilters[key] as [number | null, number | null]) = [currentRange[0], parsedValue];
        }
      } else if (key === "beds" || key === "baths" || key === "propertyType") {
        (newFilters[key] as string) = value === "any" ? "any" : value;
      } else {
        (newFilters as unknown as Record<string, unknown>)[key] = value;
      }

      dispatch(setFilters(newFilters));
      updateURL(newFilters);
    },
    [filters, dispatch, updateURL]
  );

  const formatPriceValue = (value: number | null, isMin: boolean): string => {
    if (value === null) {
      return isMin ? "Min Price" : "Max Price";
    }
    const amount = `₹${(value / 1000).toFixed(0)}k`;
    return isMin ? `${amount}+` : `< ${amount}`;
  };

  const handleLocationSearch = useCallback(async () => {
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
      const viewbox = "76.0,29.5,78.5,27.5"; // Wider Delhi NCR area
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
        // Fallback search without Delhi suffix
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
        } else {
          console.warn("Location not found:", searchInput);
          // Optionally, clear location or show an error
          const newFilters = {
            ...filters,
            location: searchInput,
            coordinates: [0, 0] as [number, number], // Reset coordinates if not found
          };
          dispatch(setFilters(newFilters));
          updateURL(newFilters);
        }
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      // Optionally, handle error state
    } finally {
      setIsGeocoding(false);
    }
  }, [searchInput, filters, dispatch, updateURL]);

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
            className="rounded-r-xl rounded-l-none border-l-0 border-primary shadow-none 
              border bg-primary text-primary-foreground hover:bg-primary/90 transition-colors h-11 w-12 flex items-center justify-center p-0"
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
            value={filters.priceRange[0]?.toString() ?? "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
          >
            <SelectTrigger className="w-32 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
              <SelectValue>
                {formatPriceValue(filters.priceRange[0] ?? null, true)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border-border z-9999">
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
            value={filters.priceRange[1]?.toString() ?? "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
          >
            <SelectTrigger className="w-32 h-11 rounded-xl border-primary bg-background text-foreground font-medium">
              <SelectValue>
                {formatPriceValue(filters.priceRange[1] ?? null, false)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-card text-card-foreground border-border z-9999">
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
            <SelectContent className="bg-card text-card-foreground border-border z-9999">
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
            <SelectContent className="bg-card text-card-foreground border-border z-9999">
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
          <SelectContent className="bg-card text-card-foreground border-border z-9999">
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
            onClick={() => dispatch(setViewMode("grid"))}
            className={`rounded-none px-3 h-11 transition-all ${viewMode === "grid"
              ? "bg-primary text-primary-foreground font-bold shadow-inner"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => dispatch(setViewMode("list"))}
            className={`rounded-none px-3 h-11 transition-all ${viewMode === "list"
              ? "bg-primary text-primary-foreground font-bold shadow-inner"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;