import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/user", authMiddleware(["tenant", "manager"]), async (req, res) => {
    try {
        const { id } = req.user!;
        const requestedType = (req.query.userType as string | undefined)?.toLowerCase();
        console.log(`[DEBUG] Fetching Auth User: id=[${id}] requestedType=[${requestedType}]`);

        let user: any = null;

        if (requestedType === "manager") {
            // Only check Manager table
            user = await prisma.manager.findUnique({
                where: { clerkId: id },
                include: { managedProperties: true }
            });
            if (user) user.userRole = "manager";
        } else if (requestedType === "tenant") {
            // Only check Tenant table
            user = await prisma.tenant.findUnique({
                where: { clerkId: id },
                include: { favorites: true, properties: true, applications: true }
            });
            if (user) user.userRole = "tenant";
        } else {
            // No userType specified — check Tenant first to avoid false manager returns
            user = await prisma.tenant.findUnique({
                where: { clerkId: id },
                include: { favorites: true, properties: true, applications: true }
            });
            if (user) {
                user.userRole = "tenant";
            } else {
                user = await prisma.manager.findUnique({
                    where: { clerkId: id },
                    include: { managedProperties: true }
                });
                if (user) user.userRole = "manager";
            }
        }

        if (!user) {
            return res.status(404).json({ message: "User not found in any role" });
        }

        const finalRole = (user as any).userRole;
        console.log(`[DEBUG] Returning user with role: [${finalRole}]`);
        res.json({ ...user, userRole: finalRole });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching auth user", error: error.message });
    }
});

export default router;
