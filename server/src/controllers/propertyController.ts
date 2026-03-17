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
        whereConditions.push(Prisma.sql`"p.pid" IN (${Prisma.join(favoriteIdsArray)})`);
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
    if(beds && beds!=="any"){
        whereConditions.push(Prisma.sql`"p.beds" = ${Number(beds)}`);
    }
    if(baths && baths!=="any"){
        whereConditions.push(Prisma.sql`"p.baths" = ${Number(baths)}`);
    }
    if(propertyType && propertyType!=="any"){
        whereConditions.push(Prisma.sql`"p.propertyType" = ${propertyType}`);
    }
    if(squareFeetMin ){
        whereConditions.push(Prisma.sql`"p.squareFeet" >= ${Number(squareFeetMin)}`);
    }
    if(squareFeetMax ){
        whereConditions.push(Prisma.sql`"p.squareFeet" <= ${Number(squareFeetMax)}`);
    }
    if(amenities && amenities!=="any"){
        whereConditions.push(Prisma.sql`"p.amenities" = ${amenities}`);
    }
    if(availableFrom && availableFrom!=="any"){
        const availableFromDate=typeof availableFrom==="string"?availableFrom:null;
        if(availableFromDate){
            const date=new Date(availableFromDate);
            if(!isNaN(date.getTime())){
                whereConditions.push(Prisma.sql`EXISTS(SELECT 1 FROM "lease" l WHERE l."propertyId"="p.id" AND l."startDate" >= ${date.toISOString()})`);
            }
        }
        if(latitude && longitude){
            const lat=parseFloat(latitude as string);
            const lng=parseFloat(longitude as string);
            const radiusInKilometeres=1000;
            const degrees=radiusInKilometeres/111.32;
            if(!isNaN(lat) && !isNaN(lng)){
                whereConditions.push(Prisma.sql`l.coordinates::geometry, ST_SetSRID(ST_MakePoint(${lng},${lat}),4326) < ${degrees}`);
            }
        }
    }
    if(latitude && latitude!=="any"){
        whereConditions.push(Prisma.sql`"p.latitude" = ${latitude}`);
    }
    if(longitude && longitude!=="any"){
        whereConditions.push(Prisma.sql`"p.longitude" = ${longitude}`);
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

    res.json(properties);
  }
  catch (error: any) {
    console.error("Error fetching properties:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
export const getProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id}=req.params;
        const property=await prisma.property.findUnique({
            where:{
                id:Number(id),   
            },
            include:{
                    location:true,
                },
        })
        if(property){
            const coordinates:{coordinates:string}[]=
                   await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
            const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
            const longitude = geoJSON.coordinates[0];
            const latitude = geoJSON.coordinates[1];
            
        }
        if(!property){
            res.status(404).json({message:"Property not found"});
            return;
        }
        res.json(property);
    } catch (error:any) {
        console.error("Error fetching property:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}