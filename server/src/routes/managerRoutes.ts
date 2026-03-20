import express from "express";
import { createManager, getManagerById, getManagerProperty, updateManager } from "../controllers/managerController";

const router = express.Router();

router.get("/:clerkId", getManagerById);
router.get("/:clerkId/properties", getManagerProperty);
router.post("/", createManager);
router.put("/:clerkId", updateManager);

export default router;