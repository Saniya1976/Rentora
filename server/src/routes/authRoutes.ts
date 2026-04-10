import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/user", authMiddleware(["tenant", "manager"]), async (req, res) => {
    try {
        const { id } = req.user!;
        console.log(`[DEBUG] Fetching Auth User: id=[${id}]`);

        // Check Manager table first
        let user: any = await prisma.manager.findUnique({
            where: { clerkId: id },
            include: { managedProperties: true }
        });

        if (user) {
            user.userRole = "manager";
        } else {
            // Check Tenant table
            user = await prisma.tenant.findUnique({
                where: { clerkId: id },
                include: { favorites: true, properties: true, applications: true }
            });
            if (user) {
                user.userRole = "tenant";
            }
        }

        if (!user) {
            return res.status(404).json({ message: "User not found in any role" });
        }

        const finalRole = (user as any).userRole;
        res.json({ ...user, userRole: finalRole });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching auth user", error: error.message });
    }
});

export default router;
