import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./RoleSelection.css";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [rememberChoice, setRememberChoice] = useState(false); // Changed to false by default
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    // REMOVE OR COMMENT OUT auto-redirect code
    // This is what's causing automatic redirect to /admin
    
    /*
    // Comment out this entire useEffect or remove it
    const savedRole = localStorage.getItem("userRole");
    if (savedRole && user) {
      navigate(savedRole === "admin" ? "/admin" : "/home");
    }
    */
    
    // Instead, just check if user is logged in
    if (!user) {
      // If not logged in, you might want to redirect to login
      // Or keep them on this page to choose role first
    }
  }, [user, navigate]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      alert("Please select a role to continue");
      return;
    }

    // If remember choice is checked, save preference
    if (rememberChoice && user) {
      localStorage.setItem("userRole", selectedRole);
    }

    // Update user context with selected role (temporarily)
    if (user) {
      const updatedUser = {
        ...user,
        tempRole: selectedRole
      };
      login(updatedUser);
    }

    // Redirect based on selected role
    if (selectedRole === "admin") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  const handleSkip = () => {
    // Default to user role
    if (rememberChoice && user) {
      localStorage.setItem("userRole", "user");
    }
    navigate("/home");
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="role-header text-center mb-5">
          <h1 className="display-5 fw-bold">Welcome to LadderUp</h1>
          <p className="lead text-muted">
            Choose how you want to use our platform
          </p>
        </div>

        <div className="role-options mb-5">
          <div className="row g-4">
            {/* User Role Card */}
            <div className="col-md-6">
              <div
                className={`role-card ${selectedRole === "user" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("user")}
              >
                <div className="role-icon mb-3">
                  <div className="icon-circle user-icon">
                    <i className="fas fa-user fa-3x"></i>
                  </div>
                </div>
                <h3 className="role-title">Job Seeker / User</h3>
                <p className="role-description">
                  Looking for job opportunities? Browse thousands of jobs, apply 
                  with one click, and track your applications.
                </p>
                <ul className="role-features">
                  <li><i className="fas fa-check-circle"></i> Browse job listings</li>
                  <li><i className="fas fa-check-circle"></i> Apply to jobs</li>
                  <li><i className="fas fa-check-circle"></i> Save favorite jobs</li>
                  <li><i className="fas fa-check-circle"></i> Get job alerts</li>
                  <li><i className="fas fa-check-circle"></i> Track applications</li>
                </ul>
                <div className="role-footer">
                  {selectedRole === "user" && (
                    <span className="selected-badge">
                      <i className="fas fa-check"></i> Selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Role Card */}
            <div className="col-md-6">
              <div
                className={`role-card ${selectedRole === "admin" ? "selected" : ""}`}
                onClick={() => handleRoleSelect("admin")}
              >
                <div className="role-icon mb-3">
                  <div className="icon-circle admin-icon">
                    <i className="fas fa-user-tie fa-3x"></i>
                  </div>
                </div>
                <h3 className="role-title">Recruiter / Admin</h3>
                <p className="role-description">
                  Hiring talent? Post jobs, manage applicants, and find the 
                  perfect candidates for your organization.
                </p>
                <ul className="role-features">
                  <li><i className="fas fa-check-circle"></i> Post job listings</li>
                  <li><i className="fas fa-check-circle"></i> Manage applications</li>
                  <li><i className="fas fa-check-circle"></i> View applicant profiles</li>
                  <li><i className="fas fa-check-circle"></i> Track hiring pipeline</li>
                  <li><i className="fas fa-check-circle"></i> Analytics dashboard</li>
                </ul>
                <div className="role-footer">
                  {selectedRole === "admin" && (
                    <span className="selected-badge">
                      <i className="fas fa-check"></i> Selected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remember Preference */}
        <div className="remember-choice mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberChoice"
              checked={rememberChoice}
              onChange={(e) => setRememberChoice(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="rememberChoice">
              Remember my choice for future visits
            </label>
            <small className="form-text text-muted d-block">
              You can change this anytime from your profile settings
            </small>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="role-actions">
          <div className="d-flex justify-content-between align-items-center">
            <Link
              to="/home"
              className="btn btn-outline-secondary text-decoration-none"
              onClick={handleSkip}
            >
              Skip & Browse as User
            </Link>
            
            {selectedRole ? (
              <Link
                to={selectedRole === "admin" ? "/admin" : "/home"}
                className="btn btn-primary btn-lg px-5 text-decoration-none"
                onClick={handleContinue}
              >
                Continue <i className="fas fa-arrow-right ms-2"></i>
              </Link>
            ) : (
              <button
                className="btn btn-primary btn-lg px-5"
                disabled
              >
                Select a Role First
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="help-text text-center mt-4">
          <p className="text-muted small">
            <i className="fas fa-info-circle me-1"></i>
            Don't worry! You can switch between roles anytime from the dropdown in the header.
          </p>
        </div>

        {/* Direct Links */}
        <div className="direct-links text-center mt-4">
          <p className="text-muted mb-2">Or go directly to:</p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/home" className="btn btn-sm btn-outline-primary">
              Home Page
            </Link>
            <Link to="/admin" className="btn btn-sm btn-outline-warning">
              Admin Dashboard
            </Link>
            <Link to="/jobs" className="btn btn-sm btn-outline-info">
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;