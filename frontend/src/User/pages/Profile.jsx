import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, isAuthenticated, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    resume: ''
  });

  // Load user data on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData();
      loadApplications();
    }
  }, [isAuthenticated, user]);

  const loadUserData = () => {
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      skills: user.skills ? user.skills.join(', ') : '',
      experience: user.experience || '',
      education: user.education || '',
      resume: user.resume || ''
    });
  };

  const loadApplications = async () => {
    if (!user?._id) return;
    
    try {
      const response = await axios.get(
        `https://project-job-i2vd.vercel.app/api/jobs/user/applications/${user._id}`
      );
      if (response.data.success) {
        setApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const response = await axios.get('https://project-job-i2vd.vercel.app/api/jobs');
      if (response.data.success) {
        setJobs(response.data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      // Format skills as array
      const dataToSend = {
        ...profileData,
        skills: profileData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      };

      // In a real app, you would have a user update API endpoint
      // For now, we'll update localStorage and context
      const updatedUser = {
        ...user,
        ...dataToSend
      };

      // Update context
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 9999);

    } catch (error) {
      console.error('Update error:', error);
      setError(error.response?.data?.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real app, upload to server
    // For demo, we'll simulate upload
    setUpdating(true);
    
    setTimeout(() => {
      const resumeUrl = `https://example.com/resumes/${file.name}`;
      setProfileData(prev => ({ ...prev, resume: resumeUrl }));
      
      // Update user in context
      const updatedUser = { ...user, resume: resumeUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Resume uploaded successfully!');
      setUpdating(false);
      
      setTimeout(() => setSuccess(''), 3000);
    }, 1500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getApplicationStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { class: 'warning', text: 'Pending' },
      'Reviewed': { class: 'info', text: 'Reviewed' },
      'Shortlisted': { class: 'primary', text: 'Shortlisted' },
      'Rejected': { class: 'danger', text: 'Rejected' },
      'Accepted': { class: 'success', text: 'Accepted' }
    };
    
    const config = statusConfig[status] || { class: 'secondary', text: status };
    return <span className={`badge bg-${config.class}`}>{config.text}</span>;
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="container py-5">
          <div className="card shadow text-center">
            <div className="card-body py-5">
              <h4 className="mb-3">Authentication Required</h4>
              <p className="text-muted mb-4">Please login to view your profile</p>
              <a href="/login" className="btn btn-primary">Login</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="profile-avatar me-4">
                    <div className="avatar-circle">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h2 className="mb-1">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-muted mb-1">
                      <i className="bi bi-envelope me-2"></i>
                      {user.email}
                    </p>
                    <p className="text-muted mb-0">
                      <i className="bi bi-telephone me-2"></i>
                      {user.phone || 'No phone number'}
                    </p>
                  </div>
                  <div className="ms-auto">
                    <span className="badge bg-success">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="nav flex-column nav-pills">
                  <button
                    className={`nav-link text-start ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </button>
                  <button
                    className={`nav-link text-start ${activeTab === 'applications' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveTab('applications');
                      loadApplications();
                    }}
                  >
                    <i className="bi bi-file-text me-2"></i>
                    Applications
                    {applications.length > 0 && (
                      <span className="badge bg-primary ms-2">{applications.length}</span>
                    )}
                  </button>
                  <button
                    className={`nav-link text-start ${activeTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setActiveTab('saved')}
                  >
                    <i className="bi bi-bookmark me-2"></i>
                    Saved Jobs
                  </button>
                  <button
                    className={`nav-link text-start ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </button>
                </div>
                
                <div className="mt-4 pt-3 border-top">
                  <div className="text-center">
                    <p className="mb-2">
                      <strong>Member since</strong><br />
                      {formatDate(user.createdAt)}
                    </p>
                    <a href="/jobs" className="btn btn-outline-primary w-100">
                      <i className="bi bi-search me-2"></i>
                      Browse Jobs
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9">
            {/* Alerts */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
                {error}
                <button type="button" className="btn-close" onClick={() => setError('')}></button>
              </div>
            )}
            
            {success && (
              <div className="alert alert-success alert-dismissible fade show mb-4" role="alert">
                {success}
                <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="card shadow">
                <div className="card-body">
                  <h4 className="card-title mb-4">Edit Profile</h4>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="firstName"
                          value={profileData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="lastName"
                          value={profileData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          required
                          disabled
                        />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Phone Number *</label>
                        <input
                          type="tel"
                          className="form-control"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        name="bio"
                        rows="3"
                        value={profileData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Skills (comma separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        name="skills"
                        value={profileData.skills}
                        onChange={handleChange}
                        placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Experience</label>
                      <textarea
                        className="form-control"
                        name="experience"
                        rows="3"
                        value={profileData.experience}
                        onChange={handleChange}
                        placeholder="Describe your work experience..."
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="form-label">Education</label>
                      <textarea
                        className="form-control"
                        name="education"
                        rows="2"
                        value={profileData.education}
                        onChange={handleChange}
                        placeholder="Your educational background..."
                      />
                    </div>
                    
                    {/* Resume Upload */}
                    <div className="mb-4">
                      <label className="form-label d-block">Resume</label>
                      {profileData.resume ? (
                        <div className="d-flex align-items-center">
                          <a 
                            href={profileData.resume} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary me-3"
                          >
                            <i className="bi bi-file-text me-2"></i>
                            View Current Resume
                          </a>
                          <label className="btn btn-outline-secondary">
                            <i className="bi bi-upload me-2"></i>
                            Upload New
                            <input
                              type="file"
                              className="d-none"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="border rounded p-4 text-center">
                          <i className="bi bi-file-text display-6 text-muted mb-3 d-block"></i>
                          <p className="text-muted mb-3">No resume uploaded</p>
                          <label className="btn btn-primary">
                            <i className="bi bi-upload me-2"></i>
                            Upload Resume
                            <input
                              type="file"
                              className="d-none"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </div>
                      )}
                      <small className="text-muted">Accepted formats: PDF, DOC, DOCX</small>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="card shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title mb-0">My Applications</h4>
                    <span className="badge bg-primary">{applications.length} Applications</span>
                  </div>
                  
                  {applications.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Job Title</th>
                            <th>Company</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => (
                            <tr key={app.applicationId}>
                              <td>
                                <strong>{app.jobTitle}</strong><br />
                                <small className="text-muted">{app.location}</small>
                              </td>
                              <td>{app.companyName}</td>
                              <td>{formatDate(app.appliedAt)}</td>
                              <td>{getApplicationStatusBadge(app.status)}</td>
                              <td>
                                <a 
                                  href={`/jobs/${app.jobId}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  View Job
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-file-text display-1 text-muted mb-3"></i>
                      <h5 className="mb-3">No Applications Yet</h5>
                      <p className="text-muted mb-4">
                        You haven't applied to any jobs yet. Start exploring opportunities!
                      </p>
                      <a href="/jobs" className="btn btn-primary">
                        <i className="bi bi-search me-2"></i>
                        Browse Jobs
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Saved Jobs Tab */}
            {activeTab === 'saved' && (
              <div className="card shadow">
                <div className="card-body">
                  <h4 className="card-title mb-4">Saved Jobs</h4>
                  
                  <div className="text-center py-5">
                    <i className="bi bi-bookmark display-1 text-muted mb-3"></i>
                    <h5 className="mb-3">No Saved Jobs</h5>
                    <p className="text-muted mb-4">
                      Save jobs that interest you to apply later.
                    </p>
                    <a href="/jobs" className="btn btn-primary">
                      <i className="bi bi-search me-2"></i>
                      Browse Jobs to Save
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="card shadow">
                <div className="card-body">
                  <h4 className="card-title mb-4">Account Settings</h4>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Account Security</h5>
                    <div className="card border">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">Password</h6>
                            <p className="text-muted mb-0">Change your password regularly</p>
                          </div>
                          <button className="btn btn-outline-primary">
                            Change Password
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Email Preferences</h5>
                    <div className="card border">
                      <div className="card-body">
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="jobAlerts"
                            defaultChecked
                          />
                          <label className="form-check-label" htmlFor="jobAlerts">
                            Job Alert Notifications
                          </label>
                        </div>
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="applicationUpdates"
                            defaultChecked
                          />
                          <label className="form-check-label" htmlFor="applicationUpdates">
                            Application Status Updates
                          </label>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="newsletter"
                            defaultChecked
                          />
                          <label className="form-check-label" htmlFor="newsletter">
                            Newsletter
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="mb-3">Privacy Settings</h5>
                    <div className="card border">
                      <div className="card-body">
                        <div className="form-check form-switch mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="profileVisibility"
                            defaultChecked
                          />
                          <label className="form-check-label" htmlFor="profileVisibility">
                            Make Profile Visible to Employers
                          </label>
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="resumeVisibility"
                            defaultChecked
                          />
                          <label className="form-check-label" htmlFor="resumeVisibility">
                            Make Resume Visible to Employers
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <button className="btn btn-primary me-2">Save Preferences</button>
                    <button className="btn btn-outline-danger">Deactivate Account</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;