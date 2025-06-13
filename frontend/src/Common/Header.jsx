import React, { useState } from 'react';
import './header.css';
import { Input, Avatar } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

const Header = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState("username");
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleAvatarClick = () => {
    setShowPopup(true);
  };

  const handleLogout = () => {
    // Optionally clear any localStorage/session info
    localStorage.clear();

    setShowPopup(false);
    navigate('/'); // ✅ Redirect to login
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <div className="center-section">
            <span className="icon">⚡</span> WattWise
          </div>
          <div className="right-section">
            <Input
              placeholder="Search power terms..."
              prefix={<SearchOutlined />}
              className="search-input"
            />
            <Avatar
              className="profile"
              size="large"
              icon={<UserOutlined />}
              onClick={handleAvatarClick}
            />
          </div>
        </div>
      </header>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>User Profile</h2>
            <p>{username}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
