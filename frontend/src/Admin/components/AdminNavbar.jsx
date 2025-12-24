import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext"; 
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const { admin, logout } = useAdmin();
  const [adminData, setAdminData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("admin");
    setAdminData(storedAdmin ? JSON.parse(storedAdmin) : null);
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setMessagesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isLoggedIn = !!adminData;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
    setAdminData(null);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/admin-login");
  };

  const isActive = (path) => location.pathname === path;

  // Mock data
  const notifications = [
    { id: 1, text: "New job application received", time: "5 min ago", read: false },
    { id: 2, text: "Candidate profile updated", time: "1 hour ago", read: true },
    { id: 3, text: "System maintenance scheduled", time: "2 hours ago", read: false },
  ];

  const messages = [
    { id: 1, sender: "John Doe", text: "Regarding job posting", time: "10:30 AM", unread: true },
    { id: 2, sender: "HR Team", text: "Meeting scheduled", time: "Yesterday", unread: false },
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const unreadMessages = messages.filter(m => m.unread).length;

  return (
    <nav className="admin-navbar">
      <div className="navbar-container">
        {/* Left Section - Logo & Navigation */}
        <div className="navbar-left">
          {/* Logo */}
          <Link to="/admin" className="navbar-logo">
            <div className="logo-icon">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="logo-text">
              <span className="logo-main">JobFind</span>
              <span className="logo-admin">Admin</span>
            </div>
          </Link>

          {/* Navigation Links */}
          {isLoggedIn && (
            <div className="nav-menu">
              <Link 
                to="/admin" 
                className={`nav-link ${isActive("/admin") ? "active" : ""}`}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </Link>
              
              <Link 
                to="/admin/jobs" 
                className={`nav-link ${isActive("/admin/jobs") ? "active" : ""}`}
              >
                <i className="fas fa-briefcase"></i>
                <span>Jobs</span>
              </Link>
              
              <Link 
                to="/admin/candidates" 
                className={`nav-link ${isActive("/admin/candidates") ? "active" : ""}`}
              >
                <i className="fas fa-users"></i>
                <span>Candidates</span>
              </Link>
              
              <Link 
                to="/admin/analytics" 
                className={`nav-link ${isActive("/admin/analytics") ? "active" : ""}`}
              >
                <i className="fas fa-chart-line"></i>
                <span>Analytics</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right Section - User Actions */}
        <div className="navbar-right">
          {isLoggedIn ? (
            <>
              {/* Search Bar */}
              <div className="search-container">
                <i className="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Search..." 
                />
              </div>

              {/* Icons */}
              <div className="nav-icons">
                {/* Notifications */}
                <div className="nav-icon-wrapper" ref={notificationsRef}>
                  <button 
                    className="nav-icon-btn"
                    onClick={() => {
                      setNotificationsOpen(!notificationsOpen);
                      setMessagesOpen(false);
                    }}
                  >
                    <i className="fas fa-bell"></i>
                    {unreadNotifications > 0 && (
                      <span className="icon-badge">{unreadNotifications}</span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="dropdown-card notifications-dropdown">
                      <div className="dropdown-header">
                        <h4>Notifications</h4>
                        <button className="mark-read-btn">Mark all read</button>
                      </div>
                      <div className="dropdown-content">
                        {notifications.map(notif => (
                          <div key={notif.id} className="notification-item">
                            <div className="notification-icon">
                              <i className="fas fa-bell"></i>
                            </div>
                            <div className="notification-details">
                              <p className="notification-text">{notif.text}</p>
                              <span className="notification-time">{notif.time}</span>
                            </div>
                            {!notif.read && <div className="unread-dot"></div>}
                          </div>
                        ))}
                      </div>
                      <div className="dropdown-footer">
                        <Link to="/admin/notifications">View all notifications</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="nav-icon-wrapper" ref={messagesRef}>
                  <button 
                    className="nav-icon-btn"
                    onClick={() => {
                      setMessagesOpen(!messagesOpen);
                      setNotificationsOpen(false);
                    }}
                  >
                    <i className="fas fa-envelope"></i>
                    {unreadMessages > 0 && (
                      <span className="icon-badge">{unreadMessages}</span>
                    )}
                  </button>
                  
                  {messagesOpen && (
                    <div className="dropdown-card messages-dropdown">
                      <div className="dropdown-header">
                        <h4>Messages</h4>
                        <Link to="/admin/messages">View all</Link>
                      </div>
                      <div className="dropdown-content">
                        {messages.map(msg => (
                          <Link 
                            key={msg.id} 
                            to={`/admin/messages/${msg.id}`}
                            className="message-item"
                          >
                            <div className="message-avatar">
                              <i className="fas fa-user"></i>
                            </div>
                            <div className="message-details">
                              <div className="message-header">
                                <span className="message-sender">{msg.sender}</span>
                                <span className="message-time">{msg.time}</span>
                              </div>
                              <p className="message-preview">{msg.text}</p>
                            </div>
                            {msg.unread && <div className="unread-dot"></div>}
                          </Link>
                        ))}
                      </div>
                      <div className="dropdown-footer">
                        <Link to="/admin/messages/compose">New Message</Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="user-profile-wrapper" ref={dropdownRef}>
                  <button 
                    className="user-profile-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <div className="user-avatar">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className="user-info">
                      <span className="user-name">{adminData?.fullName || "Admin"}</span>
                      <span className="user-role">{adminData?.companyName || "Company Admin"}</span>
                    </div>
                    <i className={`fas fa-chevron-down dropdown-arrow ${dropdownOpen ? "rotate" : ""}`}></i>
                  </button>

                  {dropdownOpen && (
                    <div className="dropdown-card profile-dropdown">
                      <div className="profile-header">
                        <div className="dropdown-avatar">
                          <i className="fas fa-user-tie"></i>
                        </div>
                        <div className="dropdown-user-info">
                          <h4>{adminData?.fullName || "Admin"}</h4>
                          <p>{adminData?.email || "admin@example.com"}</p>
                        </div>
                      </div>
                      
                      <div className="dropdown-menu">
                        <Link to="/admin/profile" className="dropdown-item">
                          <i className="fas fa-user"></i>
                          <span>My Profile</span>
                        </Link>
                        
                        <Link to="/admin/settings" className="dropdown-item">
                          <i className="fas fa-cog"></i>
                          <span>Settings</span>
                        </Link>
                        
                        <Link to="/admin/company" className="dropdown-item">
                          <i className="fas fa-building"></i>
                          <span>Company</span>
                        </Link>
                        
                        <Link to="/admin/billing" className="dropdown-item">
                          <i className="fas fa-credit-card"></i>
                          <span>Billing</span>
                        </Link>
                        
                        <div className="dropdown-divider"></div>
                        
                        <Link to="/admin/help" className="dropdown-item">
                          <i className="fas fa-question-circle"></i>
                          <span>Help & Support</span>
                        </Link>
                        
                        <button onClick={handleLogout} className="dropdown-item logout-item">
                          <i className="fas fa-sign-out-alt"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <i className={`fas ${mobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
              </button>
            </>
          ) : (
            <div className="auth-actions">
              <Link to="/admin-login" className="login-btn">
                <i className="fas fa-sign-in-alt"></i>
                Login
              </Link>
              <Link to="/admin-register" className="register-btn">
                <i className="fas fa-user-plus"></i>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isLoggedIn && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <Link 
              to="/admin" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-tachometer-alt"></i>
              Dashboard
            </Link>
            
            <Link 
              to="/admin/jobs" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-briefcase"></i>
              Jobs
            </Link>
            
            <Link 
              to="/admin/candidates" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-users"></i>
              Candidates
            </Link>
            
            <Link 
              to="/admin/analytics" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-chart-line"></i>
              Analytics
            </Link>
            
            <Link 
              to="/admin/settings" 
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <i className="fas fa-cog"></i>
              Settings
            </Link>
            
            <button onClick={handleLogout} className="mobile-logout-btn">
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;