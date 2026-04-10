"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant,
} from "./types";
import { FiltersState } from ".";
import { toast } from "sonner";

const withToast = async <T,>(
  queryFulfilled: Promise<{ data: T }>,
  messages: { success?: string; error?: string }
) => {
  try {
    await queryFulfilled;
    if (messages.success) {
      toast.success(messages.success);
    }
  } catch (error) {
    if (messages.error) {
      toast.error(messages.error);
    }
  }
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await (window as any).Clerk?.session?.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: ["Managers", "Tenants", "Properties", "Leases", "Payments", "Applications"],
  endpoints: (build) => ({
    getAuthUser: build.query<Tenant | Manager, void>({
      query: () => "auth/user",
      providesTags: (result) =>
        result
          ? [
            { type: result.userRole === "manager" ? "Managers" : "Tenants", id: result.id },
            "Managers",
            "Tenants",
          ]
          : ["Managers", "Tenants"],
    }),
    updateTenantSettings: build.mutation<Tenant, Partial<Tenant> & { clerkId: string }>({
      query: ({ clerkId, ...updatedTenant }) => ({
        url: `tenants/${clerkId}?userType=tenant`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),
    updateManagerSettings: build.mutation<Manager, Partial<Manager> & { clerkId: string }>({
      query: ({ clerkId, ...updatedManager }) => ({
        url: `managers/${clerkId}?userType=manager`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [{ type: "Managers", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Settings updated successfully!",
          error: "Failed to update settings.",
        });
      },
    }),

    createProperty: build.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `properties?userType=manager`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: "LIST" },
        { type: "Managers", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property created successfully!",
          error: "Failed to create property.",
        });
      },
    }),
    updateProperty: build.mutation<Property, { id: number; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `properties/${id}?userType=manager`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result) => [
        { type: "Properties", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Property updated successfully!",
          error: "Failed to update property.",
        });
      },
    }),

    // lease related enpoints
    getLeases: build.query<Lease[], { tenantClerkId?: string, managerClerkId?: string } | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.tenantClerkId) queryParams.append("tenantClerkId", params.tenantClerkId);
        if (params?.managerClerkId) queryParams.append("managerClerkId", params.managerClerkId);
        return `leases?${queryParams.toString()}`;
      },
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch leases.",
        });
      },
    }),

    getPropertyLeases: build.query<Lease[], number>({
      query: (propertyId) => `properties/${propertyId}/leases?userType=manager`,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch property leases.",
        });
      },
    }),

    getPayments: build.query<Payment[], number>({
      query: (leaseId) => `leases/${leaseId}/payments`,
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment info.",
        });
      },
    }),

    getApplications: build.query<Application[], { userId?: string, userType?: string }>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.userId) queryParams.append("userId", params.userId.toString());
        if (params.userType) queryParams.append("userType", params.userType);
        return `applications?${queryParams.toString()}`;
      },
      providesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    updateApplicationStatus: build.mutation<Application & { lease?: Lease }, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `applications/${id}/status?userType=manager`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application status updated successfully!",
          error: "Failed to update application settings.",
        });
      },
    }),

    createApplication: build.mutation<Application, Partial<Application>>({
      query: (newApplication) => ({
        url: "applications?userType=tenant",
        method: "POST",
        body: newApplication,
      }),
      invalidatesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          success: "Application created successfully!",
          error: "Failed to create applications.",
        });
      },
    }),

    getProperties: build.query<Property[], (Partial<FiltersState> & { favoriteIds?: number[] }) | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.favoriteIds) {
          queryParams.append("favoriteIds", params.favoriteIds.join(","));
        }
        if (params?.location) queryParams.append("location", params.location);
        if (params?.beds && params.beds !== "any") queryParams.append("beds", params.beds);
        if (params?.baths && params.baths !== "any") queryParams.append("baths", params.baths);
        if (params?.propertyType && params.propertyType !== "any") queryParams.append("propertyType", params.propertyType);
        if (params?.amenities && params.amenities.length > 0) queryParams.append("amenities", params.amenities.join(","));
        if (params?.availableFrom && params.availableFrom !== "any") queryParams.append("availableFrom", params.availableFrom);
        if (params?.priceRange) {
          if (params.priceRange[0] !== null) queryParams.append("priceMin", params.priceRange[0].toString());
          if (params.priceRange[1] !== null) queryParams.append("priceMax", params.priceRange[1].toString());
        }
        if (params?.squareFeet) {
          if (params.squareFeet[0] !== null) queryParams.append("squareFeetMin", params.squareFeet[0].toString());
          if (params.squareFeet[1] !== null) queryParams.append("squareFeetMax", params.squareFeet[1].toString());
        }
        if (params?.coordinates && (params.coordinates[0] !== 0 || params.coordinates[1] !== 0)) {
          queryParams.append("latitude", params.coordinates[1].toString());
          queryParams.append("longitude", params.coordinates[0].toString());
        }

        return `properties?${queryParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.map(({ id }) => ({ type: "Properties" as const, id })),
            { type: "Properties", id: "LIST" },
          ]
          : [{ type: "Properties", id: "LIST" }],
    }),
    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (result) => [{ type: "Properties", id: result?.id }],
    }),
    getCurrentResidences: build.query<Property[], string>({
      query: (userId) => `tenants/${userId}/current-residences`,
      providesTags: ["Properties"],
    }),
    getManagerProperties: build.query<Property[], string>({
      query: (userId) => `managers/${userId}/properties?userType=manager`,
      providesTags: ["Properties"],
    }),
    getTenant: build.query<Tenant, string>({
      query: (clerkId) => `tenants/${clerkId}`,
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),
    addFavoriteProperty: build.mutation<Tenant, { clerkId: string; propertyId: number }>({
      query: ({ clerkId, propertyId }) => ({
        url: `tenants/${clerkId}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),
    removeFavoriteProperty: build.mutation<Tenant, { clerkId: string; propertyId: number }>({
      query: ({ clerkId, propertyId }) => ({
        url: `tenants/${clerkId}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [{ type: "Tenants", id: result?.id }],
    }),
    createCheckoutSession: build.mutation<{ url: string }, { paymentId: number }>({
      query: (data) => ({
        url: "payments/create-checkout-session",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAuthUserQuery,
  useUpdateTenantSettingsMutation,
  useUpdateManagerSettingsMutation,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetCurrentResidencesQuery,
  useGetManagerPropertiesQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetTenantQuery,
  useAddFavoritePropertyMutation,
  useRemoveFavoritePropertyMutation,
  useGetLeasesQuery,
  useGetPropertyLeasesQuery,
  useGetPaymentsQuery,
  useGetApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useCreateApplicationMutation,
  useCreateCheckoutSessionMutation,
} = api;