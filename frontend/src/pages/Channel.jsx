import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const categories = ["Web Development", "JavaScript", "Music", "Gaming", "News", "Movies"];
const emptyVideo = {
  title: "",
  description: "",
  thumbnailUrl: "",
  videoUrl: "",
  category: categories[0],
};

// Channel page: create a channel, upload videos, and edit or delete your own videos
function Channel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [channelForm, setChannelForm] = useState({ channelName: "", description: "" });
  const [videoForm, setVideoForm] = useState(emptyVideo);
  const [editingId, setEditingId] = useState(null);

  // Load the signed-in user's channel (404 means they have none yet)
  const loadChannel = async () => {
    try {
      const { data } = await api.get("/channels/me");
      setChannel(data);
    } catch (err) {
      if (err.response?.status !== 404) setError("Could not load your channel");
      setChannel(null);
    } finally {
      setLoading(false);
    }
  };

  // Only signed-in users can open this page
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadChannel();
  }, []);

  const createChannel = async (e) => {
    e.preventDefault();
    setError("");
    if (channelForm.channelName.trim().length < 3) {
      return setError("Channel name must be at least 3 characters");
    }
    try {
      await api.post("/channels", channelForm);
      setMessage("Channel created");
      await loadChannel();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the channel");
    }
  };

  // One form for both uploading a new video and saving an edited one
  const saveVideo = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    const { title, thumbnailUrl, videoUrl } = videoForm;
    if (!title.trim() || !thumbnailUrl.trim() || !videoUrl.trim()) {
      return setError("Title, thumbnail URL and video URL are required");
    }
    try {
      if (editingId) {
        await api.put(`/videos/${editingId}`, videoForm);
        setMessage("Video updated");
      } else {
        await api.post("/videos", videoForm);
        setMessage("Video uploaded");
      }
      setVideoForm(emptyVideo);
      setEditingId(null);
      await loadChannel();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the video");
    }
  };

  const startEdit = (v) => {
    setEditingId(v._id);
    setVideoForm({
      title: v.title,
      description: v.description || "",
      thumbnailUrl: v.thumbnailUrl,
      videoUrl: v.videoUrl,
      category: v.category,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteVideo = async (id) => {
    if (!window.confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${id}`);
      setMessage("Video deleted");
      await loadChannel();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the video");
    }
  };

  const handleVideoChange = (e) =>
    setVideoForm({ ...videoForm, [e.target.name]: e.target.value });

  if (loading) return <p className="message">Loading channel...</p>;

  // No channel yet: show the create-channel form
  if (!channel) {
    return (
      <div className="auth-page">
        <form className="auth-form" onSubmit={createChannel}>
          <h2>How you'll appear</h2>
          <label>Channel name</label>
          <input
            value={channelForm.channelName}
            onChange={(e) => setChannelForm({ ...channelForm, channelName: e.target.value })}
          />
          <label>Description</label>
          <input
            value={channelForm.description}
            onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
          />
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="auth-btn">Create channel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="channel-page">
      <div className="channel-banner">
        <div className="channel-avatar">{channel.channelName[0].toUpperCase()}</div>
        <div>
          <h2>{channel.channelName}</h2>
          <p>{channel.subscribers} subscribers • {channel.videos.length} videos</p>
          <p>{channel.description}</p>
        </div>
      </div>

      <form className="video-form" onSubmit={saveVideo}>
        <h3>{editingId ? "Edit video" : "Upload a video"}</h3>
        <input name="title" placeholder="Title" value={videoForm.title} onChange={handleVideoChange} />
        <input name="description" placeholder="Description" value={videoForm.description} onChange={handleVideoChange} />
        <input name="thumbnailUrl" placeholder="Thumbnail URL" value={videoForm.thumbnailUrl} onChange={handleVideoChange} />
        <input name="videoUrl" placeholder="Video URL" value={videoForm.videoUrl} onChange={handleVideoChange} />
        <select name="category" value={videoForm.category} onChange={handleVideoChange}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        {error && <p className="field-error">{error}</p>}
        {message && <p className="success-msg">{message}</p>}
        <div className="video-form-buttons">
          <button type="submit" className="auth-btn">{editingId ? "Save changes" : "Upload"}</button>
          {editingId && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditingId(null);
                setVideoForm(emptyVideo);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 className="channel-videos-title">Your videos</h3>
      {channel.videos.length === 0 && <p className="message">No videos yet.</p>}
      <div className="video-grid">
        {channel.videos.map((v) => (
          <div key={v._id} className="channel-video">
            <img src={v.thumbnailUrl} alt={v.title} loading="lazy" />
            <h4>{v.title}</h4>
            <p>{v.category} • {v.views} views</p>
            <div className="comment-actions">
              <button onClick={() => startEdit(v)}>Edit</button>
              <button onClick={() => deleteVideo(v._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Channel;