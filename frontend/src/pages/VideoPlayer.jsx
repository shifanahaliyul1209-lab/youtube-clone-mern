import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Video player page: video, details, like/dislike and comments (add, edit, delete)
function VideoPlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [reaction, setReaction] = useState({ liked: false, disliked: false });
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");

  // Load the video and its comments
  useEffect(() => {
    const load = async () => {
      try {
        setError("");
        const { data } = await api.get(`/videos/${id}`);
        setVideo(data);
        setReaction({
          liked: !!user && !!data.likedBy?.includes(user.id),
          disliked: !!user && !!data.dislikedBy?.includes(user.id),
        });
        const res = await api.get(`/comments/video/${id}`);
        setComments(res.data);
      } catch (err) {
        setError("Could not load this video");
      }
    };
    load();
  }, [id]);

  // Like or dislike (only for signed-in users)
  const react = async (type) => {
    if (!user) return navigate("/login");
    try {
      const { data } = await api.post(`/videos/${id}/${type}`);
      setVideo({ ...video, likes: data.likes, dislikes: data.dislikes });
      setReaction({ liked: data.liked, disliked: data.disliked });
    } catch (err) {
      setError("Could not save your reaction");
    }
  };

  // Add a comment
  const addComment = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/comments/video/${id}`, { text: newComment });
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add the comment");
    }
  };

  // Save an edited comment
  const saveEdit = async (commentId) => {
    try {
      const { data } = await api.put(`/comments/${commentId}`, { text: editText });
      setComments(comments.map((c) => (c._id === commentId ? data.comment : c)));
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the comment");
    }
  };

  // Delete a comment
  const removeComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the comment");
    }
  };

  if (error && !video) return <p className="message error">{error}</p>;
  if (!video) return <p className="message">Loading video...</p>;

  return (
    <div className="player-page">
      <video
        className="player"
        src={video.videoUrl}
        poster={video.thumbnailUrl}
        controls
      />

      <h2 className="player-title">{video.title}</h2>
      <p className="player-meta">
        {video.channel?.channelName} • {video.views} views
      </p>

      <div className="player-actions">
        <button
          className={reaction.liked ? "react-btn active" : "react-btn"}
          onClick={() => react("like")}
        >
          👍 {video.likes}
        </button>
        <button
          className={reaction.disliked ? "react-btn active" : "react-btn"}
          onClick={() => react("dislike")}
        >
          👎 {video.dislikes}
        </button>
      </div>

      <p className="player-desc">{video.description}</p>
      {error && <p className="field-error">{error}</p>}

      <h3 className="comments-title">{comments.length} Comments</h3>

      <form className="comment-form" onSubmit={addComment}>
        <input
          type="text"
          placeholder={user ? "Add a comment..." : "Sign in to comment"}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button type="submit">Comment</button>
      </form>

      {comments.map((c) => (
        <div key={c._id} className="comment">
          <p className="comment-user">
            @{c.user?.username} • {new Date(c.createdAt).toLocaleDateString()}
          </p>

          {editingId === c._id ? (
            <div className="comment-edit">
              <input value={editText} onChange={(e) => setEditText(e.target.value)} />
              <button onClick={() => saveEdit(c._id)}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <p>{c.text}</p>
          )}

          {user && c.user?._id === user.id && editingId !== c._id && (
            <div className="comment-actions">
              <button
                onClick={() => {
                  setEditingId(c._id);
                  setEditText(c.text);
                }}
              >
                Edit
              </button>
              <button onClick={() => removeComment(c._id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default VideoPlayer;