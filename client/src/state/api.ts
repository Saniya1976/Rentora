import { cleanParams, createNewUserInDatabase, withToast } from "@/lib/utils";
import {
  Application,
  Lease,
  Manager,
  Payment,
  Property,
  Tenant
} from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/* -------------------- Filters Type -------------------- */

type FiltersState = {
  location?: string;
  priceRange?: [number, number];
  beds?: number;
  baths?: number;
  propertyType?: string;
  squareFeet?: [number, number];
  amenities?: string[];
  availableFrom?: string;
  coordinates?: [number, number];
};

/* -------------------- API -------------------- */

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      if (typeof window !== "undefined" && (window as any).Clerk) {
        const token = await (window as any).Clerk.session?.getToken();
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  reducerPath: "api",
  tagTypes: [
    "Managers",
    "Tenants",
    "Properties",
    "PropertyDetails",
    "Leases",
    "Payments",
    "Applications",
  ],

  endpoints: (build) => ({
    /* -------------------- AUTH -------------------- */

    getAuthUser: build.query<
      {
        cognitoInfo: any;
        userInfo: Tenant | Manager;
        userRole: string;
      },
      void
    >({
      queryFn: async (_, _queryApi, _extraOptions, fetchWithBQ) => {
        try {
          if (typeof window === "undefined" || !(window as any).Clerk) {
            return { error: { status: 500, data: "Clerk not initialized" } };
          }

          const user = (window as any).Clerk.user;
          if (!user) {
            return { error: { status: 401, data: "User not logged in" } };
          }

          const userRole =
            (user.unsafeMetadata?.role as string) || "tenant";

          const endpoint =
            userRole === "manager"
              ? `/managers/${user.id}`
              : `/tenants/${user.id}`;

          let userDetailsResponse = await fetchWithBQ(endpoint);

          if (
            userDetailsResponse.error &&
            (userDetailsResponse.error as any).status === 404
          ) {
            userDetailsResponse = await createNewUserInDatabase(
              user,
              null,
              userRole,
              fetchWithBQ
            );
          }

          return {
            data: {
              cognitoInfo: { ...user },
              userInfo: userDetailsResponse.data as Tenant | Manager,
              userRole,
            },
          };
        } catch (error: any) {
          return {
            error: {
              status: 500,
              data: error.message || "Could not fetch user data",
            },
          };
        }
      },
    }),

    /* -------------------- PROPERTIES -------------------- */

    getProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.beds,
          baths: filters.baths,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });

        return { url: "properties", params };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Properties" as const,
                id,
              })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch properties.",
        });
      },
    }),

    getProperty: build.query<Property, number>({
      query: (id) => `properties/${id}`,
      providesTags: (_, __, id) => [
        { type: "PropertyDetails", id },
      ],
    }),

    /* -------------------- TENANT -------------------- */

    getTenant: build.query<Tenant, string>({
      query: (id) => `tenants/${id}`,
      providesTags: (result) => [
        { type: "Tenants", id: result?.id },
      ],
    }),

    updateTenantSettings: build.mutation<
      Tenant,
      { cognitoId: string } & Partial<Tenant>
    >({
      query: ({ cognitoId, ...updatedTenant }) => ({
        url: `tenants/${cognitoId}`,
        method: "PUT",
        body: updatedTenant,
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
      ],
    }),

    /* -------------------- MANAGER -------------------- */

    getManagerProperties: build.query<Property[], string>({
      query: (id) => `managers/${id}/properties`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: "Properties" as const,
                id,
              })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
    }),

    updateManagerSettings: build.mutation<
      Manager,
      { cognitoId: string } & Partial<Manager>
    >({
      query: ({ cognitoId, ...updatedManager }) => ({
        url: `managers/${cognitoId}`,
        method: "PUT",
        body: updatedManager,
      }),
      invalidatesTags: (result) => [
        { type: "Managers", id: result?.id },
      ],
    }),

    /* -------------------- APPLICATIONS -------------------- */

    getApplications: build.query<
      Application[],
      { userId?: string; userType?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();

        if (params.userId) {
          queryParams.append("userId", params.userId);
        }
        if (params.userType) {
          queryParams.append("userType", params.userType);
        }

        return `applications?${queryParams.toString()}`;
      },
      providesTags: ["Applications"],
    }),

    createApplication: build.mutation<
      Application,
      Partial<Application>
    >({
      query: (body) => ({
        url: `applications`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Applications"],
    }),
  }),
});

/* -------------------- HOOK EXPORTS -------------------- */

export const {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetPropertyQuery,
  useGetTenantQuery,
  useUpdateTenantSettingsMutation,
  useGetManagerPropertiesQuery,
  useUpdateManagerSettingsMutation,
  useGetApplicationsQuery,
  useCreateApplicationMutation,
} = api;
