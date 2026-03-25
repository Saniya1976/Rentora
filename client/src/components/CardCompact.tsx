import { Bath, Bed, Heart, House, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Property } from "@/types/prismaTypes";

interface CardCompactProps {
    property: Property;
    isFavorite: boolean;
    onFavoriteToggle: () => void;
    showFavoriteButton?: boolean;
    propertyLink?: string;
}

const CardCompact = ({
    property,
    isFavorite,
    onFavoriteToggle,
    showFavoriteButton = true,
    propertyLink,
}: CardCompactProps) => {
    const [imgSrc, setImgSrc] = useState(
        property.photoUrls?.[0] || "/placeholder.jpg"
    );

    return (
        <div className="bg-card text-card-foreground rounded-xl overflow-hidden shadow-lg w-full flex h-40 mb-5 border border-border transition-colors duration-300">
            <div className="relative w-1/3">
                <Image
                    src={imgSrc}
                    alt={property.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={() => setImgSrc("/placeholder.jpg")}
                />
                <div className="absolute bottom-2 left-2 flex gap-1 flex-col">
                    {property.isPetsAllowed && (
                        <span className="bg-background/80 text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit backdrop-blur-sm">
                            Pets
                        </span>
                    )}
                    {property.isParkingIncluded && (
                        <span className="bg-background/80 text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit backdrop-blur-sm">
                            Parking
                        </span>
                    )}
                </div>
            </div>
            <div className="w-2/3 p-4 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h2 className="text-lg font-bold mb-1 truncate mr-2">
                            {propertyLink ? (
                                <Link
                                    href={propertyLink}
                                    className="hover:underline hover:text-primary transition-colors"
                                    scroll={false}
                                >
                                    {property.name}
                                </Link>
                            ) : (
                                property.name
                            )}
                        </h2>
                        {showFavoriteButton && (
                            <button
                                className="bg-background hover:bg-muted text-foreground rounded-full p-1.5 transition-colors shadow-sm"
                                onClick={onFavoriteToggle}
                            >
                                <Heart
                                    className={`w-3.5 h-3.5 ${isFavorite ? "text-red-500 fill-red-500" : "text-muted-foreground"
                                        }`}
                                />
                            </button>
                        )}
                    </div>
                    <p className="text-muted-foreground mb-1 text-xs truncate">
                        {property?.location?.address}, {property?.location?.city}
                    </p>
                    <div className="flex text-xs items-center">
                        <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
                        <span className="font-semibold text-foreground">
                            {property.averageRating.toFixed(1)}
                        </span>
                        <span className="text-muted-foreground ml-1">
                            ({property.numberOfReviews})
                        </span>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <div className="flex gap-2 text-muted-foreground">
                        <span className="flex items-center">
                            <Bed className="w-3.5 h-3.5 mr-1" />
                            {property.beds}
                        </span>
                        <span className="flex items-center">
                            <Bath className="w-3.5 h-3.5 mr-1" />
                            {property.baths}
                        </span>
                        <span className="flex items-center">
                            <House className="w-3.5 h-3.5 mr-1" />
                            {property.squareFeet}
                        </span>
                    </div>

                    <p className="text-base font-bold text-foreground">
                        ₹{property.pricePerMonth.toLocaleString()}
                        <span className="text-muted-foreground text-[10px] font-normal"> /mo</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CardCompact;