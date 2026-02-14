import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export const createManager=async(req: Request , res: Response):Promise<void>=>{
   try {const {clerkId,name,email,phoneNumber}=req.body;
    const manager=await prisma.manager.create({
        data:{
            clerkId,
            name,
            email,
            phoneNumber
        }
    })
    res.status(201).json(manager);
}
catch (error:any) {
    console.error("Error creating manager:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
}
}

export const getManagerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { clerkId } = req.params;

        // Security check: Tenants can only fetch their own profile
        const user = (req as any).user;
        if (!user || user.id !== clerkId) {
            res.status(403).json({ message: "Forbidden: You can only access your own profile" });
            return;
        }

        const manager = await prisma.manager.findUnique({
            where: { clerkId: clerkId as string },
            include: {
                managedProperties: true,
            },
        });

        if (manager) {
            res.status(200).json(manager);
        } else {
            res.status(404).json({ message: "Manager not found" });
        }
    } catch (error: any) {
        console.error("Error fetching tenant:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
