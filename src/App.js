import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import DevEventsDashboard from "./DevEventsDashboard";
import ProjectDashboard from "./ProjectDashboard";
import StatsDashboard from "./StatsDashboard";
import ProfileDropdown from './components/ProfileDropdown';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        {/* LEFT SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">D</div>

          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "sidebar-link " + (isActive ? "sidebar-link-active" : "")
            }
          >
            🏠
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              "sidebar-link " + (isActive ? "sidebar-link-active" : "")
            }
          >
            📁
          </NavLink>
          <NavLink
            to="/stats"
            className={({ isActive }) =>
              "sidebar-link " + (isActive ? "sidebar-link-active" : "")
            }
          >
            📊
          </NavLink>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="main-area">
          {/* TOP BAR WITH PROFILE */}
          <div className="top-bar">
            <h1 className="top-bar-title">DevToolHub Dashboard</h1>
           
          </div>

          {/* PAGE CONTENT */}
          <div className="page-content">
            <Routes>
              <Route path="/" element={<DevEventsDashboard />} />
              <Route path="/projects" element={<ProjectDashboard />} />
              <Route path="/stats" element={<StatsDashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
