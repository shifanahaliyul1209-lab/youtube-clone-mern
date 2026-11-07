import express from "express";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/video/:videoId", getComments); // GET /api/comments/video/:videoId
router.post("/video/:videoId", protect, addComment); // POST /api/comments/video/:videoId
router.put("/:id", protect, updateComment); // PUT /api/comments/:id
router.delete("/:id", protect, deleteComment); // DELETE /api/comments/:id

export default router;