import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// YouTube-style header: menu button, logo, search bar, and sign-in / user area
function Header({ onMenuClick }) {
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Search sends the term to the home page as ?search=...
  const handleSearch = (e) => {
    e.preventDefault();
    navigate(term.trim() ? `/?search=${encodeURIComponent(term.trim())}` : "/");
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onMenuClick} aria-label="Toggle sidebar">
          ☰
        </button>
        <Link to="/" className="logo">
          ▶ <span>YouTube</span>
        </Link>
      </div>

      <form className="search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="header-right">
        {user ? (
          <>
            <Link to="/channel" className="header-link">My Channel</Link>
            <span className="user-name">👤 {user.username}</span>
            <button className="signin-btn" onClick={logout}>Sign out</button>
          </>
        ) : (
          <Link to="/login" className="signin-btn">Sign in</Link>
        )}
      </div>
    </header>
  );
}

export default Header;