import express from "express";
import { createManager, getManagerById, getManagerProperty } from "../controllers/managerController";

const router = express.Router();

router.get("/:clerkId", getManagerById);
router.get("/:clerkId/properties", getManagerProperty);
router.post("/", createManager);

export default router;