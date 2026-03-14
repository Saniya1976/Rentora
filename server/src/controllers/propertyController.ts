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
    if(favoriteIds){
        const favoriteIdsArray=(favoriteIds as string).split(",").map(Number);
        whereConditions.push(Prisma.sql`"p.pid" = IN(${favoriteIdsArray})`);
    }
    if(priceMin){
        whereConditions.push(Prisma.sql`"p.pricePerMonth" >= ${Number(priceMin)}`);
    }
    if(priceMax){
        whereConditions.push(Prisma.sql`"p.pricePerMonth" <= ${Number(priceMax)}`);
    }
    if(beds){
        whereConditions.push(Prisma.sql`"p.beds" = ${Number(beds)}`);
    }
    if(baths){
        whereConditions.push(Prisma.sql`"p.baths" = ${Number(baths)}`);
    }
    if(propertyType){
        whereConditions.push(Prisma.sql`"p.propertyType" = ${propertyType}`);
    }
    if(squareFeetMin){
        whereConditions.push(Prisma.sql`"p.squareFeet" >= ${Number(squareFeetMin)}`);
    }
    if(squareFeetMax){
        whereConditions.push(Prisma.sql`"p.squareFeet" <= ${Number(squareFeetMax)}`);
    }
    if(amenities){
        whereConditions.push(Prisma.sql`"p.amenities" = ${amenities}`);
    }
    if(availableFrom){
        whereConditions.push(Prisma.sql`"p.availableFrom" = ${availableFrom}`);
    }
    if(latitude){
        whereConditions.push(Prisma.sql`"p.latitude" = ${latitude}`);
    }
    if(longitude){
        whereConditions.push(Prisma.sql`"p.longitude" = ${longitude}`);
    }
  }
  catch (error: any) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}