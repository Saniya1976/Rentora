import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();
import { wktToGeoJSON } from "@terraformer/wkt";

export const createTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkId, name, email, phoneNumber } = req.body;
    const tenant = await prisma.tenant.upsert({
      where: { clerkId },
      update: {},
      create: {
        clerkId,
        name,
        email,
        phoneNumber
      }
    })
    res.status(201).json(tenant);
  } catch (error: any) {
    console.error("Error creating tenant:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}
export const getTenantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkId } = req.params;

    // Security check: Tenants can only fetch their own profile
    const user = (req as any).user;
    if (!user || user.id !== clerkId) {
      res.status(403).json({ message: "Forbidden: You can only access your own profile" });
      return;
    }

    const tenant = await prisma.tenant.findUnique({
      where: { clerkId: clerkId as string },
      include: {
        favorites: {
          include: {
            location: true,
          }
        },
        properties: true,
        applications: true,
      },
    });

    if (tenant) {
      res.status(200).json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    console.error("Error fetching tenant:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
export const getTenantProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clerkId } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { clerkId: clerkId as string },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const now = new Date();
    const properties = await prisma.property.findMany({
      where: {
        leases: {
          some: {
            tenantClerkId: clerkId as string,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
      },
      include: {
        location: true,
        leases: {
          where: {
            tenantClerkId: clerkId as string,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          include: {
            payments: {
              orderBy: { dueDate: "desc" },
            }
          }
        },
        manager: true,
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

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateTenant = await prisma.tenant.update({
      where: { clerkId: clerkId as string },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateTenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating tenant: ${error.message}` });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkId, propertyId } = req.params;
    const tenant = await prisma.tenant.findUnique({
      where: { clerkId: clerkId as string },
      include: { favorites: true },
    });

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant.favorites || [];

    if (!existingFavorites.some((fav: any) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { clerkId: clerkId as string },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error adding favorite property: ${error.message}` });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { clerkId, propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);

    const updatedTenant = await prisma.tenant.update({
      where: { clerkId: clerkId as string },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error removing favorite property: ${err.message}` });
  }
};