import { Request, Response } from "express";
import { PrismaClient, Prisma, Amenity, Highlight } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Location } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const formatEnum = (input: any, enumObj: any): string[] => {
  const validValues = Object.values(enumObj) as string[];
  if (!input) return [];
  const parsed = typeof input === "string" ? input.split(",") : input;
  if (!Array.isArray(parsed)) return [];
  return parsed.map((s: string) => {
    const trimmed = s.trim();
    const match = validValues.find(v => v.toLowerCase() === trimmed.toLowerCase());
    return match || null;
  }).filter(Boolean) as string[];
};

/**
 * Upload a single multer file buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
const uploadToCloudinary = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rentora/properties",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          resolve(result.secure_url);
        }
      }
    );
    stream.end(file.buffer);
  });
};

// GET /properties - list all properties with optional filters
export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`);
    }

    if (priceMin && priceMin !== "any") {
      whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
    }

    if (priceMax && priceMax !== "any") {
      whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds = ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths = ${Number(baths)}`);
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(Prisma.sql`p."propertyType"::text = ${propertyType}`);
    }

    if (squareFeetMin && squareFeetMin !== "any") {
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`);
    }

    if (squareFeetMax && squareFeetMax !== "any") {
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`);
    }

    if (amenities && amenities !== "any") {
      whereConditions.push(Prisma.sql`${amenities} = ANY(p.amenities)`);
    }

    if (availableFrom && availableFrom !== "any") {
      const date = new Date(availableFrom as string);
      if (!isNaN(date.getTime())) {
        whereConditions.push(
          Prisma.sql`NOT EXISTS (
            SELECT 1 FROM "Lease" lease 
            WHERE lease."propertyId" = p.id 
            AND lease."startDate" <= ${date.toISOString()} 
            AND lease."endDate" >= ${date.toISOString()}
          )`
        );
      }
    }

    if (latitude && longitude && latitude !== "any" && longitude !== "any") {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
        const radiusInMeters = 5000;
        whereConditions.push(
          Prisma.sql`ST_DWithin(l.coordinates, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, ${radiusInMeters})`
        );
      }
    }

    const { location } = req.query;
    if (location && location !== "any") {
      const locationSearch = `%${location}%`;
      whereConditions.push(
        Prisma.sql`(p.name ILIKE ${locationSearch} OR p.description ILIKE ${locationSearch} OR l.address ILIKE ${locationSearch} OR l.city ILIKE ${locationSearch} OR l.state ILIKE ${locationSearch})`
      );
    }

    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l.coordinates::geometry),
            'latitude', ST_Y(l.coordinates::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${whereConditions.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
        : Prisma.empty
      }
    `;

    const properties = await prisma.$queryRaw(completeQuery);

    res.json(properties);
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        location: true,
      },
    })
    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];
      const propertyWithCoordinates = {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] || [];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerClerkId,
      ...propertyData
    } = req.body;

    // Upload images to Cloudinary
    let photoUrls: string[] = [];
    if (files.length > 0) {
      console.log(`[createProperty] Uploading ${files.length} image(s) to Cloudinary...`);
      photoUrls = await Promise.all(files.map((file) => uploadToCloudinary(file)));
      console.log(`[createProperty] Upload complete:`, photoUrls);
    }

    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
      {
        street: address,
        city,
        country,
        postalcode: postalCode,
        format: "json",
        limit: "1",
      }
    ).toString()}`;
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com)",
      },
    }).catch(e => ({ data: [] }));

    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
          parseFloat(geocodingResponse.data[0]?.lon),
          parseFloat(geocodingResponse.data[0]?.lat),
        ]
        : [0, 0];

    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerClerkId,
        amenities: formatEnum(propertyData.amenities, Amenity) as any,
        highlights: formatEnum(propertyData.highlights, Highlight) as any,
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (error: any) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[] || [];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      existingPhotoUrls,
      ...propertyData
    } = req.body;

    const propertyId = Number(id);
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { location: true },
    });

    if (!existingProperty) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    let photoUrls: string[] = [];

    // Parse existing photos if provided, otherwise keep existing ones
    if (existingPhotoUrls) {
      try {
        photoUrls = JSON.parse(existingPhotoUrls);
      } catch (e) {
        photoUrls = existingProperty.photoUrls;
      }
    } else {
      photoUrls = existingProperty.photoUrls;
    }

    // Upload new images to Cloudinary
    if (files && files.length > 0) {
      console.log(`[updateProperty] Uploading ${files.length} image(s) to Cloudinary...`);
      const newPhotoUrls = await Promise.all(files.map((file) => uploadToCloudinary(file)));
      photoUrls = [...photoUrls, ...newPhotoUrls];
    }

    let locationId = existingProperty.locationId;
    const addressChanged =
      address !== existingProperty.location.address ||
      city !== existingProperty.location.city ||
      state !== existingProperty.location.state ||
      country !== existingProperty.location.country ||
      postalCode !== existingProperty.location.postalCode;

    if (addressChanged) {
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
        {
          street: address,
          city,
          country,
          postalcode: postalCode,
          format: "json",
          limit: "1",
        }
      ).toString()}`;
      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com)",
        },
      }).catch(e => ({ data: [] }));

      const [longitude, latitude] =
        geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
          ? [
            parseFloat(geocodingResponse.data[0]?.lon),
            parseFloat(geocodingResponse.data[0]?.lat),
          ]
          : [0, 0];

      const [location] = await prisma.$queryRaw<Location[]>`
        INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
        VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
        RETURNING id;
      `;
      locationId = location.id;
    }

    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },
      data: {
        ...propertyData,
        photoUrls,
        locationId,
        amenities: formatEnum(propertyData.amenities, Amenity) as any,
        highlights: formatEnum(propertyData.highlights, Highlight) as any,
        isPetsAllowed: propertyData.isPetsAllowed === "true" || propertyData.isPetsAllowed === true,
        isParkingIncluded: propertyData.isParkingIncluded === "true" || propertyData.isParkingIncluded === true,
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.json(updatedProperty);
  } catch (error: any) {
    console.error("Error updating property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!existingProperty) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    await prisma.property.delete({
      where: { id: propertyId }
    });

    res.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
