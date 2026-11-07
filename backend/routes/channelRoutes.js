import express from "express";
import {
  createChannel,
  getMyChannel,
  getChannelById,
} from "../controllers/channelController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createChannel); // POST /api/channels
router.get("/me", protect, getMyChannel); // GET /api/channels/me (keep above /:id)
router.get("/:id", getChannelById); // GET /api/channels/:id

export default router;