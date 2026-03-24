import { FiltersState, initialState, setFilters } from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn, formatEnumString } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { AmenityEnum, AmenityIcons, PropertyTypeEnum, PropertyTypeIcons } from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const FiltersFull = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const filters = useAppSelector((state) => state.global.filters);
    const [localFilters, setLocalFilters] = useState(initialState.filters);
    const isFiltersFullOpen = useAppSelector(
        (state) => state.global.isFiltersFullOpen
    );

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

    const handleSubmit = () => {
        dispatch(setFilters(localFilters));
        updateURL(localFilters);
    };

    const handleReset = () => {
        setLocalFilters(initialState.filters);
        dispatch(setFilters(initialState.filters));
        updateURL(initialState.filters);
    };

    const handleAmenityChange = (amenity: AmenityEnum) => {
        setLocalFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleLocationSearch = async () => {
        try {
            const viewbox = "76.0,29.5,78.5,27.5"; // Wider Delhi NCR area
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    localFilters.location
                )}+Delhi+NCR&format=json&limit=1&bounded=1&viewbox=${viewbox}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setLocalFilters((prev) => ({
                    ...prev,
                    coordinates: [Number(lon), Number(lat)] as [number, number],
                }));
            }
        } catch (err) {
            console.error("Error searching location:", err);
        }
    };

    if (!isFiltersFullOpen) return null;

    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl px-4 h-full overflow-auto pb-10 transition-colors duration-300">
            <div className="flex flex-col space-y-6 py-4">
                {/* Location */}
                <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Location</h4>
                    <div className="flex items-center">
                        <Input
                            placeholder="Enter location"
                            value={localFilters.location}
                            onChange={(e) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                }))
                            }
                            className="rounded-l-xl rounded-r-none border-r-0 dark:bg-zinc-700 dark:text-white dark:border-white/10"
                        />
                        <Button
                            onClick={handleLocationSearch}
                            className="rounded-r-xl rounded-l-none border-l-none bg-primary-700 hover:bg-primary-800 text-white shadow-none border-none h-10 w-12 flex items-center justify-center p-0"
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Property Type */}
                <div>
                    <h4 className="font-bold mb-3 text-gray-900 dark:text-gray-100">Property Type</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <div
                                key={type}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200",
                                    localFilters.propertyType === type
                                        ? "border-primary-500 bg-primary-50/30 dark:bg-primary-500/10 dark:border-primary-400"
                                        : "border-gray-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50"
                                )}
                                onClick={() =>
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        propertyType: type as PropertyTypeEnum,
                                    }))
                                }
                            >
                                <Icon className={cn(
                                    "w-6 h-6 mb-2 transition-colors",
                                    localFilters.propertyType === type ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    localFilters.propertyType === type ? "text-primary-700 dark:text-primary-300" : "text-gray-600 dark:text-gray-300"
                                )}>{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Price Range (Monthly)</h4>
                    <div className="px-2">
                        <Slider
                            min={0}
                            max={10000}
                            step={100}
                            value={[
                                localFilters.priceRange[0] ?? 0,
                                localFilters.priceRange[1] ?? 10000,
                            ]}
                            onValueChange={(value: any) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    priceRange: value as [number, number],
                                }))
                            }
                        />
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400">
                        <span>${localFilters.priceRange[0] ?? 0}</span>
                        <span>${localFilters.priceRange[1] ?? 10000}</span>
                    </div>
                </div>

                {/* Beds and Baths */}
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">Beds</h4>
                        <Select
                            value={localFilters.beds || "any"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({ ...prev, beds: value }))
                            }
                        >
                            <SelectTrigger className="w-full rounded-xl dark:bg-zinc-700 dark:text-white dark:border-white/10">
                                <SelectValue placeholder="Beds" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-800 dark:border-white/10">
                                <SelectItem value="any">Any beds</SelectItem>
                                <SelectItem value="1">1+ bed</SelectItem>
                                <SelectItem value="2">2+ beds</SelectItem>
                                <SelectItem value="3">3+ beds</SelectItem>
                                <SelectItem value="4">4+ beds</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">Baths</h4>
                        <Select
                            value={localFilters.baths || "any"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({ ...prev, baths: value }))
                            }
                        >
                            <SelectTrigger className="w-full rounded-xl dark:bg-zinc-700 dark:text-white dark:border-white/10">
                                <SelectValue placeholder="Baths" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-800 dark:border-white/10">
                                <SelectItem value="any">Any baths</SelectItem>
                                <SelectItem value="1">1+ bath</SelectItem>
                                <SelectItem value="2">2+ baths</SelectItem>
                                <SelectItem value="3">3+ baths</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Square Feet */}
                <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Square Feet</h4>
                    <div className="px-2">
                        <Slider
                            min={0}
                            max={5000}
                            step={100}
                            value={[
                                localFilters.squareFeet[0] ?? 0,
                                localFilters.squareFeet[1] ?? 5000,
                            ]}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    squareFeet: value as [number, number],
                                }))
                            }
                        />
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-600 dark:text-gray-400">
                        <span>{localFilters.squareFeet[0] ?? 0} sq ft</span>
                        <span>{localFilters.squareFeet[1] ?? 5000} sq ft</span>
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
                            <div
                                key={amenity}
                                className={cn(
                                    "flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200",
                                    localFilters.amenities.includes(amenity as AmenityEnum)
                                        ? "border-primary-500 bg-primary-50/30 dark:bg-primary-500/10 dark:border-primary-400"
                                        : "border-gray-200 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50"
                                )}
                                onClick={() => handleAmenityChange(amenity as AmenityEnum)}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    localFilters.amenities.includes(amenity as AmenityEnum) ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"
                                )} />
                                <Label className={cn(
                                    "cursor-pointer text-xs font-medium transition-colors",
                                    localFilters.amenities.includes(amenity as AmenityEnum) ? "text-primary-700 dark:text-primary-300" : "text-gray-600 dark:text-gray-300"
                                )}>
                                    {formatEnumString(amenity)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available From */}
                <div className="space-y-2">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Available From</h4>
                    <Input
                        type="date"
                        value={
                            localFilters.availableFrom !== "any"
                                ? localFilters.availableFrom
                                : ""
                        }
                        onChange={(e) =>
                            setLocalFilters((prev) => ({
                                ...prev,
                                availableFrom: e.target.value ? e.target.value : "any",
                            }))
                        }
                        className="rounded-xl dark:bg-zinc-700 dark:text-white dark:border-white/10"
                    />
                </div>

                {/* Apply and Reset buttons */}
                <div className="flex gap-4 mt-8 pb-4">
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-primary-700 hover:bg-primary-800 text-white rounded-xl py-6 font-bold tracking-wide transition-all shadow-md shadow-primary-500/20"
                    >
                        APPLY FILTERS
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex-1 rounded-xl py-6 font-bold border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-700"
                    >
                        RESET
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FiltersFull;