import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VideoPlayer from "./pages/VideoPlayer.jsx";
import Channel from "./pages/Channel.jsx";
// Main layout: header on top, toggleable sidebar on the left, page on the right
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="layout">
        {sidebarOpen && <Sidebar />}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/video/:id" element={<VideoPlayer />} />
            <Route path="/channel" element={<Channel />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;