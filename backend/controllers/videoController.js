import mongoose from "mongoose";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import Comment from "../models/Comment.js";

// GET /api/videos?search=react&category=JavaScript
export const getVideos = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Search by title (case-insensitive)
    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.title = { $regex: safe, $options: "i" };
    }
    // Filter by category ("All" means no filter)
    if (category && category !== "All") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    const videos = await Video.find(filter)
      .populate("channel", "channelName")
      .sort({ createdAt: -1 });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/videos/:id - one video (adds 1 view)
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .populate("channel", "channelName subscribers");
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/videos - upload a video to the user's channel
export const createVideo = async (req, res) => {
  try {
    const { title, description = "", thumbnailUrl, videoUrl, category } = req.body;

    if (!title || !thumbnailUrl || !videoUrl || !category) {
      return res
        .status(400)
        .json({ message: "Title, thumbnailUrl, videoUrl and category are required" });
    }

    // A video must belong to a channel
    const channel = await Channel.findOne({ owner: req.user._id });
    if (!channel) {
      return res.status(400).json({ message: "Create a channel first" });
    }

    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      category,
      channel: channel._id,
      uploader: req.user._id,
    });

    channel.videos.push(video._id);
    await channel.save();

    res.status(201).json({ message: "Video uploaded", video });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/videos/:id - edit a video (only its uploader)
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own videos" });
    }

    // Only these fields can be edited
    const { title, description, thumbnailUrl, videoUrl, category } = req.body;
    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl;
    if (videoUrl !== undefined) video.videoUrl = videoUrl;
    if (category !== undefined) video.category = category;

    await video.save();
    res.status(200).json({ message: "Video updated", video });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE /api/videos/:id - delete a video (only its uploader)
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own videos" });
    }

    await Video.findByIdAndDelete(id);
    await Channel.findByIdAndUpdate(video.channel, { $pull: { videos: video._id } });
    await Comment.deleteMany({ video: video._id }); // remove its comments too

    res.status(200).json({ message: "Video deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Like and dislike: clicking the same button again removes the reaction
const react = (type) => async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    const userId = req.user._id;
    const isLike = type === "like";
    const mine = isLike ? video.likedBy : video.dislikedBy;
    const other = isLike ? video.dislikedBy : video.likedBy;
    const field = isLike ? "likes" : "dislikes";
    const otherField = isLike ? "dislikes" : "likes";

    const already = mine.some((u) => u.toString() === userId.toString());
    const otherHad = other.some((u) => u.toString() === userId.toString());

    if (already) {
      mine.pull(userId);
      video[field] = Math.max(0, video[field] - 1);
    } else {
      mine.push(userId);
      video[field] += 1;
      if (otherHad) {
        other.pull(userId); // a user cannot like and dislike together
        video[otherField] = Math.max(0, video[otherField] - 1);
      }
    }

    await video.save();
    res.status(200).json({
      likes: video.likes,
      dislikes: video.dislikes,
      liked: video.likedBy.some((u) => u.toString() === userId.toString()),
      disliked: video.dislikedBy.some((u) => u.toString() === userId.toString()),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const likeVideo = react("like");
export const dislikeVideo = react("dislike");