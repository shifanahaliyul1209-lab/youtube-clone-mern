import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Home from "./pages/Home.jsx";

// Main layout: header on top, toggleable sidebar on the left, page on the right
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="layout">
        {sidebarOpen && <Sidebar />}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;