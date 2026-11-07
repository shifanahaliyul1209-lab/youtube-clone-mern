import mongoose from "mongoose";
import Comment from "../models/Comment.js";
import Video from "../models/Video.js";

// GET /api/comments/video/:videoId - all comments of a video
export const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    const comments = await Comment.find({ video: videoId })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/comments/video/:videoId - add a comment (signed-in users)
export const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const comment = await Comment.create({
      video: videoId,
      user: req.user._id,
      text: text.trim(),
    });
    await comment.populate("user", "username avatar");
    res.status(201).json({ message: "Comment added", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/comments/:id - edit a comment (only its author)
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own comments" });
    }

    comment.text = text.trim();
    await comment.save();
    await comment.populate("user", "username avatar");
    res.status(200).json({ message: "Comment updated", comment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/comments/:id - delete a comment (only its author)
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};