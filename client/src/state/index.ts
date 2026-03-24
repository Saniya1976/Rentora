import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  location: string;
  priceRange: [number | null, number | null];
  beds: string;
  baths: string;
  propertyType: string;
  squareFeet: [number | null, number | null];
  amenities: string[];
  availableFrom: string;
  coordinates: [number, number];
}

interface GlobalState {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: "list" | "grid";
}

export const initialState: GlobalState = {
  filters: {
    location: "",
    priceRange: [null, null],
    beds: "any",
    baths: "any",
    propertyType: "any",
    squareFeet: [null, null],
    amenities: [],
    availableFrom: "any",
    coordinates: [0, 0],
  },
  isFiltersFullOpen: false,
  viewMode: "grid",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"list" | "grid">) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setFilters, toggleFiltersFullOpen, setViewMode } =
  globalSlice.actions;

export default globalSlice.reducer;
