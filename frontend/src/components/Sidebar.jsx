import { Link } from "react-router-dom";

// Static sidebar (toggled from the hamburger menu in the header)
function Sidebar() {
  const items = [
    "Home", "Shorts", "Subscriptions", "History", "Playlists",
    "Watch later", "Liked videos", "Trending", "Music", "Gaming",
  ];

  return (
    <aside className="sidebar">
      {items.map((item) => (
        <Link key={item} to="/" className="sidebar-item">
          {item}
        </Link>
      ))}
    </aside>
  );
}

export default Sidebar;