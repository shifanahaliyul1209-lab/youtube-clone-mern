import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api.js";
import VideoCard from "../components/VideoCard.jsx";

// 6 category filters plus "All"
const categories = ["All", "Web Development", "JavaScript", "Music", "Gaming", "News", "Movies"];

// Home page: filter buttons and a grid of videos
function Home() {
  const [videos, setVideos] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  // Reload the videos whenever the search text or the category changes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/videos", { params: { search, category } });
        setVideos(data);
      } catch (err) {
        setError("Could not load videos. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category]);

  return (
    <div>
      <div className="filters">
        {categories.map((c) => (
          <button
            key={c}
            className={c === category ? "filter active" : "filter"}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && <p className="message">Loading videos...</p>}
      {error && <p className="message error">{error}</p>}
      {!loading && !error && videos.length === 0 && (
        <p className="message">No videos found.</p>
      )}

      <div className="video-grid">
        {videos.map((v) => (
          <VideoCard key={v._id} video={v} />
        ))}
      </div>
    </div>
  );
}

export default Home;