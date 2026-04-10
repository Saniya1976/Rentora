import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/user", authMiddleware(["tenant", "manager"]), async (req, res) => {
    try {
        const { id, role } = req.user!;

        let user;
        if (role === "tenant") {
            user = await prisma.tenant.findUnique({
                where: { clerkId: id },
                include: {
                    favorites: true,
                    properties: true,
                    applications: true,
                }
            });
        } else if (role === "manager") {
            user = await prisma.manager.findUnique({
                where: { clerkId: id },
                include: {
                    managedProperties: true,
                }
            });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ ...user, userRole: role });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching auth user", error: error.message });
    }
});

export default router;
