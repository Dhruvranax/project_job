import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import axios from "axios";
import "./Auth.css";

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

  // ============================================
  // DYNAMIC API URL - LOCALHOST OR PRODUCTION
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // Check database connection on mount
  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      console.log("🔍 Checking database at:", API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/`, { timeout: 3000 });
      console.log("✅ Server check:", response.data);
      
      if (response.data.message) {
        setDbStatus(`✅ Server Connected (${API_BASE_URL})`);
      } else {
        setDbStatus("⚠️ Server Not Ready");
      }
    } catch (error) {
      console.error("❌ Server check failed:", error.message);
      setDbStatus(`❌ Cannot connect to: ${API_BASE_URL}`);
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
    
    console.log("🔐 Logging in:", formData.email);
    console.log("🌐 Using endpoint:", `${API_BASE_URL}/api/admin/login`);
    
    try {
      // ✅ USE DYNAMIC API URL
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/login`,
        {
          email: formData.email,
          password: formData.password
        },
        { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ Login response:", response.data);
      
      if (response.data.success) {
        const adminData = response.data.admin;
        const token = response.data.token;
        
        console.log("🔑 Token received:", token ? "Yes" : "No");

        const formattedAdmin = {
          _id: adminData._id,
          fullName: adminData.fullName,
          email: adminData.email,
          companyName: adminData.companyName,
          role: "admin",
          token: token,
          loginTime: new Date().toISOString()
        };
        
        login(formattedAdmin);
        
        localStorage.setItem("admin", JSON.stringify(formattedAdmin));
        localStorage.setItem("adminToken", token);
        
        navigate("/admin", { replace: true });
        
      } else {
        setError(response.data.message || "Login failed");
      }
      
    } catch (error) {
      console.error("❌ Login error:", error);
      
      if (error.response?.status === 404 || error.response?.status === 401) {
        setError(error.response.data.message || "Invalid email or password");
      } else if (error.code === 'ERR_NETWORK') {
        setError(
          <div>
            <strong>🌐 Network Error!</strong><br/>
            <small className="text-muted">
              Cannot connect to server at: {API_BASE_URL}<br/>
              Please make sure backend is running.
            </small>
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-warning"
                onClick={() => window.open(API_BASE_URL, '_blank')}
              >
                Test Backend
              </button>
            </div>
          </div>
        );
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
      password: "123456"
    });
  };

  const checkAllAdmins = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin`);
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
          
          {/* API Info */}
          <div className="alert alert-info small py-1 px-2 mb-3">
            <i className="fas fa-server me-1"></i>
            <strong>API URL:</strong> {API_BASE_URL}
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
              
              <button 
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={checkDatabase}
              >
                <i className="fas fa-sync me-1"></i>
                Recheck Connection
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
            {API_BASE_URL.includes('localhost') 
              ? 'Ensure backend server is running on port 5000' 
              : 'Connected to production server'}
          </p>
          <p className="text-muted small">
            <i className="fas fa-route me-1"></i>
            Route: <code>POST {API_BASE_URL}/api/admin/login</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;