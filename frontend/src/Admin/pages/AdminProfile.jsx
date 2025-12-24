import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import axios from "axios";
import "./AdminProfile.css";

const API_URL = "https://project-job-i2vd.vercel.app/api";

const AdminProfile = () => {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch admin profile data
  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      
      // First try to get from localStorage
      const savedAdmin = localStorage.getItem("admin");
      if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        setProfileData(adminData);
        
        // Also try to fetch from API if token exists
        const token = localStorage.getItem("adminToken");
        if (token && adminData._id) {
          try {
            const response = await axios.get(`${API_URL}/admin/profile/${adminData._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
              setProfileData(response.data.admin);
            }
          } catch (apiError) {
            console.log("API fetch failed, using localStorage data");
          }
        }
      } else {
        // Redirect to login if no admin data
        navigate("/admin-login");
      }
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize form data when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData({
        // Personal Information
        fullName: profileData.fullName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        
        // Company Information
        companyName: profileData.companyName || "",
        companyType: profileData.companyType || "",
        companyWebsite: profileData.companyWebsite || "",
        companySize: profileData.companySize || "",
        industry: profileData.industry || "",
        
        // Company Verification
        companyPan: profileData.companyPan || "",
        gstNumber: profileData.gstNumber || "",
        
        // Company Address
        companyAddress: profileData.companyAddress || "",
        city: profileData.city || "",
        state: profileData.state || "",
        pincode: profileData.pincode || "",
        
        // Hiring Information
        hiringFrequency: profileData.hiringFrequency || "",
        teamSize: profileData.teamSize || "",
        monthlyHiringBudget: profileData.monthlyHiringBudget || "",
        
        // Preferences
        receiveUpdates: profileData.receiveUpdates !== undefined ? profileData.receiveUpdates : true
      });
    }
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("adminToken");
      
      // In real app, send to backend API
      // const response = await axios.put(`${API_URL}/admin/profile/${profileData._id}`, formData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // For now, update localStorage
      const updatedAdmin = { ...profileData, ...formData };
      localStorage.setItem("admin", JSON.stringify(updatedAdmin));
      setProfileData(updatedAdmin);
      
      setEditMode(false);
      alert("Profile updated successfully!");
      
    } catch (error) {
      setError("Failed to update profile");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock statistics data
  const stats = [
    { label: "Jobs Posted", value: "12", icon: "fas fa-briefcase", color: "blue" },
    { label: "Active Jobs", value: "5", icon: "fas fa-chart-line", color: "green" },
    { label: "Total Applications", value: "156", icon: "fas fa-users", color: "purple" },
    { label: "Profile Views", value: "1.2k", icon: "fas fa-eye", color: "orange" }
  ];

  // Company types
  const companyTypes = [
    "Private Limited",
    "Public Limited",
    "LLP (Limited Liability Partnership)",
    "Partnership",
    "Proprietorship",
    "Startup",
    "MNC (Multinational Corporation)",
    "Government",
    "NGO",
    "Other"
  ];

  // Industry types
  const industries = [
    "Information Technology",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail & E-commerce",
    "Marketing & Advertising",
    "Real Estate",
    "Hospitality",
    "Construction",
    "Automotive",
    "Agriculture",
    "Telecommunications",
    "Media & Entertainment",
    "Other"
  ];

  // Company sizes
  const companySizes = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
  ];

  // Hiring frequencies
  const hiringFrequencies = [
    "Regularly (Monthly)",
    "Occasionally (Quarterly)",
    "Seasonal",
    "Project-based",
    "Currently not hiring"
  ];

  if (loading) {
    return (
      <div className="admin-profile-loading">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="admin-profile-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>No Profile Data Found</h3>
        <p>Please login to access your profile</p>
        <button onClick={() => navigate("/admin-login")} className="btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-intro">
            <div className="profile-avatar">
              {profileData.profileImage ? (
                <img src={profileData.profileImage} alt="Profile" />
              ) : (
                <i className="fas fa-user-tie"></i>
              )}
            </div>
            <div className="profile-info">
              <h1>{profileData.fullName || "Admin"}</h1>
              <p className="profile-title">{profileData.companyName || "Company Admin"}</p>
              <p className="profile-email">
                <i className="fas fa-envelope"></i>
                {profileData.email || "No email provided"}
              </p>
              <div className="profile-badges">
                <span className="badge verified">
                  <i className="fas fa-check-circle"></i>
                  Verified Admin
                </span>
                <span className="badge member-since">
                  <i className="fas fa-calendar-alt"></i>
                  Member since {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : "Recently"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            {editMode ? (
              <div className="edit-actions">
                <button onClick={() => setEditMode(false)} className="btn-outline">
                  Cancel
                </button>
                <button onClick={handleSaveProfile} className="btn-primary" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button onClick={() => setEditMode(true)} className="btn-primary">
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div className="stat-card" key={index}>
              <div className={`stat-icon ${stat.color}`}>
                <i className={stat.icon}></i>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            <i className="fas fa-user"></i>
            Personal Info
          </button>
          <button 
            className={`tab ${activeTab === "company" ? "active" : ""}`}
            onClick={() => setActiveTab("company")}
          >
            <i className="fas fa-building"></i>
            Company Info
          </button>
          <button 
            className={`tab ${activeTab === "hiring" ? "active" : ""}`}
            onClick={() => setActiveTab("hiring")}
          >
            <i className="fas fa-briefcase"></i>
            Hiring Details
          </button>
          <button 
            className={`tab ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            <i className="fas fa-cog"></i>
            Account Settings
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="tab-content">
          {/* Personal Information Tab */}
          {activeTab === "personal" && (
            <div className="tab-pane">
              <div className="section-header">
                <h2><i className="fas fa-user"></i> Personal Information</h2>
                <p>Your personal details and contact information</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="view-field">{profileData.fullName || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="view-field email-field">
                    <i className="fas fa-envelope"></i>
                    {profileData.email}
                    <span className="field-status verified">Verified</span>
                  </div>
                  <small className="hint">Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="view-field phone-field">
                      <i className="fas fa-phone"></i>
                      {profileData.phone || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Account Created</label>
                  <div className="view-field">
                    <i className="fas fa-calendar-alt"></i>
                    {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "Not available"}
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Login</label>
                  <div className="view-field">
                    <i className="fas fa-clock"></i>
                    {profileData.loginTime ? new Date(profileData.loginTime).toLocaleString('en-IN') : "Not available"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Information Tab */}
          {activeTab === "company" && (
            <div className="tab-pane">
              <div className="section-header">
                <h2><i className="fas fa-building"></i> Company Information</h2>
                <p>Details about your company</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                    />
                  ) : (
                    <div className="view-field">{profileData.companyName || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Company Type</label>
                  {editMode ? (
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleInputChange}
                    >
                      <option value="">Select company type</option>
                      {companyTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="view-field">{profileData.companyType || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  {editMode ? (
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                    >
                      <option value="">Select industry</option>
                      {industries.map(industry => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="view-field">{profileData.industry || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Company Size</label>
                  {editMode ? (
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleInputChange}
                    >
                      <option value="">Select company size</option>
                      {companySizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="view-field">{profileData.companySize || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Company Website</label>
                  {editMode ? (
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                    />
                  ) : (
                    <div className="view-field website-field">
                      {profileData.companyWebsite ? (
                        <a href={profileData.companyWebsite} target="_blank" rel="noopener noreferrer">
                          <i className="fas fa-external-link-alt"></i>
                          {profileData.companyWebsite}
                        </a>
                      ) : "Not provided"}
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Company Address</label>
                  {editMode ? (
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      placeholder="Enter full company address"
                      rows="3"
                    />
                  ) : (
                    <div className="view-field address-field">
                      <i className="fas fa-map-marker-alt"></i>
                      {profileData.companyAddress || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>City</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  ) : (
                    <div className="view-field">{profileData.city || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>State</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter state"
                    />
                  ) : (
                    <div className="view-field">{profileData.state || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      placeholder="Enter pincode"
                    />
                  ) : (
                    <div className="view-field">{profileData.pincode || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Company PAN</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="companyPan"
                      value={formData.companyPan}
                      onChange={handleInputChange}
                      placeholder="Enter company PAN"
                    />
                  ) : (
                    <div className="view-field">{profileData.companyPan || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>GST Number</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="Enter GST number"
                    />
                  ) : (
                    <div className="view-field">{profileData.gstNumber || "Not provided"}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Hiring Details Tab */}
          {activeTab === "hiring" && (
            <div className="tab-pane">
              <div className="section-header">
                <h2><i className="fas fa-briefcase"></i> Hiring Details</h2>
                <p>Information about your hiring needs and preferences</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Hiring Frequency</label>
                  {editMode ? (
                    <select
                      name="hiringFrequency"
                      value={formData.hiringFrequency}
                      onChange={handleInputChange}
                    >
                      <option value="">Select hiring frequency</option>
                      {hiringFrequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="view-field">{profileData.hiringFrequency || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Team Size</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      placeholder="Enter team size"
                    />
                  ) : (
                    <div className="view-field">{profileData.teamSize || "Not provided"}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Monthly Hiring Budget</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="monthlyHiringBudget"
                      value={formData.monthlyHiringBudget}
                      onChange={handleInputChange}
                      placeholder="Enter monthly hiring budget"
                    />
                  ) : (
                    <div className="view-field budget-field">
                      <i className="fas fa-rupee-sign"></i>
                      {profileData.monthlyHiringBudget || "Not provided"}
                    </div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="receiveUpdates"
                      checked={formData.receiveUpdates}
                      onChange={handleInputChange}
                      disabled={!editMode}
                    />
                    <span>Receive job market updates and newsletters</span>
                  </label>
                  <small className="hint">Stay updated with latest hiring trends and platform features</small>
                </div>
              </div>

              {/* Hiring Statistics */}
              <div className="hiring-stats">
                <h3>Hiring Statistics</h3>
                <div className="stats-cards">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className="stat-details">
                      <div className="stat-value">12</div>
                      <div className="stat-label">Total Jobs Posted</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="stat-details">
                      <div className="stat-value">5</div>
                      <div className="stat-label">Active Jobs</div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <i className="fas fa-user-check"></i>
                    </div>
                    <div className="stat-details">
                      <div className="stat-value">8</div>
                      <div className="stat-label">Hired Candidates</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === "account" && (
            <div className="tab-pane">
              <div className="section-header">
                <h2><i className="fas fa-cog"></i> Account Settings</h2>
                <p>Manage your account preferences and security</p>
              </div>
              
              <div className="account-sections">
                {/* Security Settings */}
                <div className="account-section">
                  <h3><i className="fas fa-shield-alt"></i> Security Settings</h3>
                  <div className="security-actions">
                    <button className="security-btn">
                      <i className="fas fa-key"></i>
                      <div>
                        <strong>Change Password</strong>
                        <small>Update your account password</small>
                      </div>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                    
                    <button className="security-btn">
                      <i className="fas fa-mobile-alt"></i>
                      <div>
                        <strong>Two-Factor Authentication</strong>
                        <small>Add an extra layer of security</small>
                      </div>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                    
                    <button className="security-btn">
                      <i className="fas fa-history"></i>
                      <div>
                        <strong>Login Activity</strong>
                        <small>View recent login attempts</small>
                      </div>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="account-section">
                  <h3><i className="fas fa-bell"></i> Notification Preferences</h3>
                  <div className="notification-settings">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Email notifications for new applications</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Weekly hiring reports</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Platform updates and announcements</span>
                    </label>
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Marketing and promotional emails</span>
                    </label>
                  </div>
                </div>

                {/* Account Actions */}
                <div className="account-section">
                  <h3><i className="fas fa-exclamation-triangle"></i> Account Actions</h3>
                  <div className="danger-actions">
                    <button className="danger-btn">
                      <i className="fas fa-download"></i>
                      Export Account Data
                    </button>
                    <button className="danger-btn">
                      <i className="fas fa-trash-alt"></i>
                      Request Account Deletion
                    </button>
                    <button 
                      className="danger-btn logout-btn"
                      onClick={() => {
                        logout();
                        navigate("/admin-login");
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Logout from All Devices
                    </button>
                  </div>
                </div>

                {/* Account Verification Status */}
                <div className="account-section verification-status">
                  <h3><i className="fas fa-check-circle"></i> Verification Status</h3>
                  <div className="verification-items">
                    <div className="verification-item verified">
                      <i className="fas fa-check-circle"></i>
                      <div>
                        <strong>Email Verified</strong>
                        <small>Your email address is verified</small>
                      </div>
                    </div>
                    <div className="verification-item pending">
                      <i className="fas fa-clock"></i>
                      <div>
                        <strong>Company Verification</strong>
                        <small>Documents under review</small>
                      </div>
                    </div>
                    <div className="verification-item not-verified">
                      <i className="fas fa-times-circle"></i>
                      <div>
                        <strong>Phone Verification</strong>
                        <small>Phone number not verified</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;