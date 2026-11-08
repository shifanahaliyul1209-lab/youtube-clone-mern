import { Link } from "react-router-dom";

// Shows 1200000 as 1.2M and 15200 as 15.2K
const formatViews = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
};

// One video card: thumbnail, title, channel name and views
function VideoCard({ video }) {
  return (
    <Link to={`/video/${video._id}`} className="video-card">
      <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
      <div className="video-info">
        <h3>{video.title}</h3>
        <p>{video.channel?.channelName}</p>
        <p>{formatViews(video.views)} views</p>
      </div>
    </Link>
  );
}

export default VideoCard;