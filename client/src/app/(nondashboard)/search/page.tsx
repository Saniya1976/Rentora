"use client";

import { NAVBAR_HEIGHT } from "@/lib/constants";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import FiltersBar from "./filtersBar";
import FiltersFull from "./filtersFull";
import { setFilters, initialState } from "@/state";
import Map from "./map";
import Listings from "./listings";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    const newFilters: any = { ...initialState.filters };

    Object.entries(params).forEach(([key, value]) => {
      if (key === "priceRange" || key === "squareFeet") {
        newFilters[key] = value.split(",").map((v) => (v === "null" || v === "" ? null : Number(v)));
      } else if (key === "coordinates") {
        newFilters[key] = value.split(",").map(Number);
      } else if (key === "amenities") {
        newFilters[key] = value.split(",");
      } else {
        newFilters[key] = value === "any" ? "any" : value;
      }
    });

    dispatch(setFilters(newFilters));
  }, [searchParams, dispatch]);

  return (
    <div
      className="w-full mx-auto px-5 flex flex-col"
      style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <FiltersBar />
      <div className="flex justify-between flex-1 overflow-hidden gap-3 mb-5">
        <div
          className={`h-full overflow-auto transition-all duration-300 ease-in-out ${isFiltersFullOpen
            ? "w-3/12 opacity-100 visible"
            : "w-0 opacity-0 invisible"
            }`}
        >
          <FiltersFull />
        </div>
        <Map />
        <div className="basis-4/12 overflow-y-auto">
          <Listings />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;