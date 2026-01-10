import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // ============================================
  // DYNAMIC API URL - LOCALHOST OR PRODUCTION
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("🔐 Logging in at:", `${API_BASE_URL}/api/users/login`);
      
      // ✅ USE DYNAMIC API URL
      const response = await axios.post(
        `${API_BASE_URL}/api/users/login`, 
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log("✅ Login response:", response.data);
      
      if (response.data.success) {
        // Save user data in context and localStorage
        if (login) {
          login(response.data.user);
        }
        
        // Show success message
        setError(''); // Clear any previous errors
        
        // Redirect based on role
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.code === 'ERR_NETWORK') {
        setError(
          <div>
            <strong>🌐 Connection Error!</strong><br/>
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
              <button 
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        );
      } else if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.message || 
                           err.response.data?.error || 
                           'Login failed. Please check your credentials.';
        
        if (err.response.status === 401) {
          setError(
            <div>
              <strong>❌ Invalid Credentials</strong><br/>
              <small className="text-muted">
                Please check your email and password.<br/>
                <Link to="/forgot-password" className="text-primary">
                  Forgot Password?
                </Link>
              </small>
            </div>
          );
        } else if (err.response.status === 404) {
          setError(
            <div>
              <strong>📧 Account Not Found</strong><br/>
              <small className="text-muted">
                No account found with this email.<br/>
                Please <Link to="/register" className="text-primary">register</Link> first.
              </small>
            </div>
          );
        } else {
          setError(`Error: ${errorMessage}`);
        }
      } else {
        setError('Login failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">Welcome Back</h2>
                  <p className="text-muted">Login to access your job portal account</p>
                </div>
                
                {/* Connection Info */}
                <div className="alert alert-info mb-4">
                  <small>
                    <strong>🔧 Development Mode:</strong> Backend URL: {API_BASE_URL}<br/>
                    {API_BASE_URL.includes('localhost') && (
                      <span className="text-muted">
                        Make sure backend is running on port 5000
                      </span>
                    )}
                  </small>
                </div>
                
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div className="flex-grow-1">{error}</div>
                    </div>
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError('')}
                    ></button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Enter your password"
                      />
                    </div>
                    <div className="text-end mt-2">
                      <Link to="/forgot-password" className="text-primary small">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login to Account
                      </>
                    )}
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <div className="separator my-4">
                    <span className="text-muted">New to Job Portal?</span>
                  </div>
                  
                  <Link to="/register" className="btn btn-outline-primary btn-lg w-100 mb-3">
                    <i className="bi bi-person-plus me-2"></i>
                    Create New Account
                  </Link>
                  
                  <div className="d-flex justify-content-center gap-3 mt-3">
                    <Link to="/" className="text-muted small">
                      <i className="bi bi-house me-1"></i>
                      Home
                    </Link>
                    <Link to="/jobs" className="text-muted small">
                      <i className="bi bi-briefcase me-1"></i>
                      Browse Jobs
                    </Link>
                    <Link to="/contact" className="text-muted small">
                      <i className="bi bi-question-circle me-1"></i>
                      Help
                    </Link>
                  </div>
                </div>
                
                {/* Demo Credentials Info */}
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>Demo Credentials:</strong> For testing, use email: demo@example.com, password: demo123
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;