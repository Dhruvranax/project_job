import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import axios from "axios";
import "./Auth.css";

const API_URL = "https://project-job-i2vd.vercel.app/api";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState("Checking database...");
  const navigate = useNavigate();
  const { login } = useAdmin();

  // Check database connection on mount
  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      const response = await axios.get(`${API_URL}/`, { timeout: 3000 });
      console.log("Server check:", response.data);
      
      if (response.data.message) {
        setDbStatus(`✅ Server Connected`);
      } else {
        setDbStatus("❌ Server Not Ready");
      }
    } catch (error) {
      console.error("Server check failed:", error.message);
      setDbStatus("❌ Cannot connect to server");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }
    
    console.log("Logging in:", formData.email);
    // console.log("Using endpoint:", `${API_URL}/admin/login`);
    
    try {
      // ✅ Use the correct admin login route
      const response = await axios.post(
        `${API_URL}/admin/login`,
        {
          email: formData.email,
          password: formData.password
        },
        { timeout: 5000 }
      );
      
      console.log("Login response:", response.data);
      
      if (response.data.success) {
        const adminData = response.data.admin;
        const token = response.data.token;
        
console.log("✅ Token received:", token ? "Yes" : "No");

        // Format for context
        const formattedAdmin = {
          _id: adminData._id,
          fullName: adminData.fullName,
          email: adminData.email,
          companyName: adminData.companyName,
          role: "admin",
          token: token,
          loginTime: new Date().toISOString()
        };
        
        // ✅ Save to context
        login(formattedAdmin);
        
        // ✅ Save to localStorage for persistence
        localStorage.setItem("admin", JSON.stringify(formattedAdmin));
        localStorage.setItem("adminToken", token);
        
        // Redirect to admin dashboard
        navigate("/admin", { replace: true });
        
      } else {
        setError(response.data.message || "Login failed");
      }
      
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      
      // Show user-friendly error
      if (error.response?.status === 404 || error.response?.status === 401) {
        setError(error.response.data.message || "Invalid email or password");
      } else if (error.code === 'ECONNREFUSED') {
        setError("Server is not running. Please start backend server.");
      } else if (error.code === 'ERR_NETWORK') {
        setError("Network error. Please check your connection.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = (testEmail) => {
    setFormData({
      email: testEmail,
      password: "123456" // Default test password
    });
  };

  const checkAllAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin`);
      alert(`Total Admins in DB: ${response.data.count || 0}`);
    } catch (error) {
      alert("Cannot fetch admins list");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card admin-login-card">
        <div className="auth-header text-center">
          <h2>Admin Login</h2>
          <p className="text-muted">Login with your registered credentials</p>
          
          <div className="db-status mb-2">
            <div className={`alert ${dbStatus.includes("✅") ? "alert-success" : "alert-warning"} py-1 px-2 small mb-0`}>
              <i className={`fas ${dbStatus.includes("✅") ? "fa-check-circle" : "fa-exclamation-triangle"} me-1`}></i>
              {dbStatus}
            </div>
          </div>
        </div>
        
        <div className="auth-body">
          {error && (
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}
          
          <div className="test-credentials mb-3">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <button 
                type="button"
                className="btn btn-outline-info btn-sm"
                onClick={() => handleTestLogin("he@gmail.com")}
              >
                <i className="fas fa-user me-1"></i>
                Test: he@gmail.com
              </button>
              
              <button 
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={checkAllAdmins}
              >
                <i className="fas fa-database me-1"></i>
                Check All Admins
              </button>
            </div>
            <small className="text-muted d-block text-center mt-1">
              Test password: <strong>123456</strong>
            </small>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Admin Email</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Enter your registered email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Password</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <small className="text-muted">
                <i className="fas fa-route me-1"></i>
                Using route: <code>/api/admin/login</code>
              </small>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login to Admin Portal
                </>
              )}
            </button>
            
            <div className="separator">
              <span>or</span>
            </div>
            
            <div className="text-center mt-3">
              <p className="mb-2">New to JobFind Admin?</p>
              <Link to="/admin-register" className="btn btn-outline-primary w-100">
                <i className="fas fa-user-plus me-2"></i>
                Register as Admin
              </Link>
            </div>
          </form>
        </div>
        
        <div className="auth-footer text-center mt-3">
          <p className="text-muted small">
            <i className="fas fa-info-circle me-1"></i>
            Ensure backend server is running on port 5000
          </p>
          <p className="text-muted small">
            <i className="fas fa-route me-1"></i>
            Route: <code>POST /api/admin/login</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;