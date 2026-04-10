import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons, AmenityEnum, HighlightEnum } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api";
import { HelpCircle } from "lucide-react";
import React from "react";

interface PropertyDetailsProps {
  propertyId: number;
}

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) return <>Loading...</>;
  if (isError || !property) {
    return <>Property not Found</>;
  }

  return (
    <div className="mb-6">
      {/* Amenities */}
      <div>
        <h2 className="text-xl font-semibold my-3">Property Amenities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {property.amenities.map((amenity: AmenityEnum) => {
            const Icon = AmenityIcons[amenity as AmenityEnum] || HelpCircle;
            return (
              <div
                key={amenity}
                className="flex flex-col items-center border border-border bg-card rounded-xl py-8 px-4 transition-colors duration-300 shadow-sm"
              >
                <Icon className="w-8 h-8 mb-2 text-primary" />
                <span className="text-sm text-center text-foreground font-medium">
                  {formatEnumString(amenity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      <div className="mt-12 mb-16">
        <h3 className="text-xl font-semibold text-foreground italic">
          Highlights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4 w-full">
          {property.highlights.map((highlight: HighlightEnum) => {
            const Icon =
              HighlightIcons[highlight as HighlightEnum] || HelpCircle;
            return (
              <div
                key={highlight}
                className="flex flex-col items-center border border-border bg-card rounded-xl py-8 px-4 transition-colors duration-300 shadow-sm"
              >
                <Icon className="w-8 h-8 mb-2 text-primary" />
                <span className="text-sm text-center text-foreground font-medium">
                  {formatEnumString(highlight)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Section */}
      <div>
        <h3 className="text-xl font-semibold text-foreground italic mb-5">
          Fees and Policies
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          The fees below are based on community-supplied data and may exclude
          additional fees and utilities.
        </p>
        <Tabs defaultValue="required-fees" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="required-fees">Required Fees</TabsTrigger>
            <TabsTrigger value="pets">Pets</TabsTrigger>
            <TabsTrigger value="parking">Parking</TabsTrigger>
          </TabsList>
          <TabsContent value="required-fees" className="w-full lg:w-1/3">
            <p className="font-semibold mt-5 mb-2 text-foreground">One time move in fees</p>
            <hr className="border-border" />
            <div className="flex justify-between py-2 bg-muted/30">
              <span className="text-muted-foreground font-medium">
                Application Fee
              </span>
              <span className="text-foreground font-bold">
                ${property.applicationFee}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between py-2 bg-muted/30">
              <span className="text-muted-foreground font-medium">
                Security Deposit
              </span>
              <span className="text-foreground font-bold">
                ${property.securityDeposit}
              </span>
            </div>
            <hr className="border-border" />
          </TabsContent>
          <TabsContent value="pets" className="text-foreground">
            <p className="font-semibold mt-5 mb-2">
              Pets are {property.isPetsAllowed ? "allowed" : "not allowed"}
            </p>
          </TabsContent>
          <TabsContent value="parking" className="text-foreground">
            <p className="font-semibold mt-5 mb-2">
              Parking is{" "}
              {property.isParkingIncluded ? "included" : "not included"}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyDetails;