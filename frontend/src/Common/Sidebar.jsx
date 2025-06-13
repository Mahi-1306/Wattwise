import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  ToolOutlined
} from '@ant-design/icons';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="menu">
        <Link
          to="/dashboard"
          className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <DashboardOutlined className="icon" />
          <span className="menu-text">Dashboard</span>
        </Link>

        <Link
          to="/dashboard/addmachine"
          className={`menu-item ${location.pathname === '/dashboard/addmachine' ? 'active' : ''}`}
        >
          <ToolOutlined className="icon" />
          <span className="menu-text">Machines</span>
        </Link>

        <Link
          to="/dashboard/report"
          className={`menu-item ${location.pathname === '/dashboard/report' ? 'active' : ''}`}
        >
          <ThunderboltOutlined className="icon" />
          <span className="menu-text">Reports</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
