import React from 'react';
import { Outlet } from 'react-router-dom';
import '../MainLayout/layout.css';
import Header from '../Common/Header';
import Sidebar from '../Common/Sidebar';

const Layout = () => {
  return (
    <div className="layout-wrapper">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
