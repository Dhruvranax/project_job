import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    // Phone validation
    if (!formData.phone || formData.phone.length < 10) {
      setError('Please enter a valid phone number (minimum 10 digits)');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare data for API (remove confirmPassword)
      const { confirmPassword, ...registerData } = formData;
      
      console.log("📤 Registering user at:", `${API_BASE_URL}/api/users/register`);
      
      // ✅ USE DYNAMIC API URL
      const response = await axios.post(
        `${API_BASE_URL}/api/users/register`,
        registerData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log("✅ Registration response:", response.data);
      
      if (response.data.success) {
        setSuccess('Registration successful! Redirecting to payment...');
        
        // Auto login after registration
        if (response.data.user && login) {
          login(response.data.user);
        }
        
        // Redirect to payment after 2 seconds
        setTimeout(() => {
          // Choose one payment option:
          
          // Option 1: Razorpay payment link
          // window.location.href = "https://rzp.io/rzp/OtfSyE9";
          
          // Option 2: Redirect to home directly (if no payment required)
          // navigate('/home');
            navigate('/security-payment')
          // Option 3: Show payment modal
          // showPaymentModal();
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
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
                           'Registration failed. Please try again.';
        
        if (err.response.status === 400 && errorMessage.includes('already exists')) {
          setError(
            <div>
              <strong>📧 Email already registered!</strong><br/>
              <small className="text-muted">
                This email is already in use. Please <Link to="/login">login</Link> instead.
              </small>
            </div>
          );
        } else {
          setError(`Error: ${errorMessage}`);
        }
      } else {
        setError('Registration failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold mb-2">Create Account</h2>
                  <p className="text-muted">
                    Join thousands of professionals finding their dream jobs
                  </p>
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
                
                {success && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <div className="flex-grow-1">{success}</div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label fw-semibold">
                        First Name *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="John"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label fw-semibold">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email Address *
                    </label>
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
                  
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label fw-semibold">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      title="10-digit phone number"
                    />
                    <small className="text-muted">10-digit phone number without country code</small>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label fw-semibold">
                        Password *
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Minimum 6 characters"
                        minLength="6"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label fw-semibold">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        placeholder="Re-enter your password"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100 mt-3 py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Account...
                      </>
                    ) : (
                      'Create Account & Continue to Payment'
                    )}
                  </button>
                </form>
                
                <div className="mt-4 text-center">
                  <p className="mb-2 text-muted">
                    By creating an account, you agree to our 
                    <Link to="/terms" className="text-primary ms-1">Terms</Link> and 
                    <Link to="/privacy" className="text-primary ms-1">Privacy Policy</Link>
                  </p>
                  
                  <div className="separator my-4">
                    <span className="text-muted">Already have an account?</span>
                  </div>
                  
                  <Link to="/login" className="btn btn-outline-primary btn-lg w-100">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Login to Existing Account
                  </Link>
                </div>
                
                {/* Payment Info */}
                <div className="mt-4 p-3 bg-light rounded">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    <strong>Payment Information:</strong> After registration, you'll be redirected to a secure payment page (₹1 for verification). 
                    This is a one-time payment for account activation.
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

export default Register;