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


    if (!isFiltersFullOpen) return null;

    return (
        <div className="bg-card text-card-foreground rounded-xl px-4 h-full overflow-auto pb-10 transition-colors duration-300 border-r border-border">
            <div className="flex flex-col space-y-6 py-4">

                {/* Property Type */}
                <div>
                    <h4 className="font-bold mb-3 text-foreground">Property Type</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                            <div
                                key={type}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all duration-200",
                                    localFilters.propertyType === type
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
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
                                    localFilters.propertyType === type ? "text-primary" : "text-muted-foreground"
                                )} />
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    localFilters.propertyType === type ? "text-primary" : "text-muted-foreground"
                                )}>{type}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div className="space-y-4">
                    <h4 className="font-bold text-foreground">Price Range (Monthly)</h4>
                    <div className="px-2">
                        <Slider
                            min={0}
                            max={200000}
                            step={5000}
                            value={[
                                localFilters.priceRange[0] ?? 0,
                                localFilters.priceRange[1] ?? 200000,
                            ]}
                            onValueChange={(value: any) =>
                                setLocalFilters((prev) => ({
                                    ...prev,
                                    priceRange: value as [number, number],
                                }))
                            }
                            className="text-primary"
                        />
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                        <span>₹{(localFilters.priceRange[0] ?? 0).toLocaleString()}</span>
                        <span>₹{(localFilters.priceRange[1] ?? 200000).toLocaleString()}</span>
                    </div>
                </div>

                {/* Beds and Baths */}
                <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-foreground">Beds</h4>
                        <Select
                            value={localFilters.beds || "any"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({ ...prev, beds: value }))
                            }
                        >
                            <SelectTrigger className="w-full rounded-xl border-border bg-background text-foreground">
                                <SelectValue placeholder="Beds" />
                            </SelectTrigger>
                            <SelectContent className="bg-card text-card-foreground border-border">
                                <SelectItem value="any">Any beds</SelectItem>
                                <SelectItem value="1">1+ bed</SelectItem>
                                <SelectItem value="2">2+ beds</SelectItem>
                                <SelectItem value="3">3+ beds</SelectItem>
                                <SelectItem value="4">4+ beds</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                        <h4 className="font-bold text-foreground">Baths</h4>
                        <Select
                            value={localFilters.baths || "any"}
                            onValueChange={(value) =>
                                setLocalFilters((prev) => ({ ...prev, baths: value }))
                            }
                        >
                            <SelectTrigger className="w-full rounded-xl border-border bg-background text-foreground">
                                <SelectValue placeholder="Baths" />
                            </SelectTrigger>
                            <SelectContent className="bg-card text-card-foreground border-border">
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
                    <h4 className="font-bold text-foreground">Square Feet</h4>
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
                    <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                        <span>{localFilters.squareFeet[0] ?? 0} sq ft</span>
                        <span>{localFilters.squareFeet[1] ?? 5000} sq ft</span>
                    </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                    <h4 className="font-bold text-foreground">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
                            <div
                                key={amenity}
                                className={cn(
                                    "flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all duration-200",
                                    localFilters.amenities.includes(amenity as AmenityEnum)
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border bg-card text-muted-foreground hover:border-primary/50"
                                )}
                                onClick={() => handleAmenityChange(amenity as AmenityEnum)}
                            >
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    localFilters.amenities.includes(amenity as AmenityEnum) ? "text-primary" : "text-muted-foreground"
                                )} />
                                <Label className={cn(
                                    "cursor-pointer text-xs font-medium transition-colors",
                                    localFilters.amenities.includes(amenity as AmenityEnum) ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {formatEnumString(amenity)}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Available From */}
                <div className="space-y-2">
                    <h4 className="font-bold text-foreground">Available From</h4>
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
                        className="rounded-xl border-border bg-background text-foreground color-scheme-dark"
                    />
                </div>

                {/* Apply and Reset buttons */}
                <div className="flex gap-4 mt-8 pb-4">
                    <Button
                        onClick={handleSubmit}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 font-bold tracking-wide transition-all shadow-md shadow-primary/20"
                    >
                        APPLY FILTERS
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        className="flex-1 rounded-xl py-6 font-bold border-border text-muted-foreground hover:bg-muted transition-colors"
                    >
                        RESET
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FiltersFull;