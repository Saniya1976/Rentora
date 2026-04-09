import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { createManager, getManagerById, getManagerProperty, updateManager } from "../controllers/managerController";

const router = express.Router();

// POST is open — registration must work before the user has a role in JWT
router.post("/", createManager);
// These routes require an authenticated manager
router.get("/:clerkId", authMiddleware(["manager"]), getManagerById);
router.get("/:clerkId/properties", authMiddleware(["manager"]), getManagerProperty);
router.put("/:clerkId", authMiddleware(["manager"]), updateManager);

export default router;