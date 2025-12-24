import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.body.classList.add("dark-theme");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setDropdownOpen(false);
  };

  const getUserName = () => {
    if (!user) return "";
    
    // ✅ પહેલા firstName + lastName તપાસો
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    // ✅ પછી fullName તપાસો
    if (user.fullName) return user.fullName;
    // ✅ પછી name તપાસો
    if (user.name) return user.name;
    // ✅ છેલ્લે email તપાસો
    if (user.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserName();
    if (!name) return "U";
    
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.user-menu-container')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="header">
      <nav className="navbar">
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link className="navbar-brand" to="/home" onClick={closeMenu}>
            <span className="logo-text">Ladder</span>
            <span className="logo-highlight">Up</span>
            <span className="logo-badge">Jobs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
            <Link
              to="/home"
              className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/jobs"
              className={`nav-link ${
                location.pathname === "/jobs" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              Browse Jobs
            </Link>
            
            {isAuthenticated && (
              <>
                <Link
                  to="/my-applications"
                  className={`nav-link ${
                    location.pathname === "/my-applications" ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  My Applications
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${
                    location.pathname === "/profile" ? "active" : ""
                  }`}
                  onClick={closeMenu}
                >
                  Profile
                </Link>
              </>
            )}

            {/* Admin Link (if user is admin) */}
            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className={`nav-link ${
                  location.pathname.startsWith("/admin") ? "active" : ""
                }`}
                onClick={closeMenu}
              >
                Admin Dashboard
              </Link>
            )}

            <Link
              to="/contact"
              className={`nav-link ${
                location.pathname === "/contact" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              Contact
            </Link>
            <Link
              to="/about"
              className={`nav-link ${
                location.pathname === "/about" ? "active" : ""
              }`}
              onClick={closeMenu}
            >
              About
            </Link>

            {/* Theme Toggle */}
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? "☀️" : "🌙"}
            </button>

            {/* Auth Section */}
            <div className="auth-section">
              {isAuthenticated ? (
                <div className="user-menu-container">
                  <button 
                    className="user-profile-btn"
                    onClick={toggleDropdown}
                    aria-expanded={dropdownOpen}
                  >
                    <div className="user-avatar">
                      {getUserInitials()}
                    </div>
                    <span className="user-name">{getUserName()}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="user-dropdown show">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">{getUserInitials()}</div>
                        <div>
                          <strong>{getUserName()}</strong>
                          <p className="user-email">{user.email || 'No email'}</p>
                        </div>
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={closeMenu}
                      >
                        👤 My Profile
                      </Link>
                      <Link 
                        to="/my-applications" 
                        className="dropdown-item"
                        onClick={closeMenu}
                      >
                        📄 My Applications
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button 
                        onClick={handleLogout}
                        className="dropdown-item logout-btn"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="btn btn-outline-primary btn-sm"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn btn-primary btn-sm"
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            className={`hamburger ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}
    </header>
  );
};

export default Header;