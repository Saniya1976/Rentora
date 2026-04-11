import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";

export interface Property {
    id: number;
    name: string;
    description: string;
    pricePerMonth: number;
    securityDeposit: number;
    applicationFee: number;
    photoUrls: string[];
    amenities: AmenityEnum[];
    highlights: HighlightEnum[];
    isPetsAllowed: boolean;
    isParkingIncluded: boolean;
    beds: number;
    baths: number;
    squareFeet: number;
    propertyType: PropertyTypeEnum;
    postedDate: string;
    averageRating: number;
    numberOfReviews: number;
    locationId: number;
    managerClerkId: string;
    location: Location;
    manager: Manager;
    leases?: Lease[];
}

export interface Manager {
    id: number;
    clerkId: string;
    name: string;
    email: string;
    phoneNumber: string;
    userRole: string;
    managedProperties?: Property[];
}

export interface Tenant {
    id: number;
    clerkId: string;
    name: string;
    email: string;
    phoneNumber: string;
    userRole: string;
    favorites?: Property[];
    properties?: Property[];
    applications?: Application[];
}

export interface Location {
    id: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
        longitude: number;
        latitude: number;
    };
}

export interface Application {
    id: number;
    applicationDate: string;
    status: string;
    propertyId: number;
    tenantClerkId: string;
    name: string;
    email: string;
    phoneNumber: string;
    message?: string;
    property: Property;
    tenant: Tenant;
    lease?: Lease | null;
}

export interface Lease {
    id: number;
    startDate: string;
    endDate: string;
    rent: number;
    deposit: number;
    propertyId: number;
    tenantClerkId: string;
    property: Property;
    tenant: Tenant;
    payments?: Payment[];
}

export interface Payment {
    id: number;
    amountDue: number;
    amountPaid: number;
    dueDate: string;
    paymentDate: string;
    paymentStatus: string;
    leaseId: number;
}




