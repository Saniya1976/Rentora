import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Location } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

// GET /properties - list all properties with optional filters
export const getProperties = async (req: Request, res: Response): Promise<void> => {
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
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`
      );
    }

    if (beds && beds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    }

    if (baths && baths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);
    }

    if (squareFeetMin) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
      );
    }

    if (squareFeetMax) {
      whereConditions.push(
        Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
      );
    }

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null;
      if (availableFromDate) {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l
              WHERE l."propertyId" = p.id
              AND l."startDate" <= ${date.toISOString()}
            )`
          );
        }
      }
    }

    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKilometers = 1000;
      const degrees = radiusInKilometers / 111;

      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates::geometry,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`
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
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
    `;

    const properties = await prisma.$queryRaw(completeQuery);

    res.status(200).json(properties);
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /properties/:id - get a single property by numeric ID
export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: idParam } = req.params as { id: string };
    const id = parseInt(idParam);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid property ID" });
      return;
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        manager: { select: { clerkId: true, name: true, email: true, phoneNumber: true } },
        leases: true,
        applications: true,
      },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    // Extract PostGIS coordinates from the location via WKT conversion
    const coordinates: { coordinates: string }[] =
      await prisma.$queryRaw`SELECT ST_AsText(coordinates) as coordinates FROM "Location" WHERE id = ${property.location.id}`;

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

    res.status(200).json(propertyWithCoordinates);
  } catch (error: any) {
    console.error("Error fetching property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// POST /properties - create a new property (manager only)
export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    const {
      address,
      city,
      state,
      country,
      postalCode,
      ...propertyData
    } = req.body;

    // Clerk auth — extract manager's Clerk ID from the authenticated user
    const managerClerkId = (req as any).user?.id;
    if (!managerClerkId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Ensure the manager exists in DB
    const manager = await prisma.manager.findUnique({ where: { clerkId: managerClerkId } });
    if (!manager) {
      res.status(404).json({ message: "Manager profile not found. Please complete your profile first." });
      return;
    }

    // Upload images to S3
    const photoUrls = await Promise.all(
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

    // Auto-geocode the address using Nominatim (OpenStreetMap)
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      street: address,
      city,
      country,
      postalcode: postalCode,
      format: "json",
      limit: "1",
    }).toString()}`;

    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: {
        "User-Agent": "RealEstateApp (your-email@example.com)",
      },
    });

    const [longitude, latitude] =
      geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat
        ? [
            parseFloat(geocodingResponse.data[0].lon),
            parseFloat(geocodingResponse.data[0].lat),
          ]
        : [0, 0];

    // Create location via raw SQL (PostGIS ST_MakePoint can't go through Prisma's typed API)
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (
        ${address},
        ${city},
        ${state},
        ${country},
        ${postalCode},
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
      )
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates
    `;

    // Create property — using clerkId to link to the manager
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerClerkId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
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
        manager: { select: { clerkId: true, name: true, email: true } },
      },
    });

    res.status(201).json(property);
  } catch (error: any) {
    console.error("Error creating property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};