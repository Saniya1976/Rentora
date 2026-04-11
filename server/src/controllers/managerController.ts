import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
const prisma = new PrismaClient();

export const createManager = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clerkId, name, email, phoneNumber } = req.body;

        // Check if manager already exists
        const existing = await prisma.manager.findUnique({ where: { clerkId } });

        const manager = await prisma.manager.upsert({
            where: { clerkId },
            update: {},
            create: {
                clerkId,
                name,
                email,
                phoneNumber
            }
        });

        res.status(201).json(manager);
    }
    catch (error: any) {
        console.error("Error creating manager:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getManagerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clerkId } = req.params;

        // Security check: only the manager themselves can fetch their profile
        const user = (req as any).user;
        if (!user || user.id !== clerkId) {
            res.status(403).json({ message: "Forbidden: You can only access your own profile" });
            return;
        }

        let manager = await prisma.manager.findUnique({
            where: { clerkId: clerkId as string },
            include: { managedProperties: true },
        });

        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }

        res.status(200).json(manager);
    } catch (error: any) {
        console.error("Error fetching manager:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
export const getManagerProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clerkId } = req.params;
        console.log(`[DEBUG] Fetching Manager Properties for: [${clerkId}]`);

        const manager = await prisma.manager.findUnique({
            where: { clerkId: clerkId as string },
        });

        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }

        const properties: Prisma.PropertyGetPayload<{ include: { location: true } }>[] =
            await prisma.property.findMany({
                where: {
                    managerClerkId: clerkId as string,
                },
                include: {
                    location: true,
                },
            });

        const propertiesWithFormattedLocation = await Promise.all(
            properties.map(async (property) => {
                const coordinates: { coordinates: string }[] =
                    await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
                const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
                const longitude = geoJSON.coordinates[0];
                const latitude = geoJSON.coordinates[1];

                return {
                    ...property,
                    location: {
                        ...property.location,
                        coordinates: {
                            longitude,
                            latitude,
                        },
                    },
                };
            })
        );

        res.json(propertiesWithFormattedLocation);
    } catch (err: any) {
        res
            .status(500)
            .json({ message: `Error retrieving properties: ${err.message}` });
    }
};

export const updateManager = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { clerkId } = req.params;
        const { name, email, phoneNumber } = req.body;

        const updateManager = await prisma.manager.update({
            where: { clerkId: clerkId as string },
            data: {
                name,
                email,
                phoneNumber,
            },
        });

        res.json(updateManager);
    } catch (error: any) {
        res
            .status(500)
            .json({ message: `Error updating manager: ${error.message}` });
    }
};





