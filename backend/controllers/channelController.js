import mongoose from "mongoose";
import Channel from "../models/Channel.js";
import User from "../models/User.js";

// POST /api/channels - create a channel (signed-in users only)
export const createChannel = async (req, res) => {
  try {
    const { channelName, description = "", channelBanner = "" } = req.body;

    if (!channelName || channelName.trim().length < 3) {
      return res.status(400).json({ message: "Channel name must be at least 3 characters" });
    }

    // One channel per user keeps things simple
    const existing = await Channel.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(400).json({ message: "You already have a channel" });
    }

    const channel = await Channel.create({
      channelName: channelName.trim(),
      description,
      channelBanner,
      owner: req.user._id,
    });

    await User.findByIdAndUpdate(req.user._id, { $push: { channels: channel._id } });

    res.status(201).json({ message: "Channel created", channel });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/channels/me - the signed-in user's channel with its videos
export const getMyChannel = async (req, res) => {
  try {
    const channel = await Channel.findOne({ owner: req.user._id }).populate("videos");
    if (!channel) {
      return res.status(404).json({ message: "You have not created a channel yet" });
    }
    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /api/channels/:id - any channel with its videos
export const getChannelById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }

    const channel = await Channel.findById(id).populate("videos");
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    res.status(200).json(channel);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};