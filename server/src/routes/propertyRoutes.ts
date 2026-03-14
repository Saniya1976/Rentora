import express from "express";
import { getProperties, getPropertyById, createProperty } from "../controllers/propertyController";
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.get("/", getProperties);
router.get("/:id", getPropertyById);
router.post("/", authMiddleware(["manager"]), upload.array("images"), createProperty);

export default router;