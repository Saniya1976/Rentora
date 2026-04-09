import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { Bucket$, S3Client } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

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
      // Assuming amenities is a string array in the database, we handle it as needed.
      // If it's a single value filter:
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
        const radiusInMeters = 5000; // 5km radius
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
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerClerkId,
      ...propertyData
    } = req.body;
    const photoUrls = await Promise.all(files.map(async (file) => {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `properties/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      }
      const uploadResult = await new Upload({
        client: s3Client,
        params: uploadParams,
      }).done();
      return uploadResult.Location;
    }))
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
        "User-Agent": "RealEstateApp (justsomedummyemail@gmail.com",
      },
    });
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
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
            : [],
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
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

export const updateProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
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

    if (files && files.length > 0) {
      const newPhotoUrls = await Promise.all(
        files.map(async (file) => {
          const uploadParams = {
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: `properties/${Date.now()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
          };
          const uploadResult = await new Upload({
            client: s3Client,
            params: uploadParams,
          }).done();
          return uploadResult.Location;
        })
      );
      photoUrls = [...photoUrls, ...newPhotoUrls as string[]];
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
      });
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
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
            : propertyData.amenities,
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "")
            : propertyData.highlights,
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