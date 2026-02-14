import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const createTenant = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clerkId, name, email, phoneNumber } = req.body;

        if (!clerkId || !name || !email) {
            res.status(400).json({ message: "Clerk ID, name, and email are required" });
            return;
        }

        const tenant = await prisma.tenant.upsert({
            where: { clerkId: clerkId as string },
            update: { name, email, phoneNumber },
            create: {
                clerkId: clerkId as string,
                name,
                email,
                phoneNumber,
            },
        });
        res.status(201).json(tenant);
    } catch (error: any) {
        console.error("Error creating/updating tenant:", error);
        res.status(500).json({ message: "Error processing tenant data", error: error.message });
    }
};

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
                favorites: true,
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
