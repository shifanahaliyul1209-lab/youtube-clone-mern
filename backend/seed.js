import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Channel from "./models/Channel.js";
import Video from "./models/Video.js";
import Comment from "./models/Comment.js";

const BASE = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample";

// 12 sample videos across 6 categories: [title, category, file, views, likes]
const videos = [
  ["HTML and CSS Crash Course", "Web Development", "BigBuckBunny.mp4", 15200, 1023],
  ["Build a Website with React", "Web Development", "ElephantsDream.mp4", 9800, 760],
  ["JavaScript ES6 Explained", "JavaScript", "ForBiggerBlazes.mp4", 22100, 1810],
  ["Async Await Made Easy", "JavaScript", "ForBiggerEscapes.mp4", 7400, 530],
  ["Lo-fi Beats to Study", "Music", "ForBiggerFun.mp4", 51000, 4200],
  ["Acoustic Guitar Session", "Music", "ForBiggerJoyrides.mp4", 12700, 980],
  ["Top 10 Open World Games", "Gaming", "ForBiggerMeltdowns.mp4", 33400, 2700],
  ["Speedrun Highlights", "Gaming", "Sintel.mp4", 18900, 1500],
  ["Tech News This Week", "News", "SubaruOutbackOnStreetAndDirt.mp4", 6200, 410],
  ["Space Missions Update", "News", "TearsOfSteel.mp4", 8800, 650],
  ["Best Animated Shorts", "Movies", "VolkswagenGTIReview.mp4", 27300, 2100],
  ["Movie Trailer Breakdown", "Movies", "WeAreGoingOnBullrun.mp4", 14500, 1100],
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Demo creator account: demo@example.com / demo123
    let user = await User.findOne({ email: "demo@example.com" });
    if (!user) {
      user = await User.create({
        username: "democreator",
        email: "demo@example.com",
        password: await bcrypt.hash("demo123", 10),
      });
    }

    // 2. Demo channel for that user
    let channel = await Channel.findOne({ owner: user._id });
    if (!channel) {
      channel = await Channel.create({
        channelName: "Code with Shif",
        description: "Tutorials, music and more",
        owner: user._id,
      });
      await User.findByIdAndUpdate(user._id, { $push: { channels: channel._id } });
    }

    // 3. Clear this user's old videos and comments, so the seed can run again
    const old = await Video.find({ uploader: user._id });
    await Comment.deleteMany({ video: { $in: old.map((v) => v._id) } });
    await Video.deleteMany({ uploader: user._id });

    // 4. Insert the 12 videos
    const docs = await Video.insertMany(
      videos.map(([title, category, file, views, likes], i) => ({
        title,
        category,
        description: `${title} - sample video for the YouTube clone.`,
        thumbnailUrl: `https://picsum.photos/seed/yt${i}/640/360`,
        videoUrl: `${BASE}/${file}`,
        views,
        likes,
        dislikes: Math.floor(likes / 20),
        channel: channel._id,
        uploader: user._id,
      }))
    );

    // 5. Link the videos to the channel (a direct update avoids version conflicts)
    await Channel.findByIdAndUpdate(channel._id, {
      videos: docs.map((d) => d._id),
    });

    // 6. One sample comment on the first video
    await Comment.create({
      video: docs[0]._id,
      user: user._id,
      text: "Great video! Very helpful.",
    });

    console.log(`${docs.length} videos added`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();