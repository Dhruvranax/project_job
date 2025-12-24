import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminFooter from './AdminFooter';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-main">
        <div className="container-fluid py-4">
          <Outlet />
      <AdminFooter />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;