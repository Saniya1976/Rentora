import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTenant = async (req: Request, res: Response): Promise<void> => {

}

export const getTenantById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clerkId } = req.params;
        const tenant = await prisma.tenant.findUnique({
            where: {
                clerkId: clerkId as string
            },
            include: {
                favorites: true,

            }
        });
        if (tenant) {
            res.json(tenant);
        } else {
            res.status(404).json({ message: "Tenant not found" });
        }
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
