import React, { useState, useEffect, useRef } from 'react';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    // Add your logout logic here
    // Example: localStorage.clear(); window.location.href = '/login';
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Profile Menu"
      >
        <div className="profile-avatar">H</div>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <div className="profile-avatar-large">H</div>
            <div className="profile-info">
              <h3>Hemavathy</h3>
              <p>hemavathy@dev.com</p>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <button className="dropdown-item">
              <span className="dropdown-icon">👤</span>
              <span>My Profile</span>
            </button>
            <button className="dropdown-item">
              <span className="dropdown-icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button className="dropdown-item">
              <span className="dropdown-icon">📊</span>
              <span>My Dashboard</span>
            </button>
            <button className="dropdown-item">
              <span className="dropdown-icon">📈</span>
              <span>Activity Stats</span>
            </button>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-section">
            <button className="dropdown-item">
              <span className="dropdown-icon">🌙</span>
              <span>Dark Mode</span>
            </button>
            <button className="dropdown-item">
              <span className="dropdown-icon">❓</span>
              <span>Help & Support</span>
            </button>
            <button className="dropdown-item" onClick={handleLogout}>
              <span className="dropdown-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
