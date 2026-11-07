import express from "express";
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
} from "../controllers/videoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getVideos); // GET /api/videos?search=&category=
router.get("/:id", getVideoById); // GET /api/videos/:id
router.post("/", protect, createVideo); // POST /api/videos
router.put("/:id", protect, updateVideo); // PUT /api/videos/:id
router.delete("/:id", protect, deleteVideo); // DELETE /api/videos/:id

export default router;