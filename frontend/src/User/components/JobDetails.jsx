import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./JobDetails.css";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [application, setApplication] = useState({
    resume: user?.resume || "",
    coverLetter: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAdminJob, setIsAdminJob] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  
  // API Base URL
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";
  
  // Helper function to render content (array or string)
  const renderContent = (content) => {
    if (!content) return <p className="no-content">No content available.</p>;
    
    if (Array.isArray(content)) {
      return (
        <ul>
          {content.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof content === 'string') {
      return <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }} />;
    }
    
    if (typeof content === 'object') {
      return (
        <ul>
          {Object.values(content).map((value, index) => (
            <li key={index}>{value}</li>
          ))}
        </ul>
      );
    }
    
    return <p className="no-content">No content available.</p>;
  };
  
  // Helper function for skills
  const renderSkills = (skills) => {
    if (!skills) return null;
    
    if (Array.isArray(skills)) {
      return skills.map((skill, index) => (
        <span key={index} className="skill-tag">{skill}</span>
      ));
    }
    
    if (typeof skills === 'string') {
      return skills.split(',').map((skill, index) => (
        <span key={index} className="skill-tag">{skill.trim()}</span>
      ));
    }
    
    return null;
  };
  
  // Check if user is admin from localStorage
  const getAdminData = () => {
    try {
      const savedAdmin = localStorage.getItem('admin');
      if (savedAdmin) {
        return JSON.parse(savedAdmin);
      }
    } catch (error) {
      console.error("Error parsing admin data:", error);
    }
    return null;
  };
  
  const admin = getAdminData();
  const isAdminAuthenticated = !!admin;
  
  // Fetch job details
  useEffect(() => {
    fetchJobDetails();
    checkIfSaved();
  }, [id]);
  
  // Check if user has applied and if admin job
  useEffect(() => {
    if (job && user && isAuthenticated) {
      checkIfUserApplied();
      checkIfAdminJob();
    }
  }, [job, user, isAuthenticated, admin]);
  
  // Check if this is admin's own job
  const checkIfAdminJob = () => {
    if (!job || !admin) {
      setIsAdminJob(false);
      return;
    }
    
    // Check if admin posted this job
    const isOwnJob = admin.email && job.postedBy === admin.email;
    setIsAdminJob(isOwnJob);
    
    if (isOwnJob) {
      setAdminInfo({
        isOwner: true,
        canEdit: true,
        canDelete: true,
        canViewApplications: true
      });
    }
  };
  
  // Update resume field when user changes
  useEffect(() => {
    if (user?.resume) {
      setApplication(prev => ({
        ...prev,
        resume: user.resume
      }));
    }
  }, [user]);
  
  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching job details for ID: ${id}`);
      
      // First try the specific endpoint
      try {
        const response = await axios.get(`${API_BASE_URL}/api/jobs/${id}`);
        
        console.log("📊 Job details response:", response.data);
        
        if (response.data.success) {
          setJob(response.data.job);
          return;
        }
      } catch (apiError) {
        console.log("Trying alternative endpoint...");
      }
      
      // Fallback: Get all jobs and find by ID
      const allJobsResponse = await axios.get(`${API_BASE_URL}/api/jobs`);
      if (allJobsResponse.data.success) {
        const foundJob = allJobsResponse.data.jobs.find(j => j._id === id);
        if (foundJob) {
          setJob(foundJob);
        } else {
          setMessage({ 
            text: "Job not found", 
            type: "error" 
          });
        }
      }
      
    } catch (error) {
      console.error("❌ Error fetching job:", error);
      
      let errorMessage = "Failed to load job details";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "Job not found or has been removed";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      setMessage({ 
        text: errorMessage, 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfUserApplied = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/jobs/${id}/check-application/${user._id}`
      );
      
      if (response.data.success) {
        setHasApplied(response.data.hasApplied);
      }
    } catch (error) {
      console.log("Using fallback method to check application");
      
      // Fallback: Check local storage
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      setHasApplied(appliedJobs.includes(id));
    }
  };
  
  const checkIfSaved = () => {
    if (!user) return;
    
    const savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    setIsSaved(savedJobs.includes(id));
  };
  
  // Handle Save Job
  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    
    try {
      setSaving(true);
      
      let savedJobs = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      
      if (!isSaved) {
        // Add to saved
        savedJobs.push(id);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        setIsSaved(true);
        setMessage({ 
          text: "✅ Job saved successfully!", 
          type: "success" 
        });
      } else {
        // Remove from saved
        savedJobs = savedJobs.filter(jobId => jobId !== id);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        setIsSaved(false);
        setMessage({ 
          text: "Job removed from saved list", 
          type: "info" 
        });
      }
      
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      
    } catch (error) {
      console.error("Error saving job:", error);
      setMessage({ 
        text: "Failed to save job", 
        type: "error" 
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Handle Apply Now
  const handleApplyNow = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/jobs/${id}` } });
      return;
    }
    
    // Check if admin is applying to their own job
    if (isAdminJob && isAdminAuthenticated) {
      setMessage({ 
        text: "You cannot apply to your own job posting", 
        type: "warning" 
      });
      return;
    }
    
    if (hasApplied) {
      setMessage({ 
        text: "You have already applied for this job", 
        type: "warning" 
      });
      return;
    }
    
    setShowApplyModal(true);
    document.body.style.overflow = 'hidden';
  };
  
  // Close modal function
  const closeModal = () => {
    setShowApplyModal(false);
    document.body.style.overflow = 'auto';
  };
  
  // Submit Application
  const submitApplication = async () => {
    if (!isAuthenticated || !user) {
      setMessage({ 
        text: "Please login first", 
        type: "error" 
      });
      return;
    }
    
    // Check if admin applying to own job
    if (isAdminJob && isAdminAuthenticated) {
      setMessage({ 
        text: "You cannot apply to your own job posting", 
        type: "warning" 
      });
      closeModal();
      return;
    }
    
    // Validate resume
    if (!application.resume.trim()) {
      setMessage({ 
        text: "Please add your resume link", 
        type: "error" 
      });
      return;
    }
    
    try {
      setApplying(true);
      setMessage({ text: "", type: "" });
      
      // Prepare application data
      const applicationData = {
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}` || user.name || user.email.split('@')[0],
        userEmail: user.email,
        userPhone: user.phone || "",
        resume: application.resume,
        coverLetter: application.coverLetter || "",
        jobTitle: job.jobTitle,
        companyName: job.companyName
      };
      
      console.log("📤 Submitting application:", applicationData);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/jobs/${id}/apply`,
        applicationData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("✅ Application response:", response.data);
      
      if (response.data.success) {
        // Save to local storage
        let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        appliedJobs.push(id);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        
        // Update state
        setHasApplied(true);
        closeModal();
        setMessage({ 
          text: "✅ Application submitted successfully!", 
          type: "success" 
        });
        
        // Refresh job to update applications count
        fetchJobDetails();
        
        // Clear form
        setApplication({
          resume: user.resume || "",
          coverLetter: ""
        });
        
        // Hide message after 5 seconds
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 5000);
      }
      
    } catch (error) {
      console.error("❌ Application error:", error);
      
      let errorMessage = "Failed to submit application";
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        
        // If already applied, update UI
        if (error.response.data.message?.includes("already applied")) {
          setHasApplied(true);
          setMessage({ 
            text: "You have already applied for this job", 
            type: "warning" 
          });
          closeModal();
          return;
        }
      }
      
      setMessage({ 
        text: errorMessage, 
        type: "error" 
      });
      
    } finally {
      setApplying(false);
    }
  };
  
  // Admin actions
  const handleEditJob = () => {
    if (isAdminJob) {
      navigate(`/admin/edit-job/${id}`);
    }
  };
  
  const handleDeleteJob = async () => {
    if (!isAdminJob) return;
    
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/jobs/${id}`);
        
        if (response.data.success) {
          setMessage({ 
            text: "✅ Job deleted successfully!", 
            type: "success" 
          });
          setTimeout(() => navigate('/admin/jobs'), 2000);
        }
      } catch (error) {
        setMessage({ 
          text: "Failed to delete job", 
          type: "error" 
        });
      }
    }
  };
  
  const handleViewApplications = () => {
    if (isAdminJob) {
      navigate(`/admin/job/${id}/applications`);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };
  
  const formatSalary = () => {
    if (!job?.salaryRange && !job?.salary) return "Negotiable";
    
    if (job.salaryRange) {
      return `${job.salaryRange} ${job.currency || ""}`.trim();
    }
    
    return job.salary || "Negotiable";
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading job details...</p>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="error-container">
        <div className="error-icon">❌</div>
        <h2>Job Not Found</h2>
        <p>The job you are looking for does not exist or has been removed.</p>
        <button className="btn-primary" onClick={() => navigate("/jobs")}>
          Browse Jobs
        </button>
      </div>
    );
  }
  
  return (
    <div className="job-details-page">
      <div className="container">
        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            <span>{message.text}</span>
            <button 
              className="alert-close"
              onClick={() => setMessage({ text: "", type: "" })}
            >
              ×
            </button>
          </div>
        )}
        
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/jobs">Jobs</a>
          <span>/</span>
          <span>{job.jobTitle}</span>
        </div>
        
        {/* Job Header */}
        <div className="job-header-card">
          <div className="job-header-content">
            <div className="job-title-section">
              <div className="job-meta">
                {job.isFeatured && <span className="badge featured">⭐ Featured</span>}
                {job.isUrgent && <span className="badge urgent">🚨 Urgent</span>}
                <span className="badge type">{job.jobType || 'Full-time'}</span>
                <span className="badge experience">{job.experienceLevel || 'Not specified'}</span>
              </div>
              <h1>{job.jobTitle}</h1>
              <div className="company-info">
                {job.companyLogo ? (
                  <img src={job.companyLogo} alt={job.companyName} className="company-logo" />
                ) : (
                  <div className="company-logo-placeholder">
                    {job.companyName?.charAt(0) || 'C'}
                  </div>
                )}
                <div className="company-details">
                  <h2>{job.companyName}</h2>
                  <div className="company-meta">
                    <span>📍 {job.location}</span>
                    <span>💰 {formatSalary()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="job-actions-section">
              {/* Admin Controls */}
              {isAdminJob && isAdminAuthenticated && (
                <div className="admin-controls">
                  <div className="admin-badge">
                    <span>👑 Your Job Posting</span>
                  </div>
                  <div className="admin-actions">
                    <button className="btn-admin-edit" onClick={handleEditJob}>
                      ✏️ Edit Job
                    </button>
                    <button className="btn-admin-applications" onClick={handleViewApplications}>
                      👥 View Applications ({job.applications || 0})
                    </button>
                    <button className="btn-admin-delete" onClick={handleDeleteJob}>
                      🗑️ Delete Job
                    </button>
                  </div>
                </div>
              )}
              
              {/* User Actions */}
              <div className="user-actions">
                {!isAuthenticated ? (
                  <button 
                    className="btn-login-apply"
                    onClick={() => navigate("/login", { state: { from: `/jobs/${id}` } })}
                  >
                    🔐 Login to Apply
                  </button>
                ) : hasApplied ? (
                  <button className="btn-applied" disabled>
                    ✅ Applied Successfully
                  </button>
                ) : isAdminJob ? (
                  <button className="btn-own-job" disabled>
                    👑 Your Job Posting
                  </button>
                ) : (
                  <button 
                    className="btn-apply-primary"
                    onClick={handleApplyNow}
                  >
                    ⚡ Apply Now
                  </button>
                )}
                
                <button 
                  className={`btn-save ${isSaved ? 'saved' : ''}`}
                  onClick={handleSaveJob}
                  disabled={saving}
                >
                  {saving ? '⏳' : (isSaved ? '💾 Saved' : '💾 Save Job')}
                </button>
                
                <button 
                  className="btn-share"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setMessage({ text: "Link copied to clipboard!", type: "success" });
                  }}
                >
                  📤 Share Job
                </button>
              </div>
            </div>
          </div>
          
          {/* Job Stats */}
          <div className="job-stats">
            <div className="stat-item">
              <div className="stat-icon">👁️</div>
              <div className="stat-content">
                <div className="stat-value">{job.views || 0}</div>
                <div className="stat-label">Views</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{job.applications || 0}</div>
                <div className="stat-label">Applications</div>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-value">{formatDate(job.postedDate || job.createdAt)}</div>
                <div className="stat-label">Posted Date</div>
              </div>
            </div>
            {job.applicationDeadline && (
              <div className="stat-item deadline">
                <div className="stat-icon">⏰</div>
                <div className="stat-content">
                  <div className="stat-value">{formatDate(job.applicationDeadline)}</div>
                  <div className="stat-label">Application Deadline</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Job Content */}
        <div className="job-content-grid">
          <div className="job-main-content">
            {/* Job Description */}
            <div className="content-section">
              <h3>📝 Job Description</h3>
              <div className="section-content">
                {renderContent(job.jobDescription)}
              </div>
            </div>
            
            {/* Requirements */}
            {job.requirements && (
              <div className="content-section">
                <h3>✅ Requirements</h3>
                <div className="section-content">
                  {renderContent(job.requirements)}
                </div>
              </div>
            )}
            
            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="content-section">
                <h3>🎯 Key Responsibilities</h3>
                <div className="section-content">
                  {renderContent(job.responsibilities)}
                </div>
              </div>
            )}
          </div>
          
          {/* Job Sidebar */}
          <div className="job-sidebar">
            <div className="sidebar-section">
              <h3>📋 Job Details</h3>
              <div className="details-list">
                <div className="detail-item">
                  <span className="detail-label">Job Type</span>
                  <span className="detail-value">{job.jobType || 'Full-time'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience Level</span>
                  <span className="detail-value">{job.experienceLevel || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Work Location</span>
                  <span className="detail-value">{job.workLocation || job.location || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Salary Package</span>
                  <span className="detail-value">{formatSalary()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Posted By</span>
                  <span className="detail-value">{job.postedBy || 'Company'}</span>
                </div>
                {job.vacancies && (
                  <div className="detail-item">
                    <span className="detail-label">Vacancies</span>
                    <span className="detail-value">{job.vacancies}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Skills */}
            {(job.skills || job.requiredSkills) && (
              <div className="sidebar-section">
                <h3>🛠️ Required Skills</h3>
                <div className="skills-tags">
                  {renderSkills(job.skills)}
                  {renderSkills(job.requiredSkills)}
                </div>
              </div>
            )}
            
            {/* Benefits */}
            {job.benefits && (
              <div className="sidebar-section">
                <h3>🎁 Benefits & Perks</h3>
                <div className="benefits-list">
                  {renderContent(job.benefits)}
                </div>
              </div>
            )}
            
            {/* Company Info */}
            <div className="sidebar-section company-info-sidebar">
              <h3>🏢 About Company</h3>
              <div className="company-description">
                <p><strong>{job.companyName}</strong></p>
                {job.companyDescription ? (
                  <p>{renderContent(job.companyDescription)}</p>
                ) : (
                  <p>No company description available.</p>
                )}
                <div className="company-contact">
                  <p><strong>📍 Location:</strong> {job.location}</p>
                  {job.companyWebsite && (
                    <p>
                      <strong>🌐 Website:</strong> 
                      <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer">
                        {job.companyWebsite}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Apply Modal (એ જ રહે છે, કોઈ ફેરફાર નહીં) */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for: {job.jobTitle}</h2>
              <button className="modal-close" onClick={closeModal} disabled={applying}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="application-info">
                <div className="info-card">
                  <h4>📋 Application Information</h4>
                  <p>Your profile information will be sent with your application.</p>
                </div>
              </div>
              
              <div className="user-info-card">
                <h4>👤 Your Information</h4>
                <div className="user-info-grid">
                  <div className="info-field">
                    <label>Full Name</label>
                    <div className="info-value">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.name || user?.email?.split('@')[0]}
                    </div>
                  </div>
                  <div className="info-field">
                    <label>Email Address</label>
                    <div className="info-value">{user?.email}</div>
                  </div>
                  <div className="info-field">
                    <label>Phone Number</label>
                    <div className="info-value">{user?.phone || 'Not provided'}</div>
                  </div>
                  <div className="info-field">
                    <label>Resume Status</label>
                    <div className={`info-value ${user?.resume ? 'success' : 'error'}`}>
                      {user?.resume ? '✅ Uploaded' : '❌ Not Uploaded'}
                    </div>
                  </div>
                </div>
                
                {!user?.resume && (
                  <div className="resume-warning">
                    <p>⚠️ Please upload your resume to your profile before applying.</p>
                    <a href="/profile" className="profile-link">Go to Profile</a>
                  </div>
                )}
              </div>
              
              <div className="resume-input-section">
                <label>📄 Resume Link *</label>
                <input
                  type="url"
                  className="resume-input"
                  placeholder="https://drive.google.com/... or https://example.com/resume.pdf"
                  value={application.resume}
                  onChange={(e) => setApplication({...application, resume: e.target.value})}
                  disabled={!!user?.resume}
                  required
                />
                <p className="input-help">
                  {user?.resume 
                    ? "Using resume from your profile"
                    : "Upload your resume to Google Drive, Dropbox, or any cloud storage"}
                </p>
              </div>
              
              <div className="cover-letter-section">
                <label>✍️ Cover Letter (Optional)</label>
                <textarea
                  className="cover-letter-input"
                  placeholder="Why are you interested in this position? Why are you a good fit? Include any relevant experience or skills..."
                  value={application.coverLetter}
                  onChange={(e) => setApplication({...application, coverLetter: e.target.value})}
                  rows={5}
                />
                <p className="input-help">
                  💡 A good cover letter increases your chances of being selected.
                </p>
              </div>
              
              <div className="job-summary-card">
                <h4>📋 Job Summary</h4>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span>Position:</span>
                    <strong>{job.jobTitle}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Company:</span>
                    <strong>{job.companyName}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Location:</span>
                    <strong>{job.location}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Salary:</span>
                    <strong>{formatSalary()}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal} disabled={applying}>
                Cancel
              </button>
              <button 
                className="btn-submit" 
                onClick={submitApplication}
                disabled={applying || !application.resume.trim()}
              >
                {applying ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;