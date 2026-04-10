import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/user", authMiddleware(["tenant", "manager"]), async (req, res) => {
    try {
        const { id, role } = req.user!;
        console.log(`[DEBUG] Fetching Auth User: id=[${id}] role=[${role}]`);

        let user;
        if (role === "tenant") {
            user = await prisma.tenant.findUnique({
                where: { clerkId: id },
                include: { favorites: true, properties: true, applications: true }
            });
            // If not found in tenant but exists in manager, fallback to manager
            if (!user) {
                user = await prisma.manager.findUnique({ where: { clerkId: id } });
                if (user) (user as any).userRole = "manager";
            }
        } else if (role === "manager") {
            user = await prisma.manager.findUnique({
                where: { clerkId: id },
                include: { managedProperties: true }
            });
            // If not found in manager but exists in tenant, fallback to tenant
            if (!user) {
                user = await prisma.tenant.findUnique({ where: { clerkId: id } });
                if (user) (user as any).userRole = "tenant";
            }
        }

        if (!user) {
            return res.status(404).json({ message: "User not found in any role" });
        }

        const finalRole = (user as any).userRole || role;
        res.json({ ...user, userRole: finalRole });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching auth user", error: error.message });
    }
});

export default router;
