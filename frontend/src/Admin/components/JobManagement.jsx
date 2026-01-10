// components/JobManagement.jsx
import React, { useState, useEffect } from 'react';
import './JobManagement.css';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [totalApplications, setTotalApplications] = useState(0);

  // API BASE URL
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // Fetch admin data from localStorage
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        console.log("📋 Admin data from localStorage:", adminData);
        
        if (adminData && (adminData._id || adminData.email)) {
          const adminEmail = adminData.email;
          console.log("✅ Admin Email to use:", adminEmail);
          
          setAdminId(adminData._id || '');
          setAdminInfo(adminData);
          fetchJobsByEmail(adminEmail);
        } else {
          console.error("❌ No admin data found:", adminData);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Error parsing admin data:", error);
        setLoading(false);
      }
    } else {
      console.log("❌ No admin data in localStorage");
      setLoading(false);
    }
  }, []);

  // Fetch jobs by admin EMAIL - CORRECT METHOD
  const fetchJobsByEmail = async (adminEmail) => {
    try {
      setLoading(true);
      
      console.log("🔄 Fetching jobs for admin email:", adminEmail);
      
      if (!adminEmail || adminEmail === 'undefined' || adminEmail === 'null') {
        console.error("❌ Invalid admin email:", adminEmail);
        alert("Please login as admin first");
        setLoading(false);
        return;
      }
      
      // Method 1: First, get ALL jobs
      console.log("🔍 Getting all jobs...");
      
      const url = `${API_BASE_URL}/api/jobs`;
      console.log("🌐 Calling URL:", url);
      
      const response = await fetch(url);
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ Got all jobs:", data.count);
      
      if (data.success && data.jobs) {
        // Filter jobs by admin email
        const adminJobs = data.jobs.filter(job => {
          // Check multiple possible fields for admin identification
          const postedByMatch = job.postedBy === adminEmail;
          const postedByEmailMatch = job.postedByEmail === adminEmail;
          const companyNameMatch = job.companyName && adminInfo?.companyName && 
            job.companyName.toLowerCase() === adminInfo.companyName.toLowerCase();
          const adminEmailMatch = job.adminEmail === adminEmail;
          
          return postedByMatch || postedByEmailMatch || companyNameMatch || adminEmailMatch;
        });
        
        console.log(`✅ Filtered ${adminJobs.length} jobs for admin: ${adminEmail}`);
        
        setJobs(adminJobs);
        
        // Calculate total applications
        const totalApps = adminJobs.reduce((sum, job) => sum + (job.applications || 0), 0);
        setTotalApplications(totalApps);
        
        // Also fetch applications for these jobs
        fetchApplicationsForJobs(adminJobs.map(job => job._id));
        
      } else {
        console.error("❌ API returned success: false", data);
        setJobs([]);
        setTotalApplications(0);
      }
      
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      
      // User-friendly error messages
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check if backend is running.");
      } else {
        alert(`Error: ${err.message}`);
      }
      
      // Show empty state
      setJobs([]);
      setTotalApplications(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications for specific jobs
  const fetchApplicationsForJobs = async (jobIds) => {
    try {
      if (!jobIds || jobIds.length === 0) return;
      
      console.log("📊 Fetching applications for jobs:", jobIds.length);
      
      // Get all applications
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.applications) {
          // Filter applications for these job IDs
          const jobIdStrings = jobIds.map(id => id.toString());
          const jobApplications = data.applications.filter(app => 
            jobIdStrings.includes(app.jobId?.toString())
          );
          
          console.log(`📊 Found ${jobApplications.length} applications for admin's jobs`);
          
          // Update jobs with application counts
          setJobs(prevJobs => 
            prevJobs.map(job => {
              const applicationsForJob = jobApplications.filter(app => 
                app.jobId?.toString() === job._id.toString()
              );
              return {
                ...job,
                applications: applicationsForJob.length
              };
            })
          );
          
          setTotalApplications(jobApplications.length);
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // Delete job
  const deleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Job deleted successfully!');
        // Refresh the jobs list
        if (adminInfo?.email) {
          fetchJobsByEmail(adminInfo.email);
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Error deleting job');
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Error deleting job');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get job type color
  const getJobTypeColor = (type) => {
    if (!type) return 'job-type-default';
    
    switch (type.toLowerCase()) {
      case 'full-time': return 'job-type-fulltime';
      case 'part-time': return 'job-type-parttime';
      case 'contract': return 'job-type-contract';
      case 'remote': return 'job-type-remote';
      case 'internship': return 'job-type-internship';
      default: return 'job-type-default';
    }
  };

  // Get job type display text
  const getJobTypeDisplay = (type) => {
    if (!type) return 'Full-time';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Update job status
  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Status updated successfully!');
        // Update local state
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job._id === jobId ? { ...job, status: newStatus } : job
          )
        );
      } else {
        const error = await response.json();
        alert(error.message || 'Error updating status');
      }
    } catch (err) {
      console.error('Error updating job status:', err);
      alert('Error updating job status');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading your jobs...</p>
        <p className="loading-subtext">Fetching jobs for: {adminInfo?.email}</p>
      </div>
    );
  }

  if (!adminInfo) {
    return (
      <div className="p-8">
        <div className="alert-warning">
          <h3>🔒 Admin Access Required</h3>
          <p>Please login as admin to view job management dashboard.</p>
          <button 
            onClick={() => window.location.href = '/admin-login'}
            className="btn-login"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-management-container">
      {/* Admin Info Panel */}
      <div className="admin-info-panel">
        <div className="admin-header">
          <h2 className="admin-info-title">
            {adminInfo.companyName || adminInfo.fullName || 'My Company'} - Job Management
          </h2>
          <div className="admin-actions">
            <button 
              onClick={() => window.location.href = '/admin/post-job'} 
              className="btn-post-job"
            >
              ➕ Post New Job
            </button>
            <button 
              onClick={() => fetchJobsByEmail(adminInfo.email)} 
              className="btn-refresh"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
        <div className="admin-details">
          <p className="admin-info-details">
            <strong>👤 Admin:</strong> {adminInfo.fullName || 'Admin'} | 
            <strong>📧 Email:</strong> {adminInfo.email} | 
            <strong>🏢 Company:</strong> {adminInfo.companyName || 'Not specified'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card total-jobs">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{jobs.length}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
        </div>
        <div className="stat-card total-applications">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{totalApplications}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        <div className="stat-card active-jobs">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">
              {jobs.filter(job => job.status === 'Active' || job.status === 'Published').length}
            </div>
            <div className="stat-label">Active Jobs</div>
          </div>
        </div>
        <div className="stat-card closed-jobs">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <div className="stat-value">
              {jobs.filter(job => job.status === 'Closed' || job.status === 'Expired').length}
            </div>
            <div className="stat-label">Closed Jobs</div>
          </div>
        </div>
      </div>

      {/* Jobs Header */}
      <div className="jobs-header">
        <h1 className="page-title">
          <span className="title-icon">📋</span>
          My Posted Jobs ({jobs.length})
        </h1>
        <div className="jobs-actions">
          <select 
            className="status-filter"
            onChange={(e) => {
              // Filter by status
              const status = e.target.value;
              if (status === 'all') {
                fetchJobsByEmail(adminInfo.email);
              } else {
                setJobs(prev => prev.filter(job => job.status === status));
              }
            }}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3 className="empty-state-title">No Jobs Found</h3>
          <p className="empty-state-text">
            You haven't posted any jobs yet, or no jobs match your admin email.
          </p>
          <div className="empty-state-details">
            <p><strong>Admin Email:</strong> {adminInfo.email}</p>
            <p><strong>Looking for:</strong> Jobs where postedBy = {adminInfo.email}</p>
          </div>
          <div className="empty-state-actions">
            <button 
              onClick={() => window.location.href = '/admin/post-job'} 
              className="btn-primary"
            >
              ➕ Post Your First Job
            </button>
            <button 
              onClick={() => fetchJobsByEmail(adminInfo.email)} 
              className="btn-secondary"
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                {/* Job Header */}
                <div className="job-header">
                  <div className="job-title-section">
                    <h3 className="job-title-text">
                      {job.jobTitle || job.title || 'Untitled Job'}
                    </h3>
                    <div className="job-meta">
                      <span className={`job-type ${getJobTypeColor(job.jobType)}`}>
                        {getJobTypeDisplay(job.jobType)}
                      </span>
                      <div className="status-container">
                        <select
                          value={job.status || 'Active'}
                          onChange={(e) => updateJobStatus(job._id, e.target.value)}
                          className={`job-status-select ${job.status === 'Active' || job.status === 'Published' ? 'status-active' : 'status-inactive'}`}
                        >
                          <option value="Draft">📝 Draft</option>
                          <option value="Active">✅ Active</option>
                          <option value="Published">📢 Published</option>
                          <option value="Closed">🔒 Closed</option>
                          <option value="Expired">⏰ Expired</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="job-salary">
                    <span className="salary-amount">
                      {job.salary || job.salaryRange || 'Not specified'}
                    </span>
                    {job.salary && !job.salary.includes('/') && !job.salary.includes('LPA') && (
                      <span className="salary-period">/month</span>
                    )}
                  </div>
                </div>

                {/* Company and Location */}
                <div className="job-company-info">
                  <div className="company-name">
                    <span className="company-icon">🏢</span>
                    {job.companyName || adminInfo.companyName || 'Not specified'}
                  </div>
                  <div className="job-location">
                    <span className="location-icon">📍</span>
                    {job.location || 'Not specified'}
                  </div>
                </div>

                {/* Job Details */}
                <div className="job-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">🎓 Experience:</span>
                    <span className="detail-value">{job.experienceLevel || job.experience || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📅 Posted:</span>
                    <span className="detail-value">{formatDate(job.postedDate || job.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">👥 Applications:</span>
                    <span className="detail-value highlight">
                      {job.applications || 0} candidate{job.applications !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">👁️ Views:</span>
                    <span className="detail-value">{job.views || 0}</span>
                  </div>
                </div>

                {/* Job Description Preview */}
                <div className="job-description">
                  <p className="description-text">
                    {job.description || job.jobDescription
                      ? (job.description || job.jobDescription).length > 120 
                        ? `${(job.description || job.jobDescription).substring(0, 120)}...` 
                        : (job.description || job.jobDescription)
                      : 'No description available'}
                  </p>
                </div>

                {/* Skills Tags */}
                {(job.skills && job.skills.length > 0) || (job.tags && job.tags.length > 0) || job.requirements ? (
                  <div className="skills-container">
                    <span className="skills-label">Required Skills:</span>
                    <div className="skills-tags">
                      {(job.skills || job.tags || []).slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {job.requirements && (
                        <span className="skill-tag">
                          {job.requirements}
                        </span>
                      )}
                      {(job.skills || job.tags || []).length > 3 && (
                        <span className="skill-tag more-tag">
                          +{(job.skills || job.tags || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Job Footer */}
                <div className="job-footer">
                  <div className="job-actions">
                    <button
                      onClick={() => window.location.href = `/admin/job/${job._id}/candidates`}
                      className="action-button view-candidates-btn"
                      disabled={!job.applications || job.applications === 0}
                    >
                      👥 View Candidates ({job.applications || 0})
                    </button>
                    <button
                      onClick={() => window.location.href = `/admin/edit-job/${job._id}`}
                      className="action-button edit-btn"
                    >
                      ✏️ Edit Job
                    </button>
                    <button
                      onClick={() => deleteJob(job._id)}
                      className="action-button delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="summary-panel">
            <div className="summary-item">
              <strong>Total Jobs:</strong> {jobs.length}
            </div>
            <div className="summary-item">
              <strong>Total Applications:</strong> {totalApplications}
            </div>
            <div className="summary-item">
              <strong>Admin Email:</strong> {adminInfo.email}
            </div>
            <button 
              onClick={() => fetchJobsByEmail(adminInfo.email)} 
              className="summary-refresh-btn"
            >
              🔄 Refresh All Data
            </button>
          </div>
        </>
      )}

      {/* Add Job Button (Floating) */}
      <button 
        className="floating-add-btn"
        onClick={() => window.location.href = '/admin/post-job'}
        title="Post New Job"
      >
        +
      </button>
    </div>
  );
};

export default JobManagement;