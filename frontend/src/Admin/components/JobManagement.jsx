// components/JobManagement.jsx
import React, { useState, useEffect } from 'react';
import './JobManagement.css';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);
  const [totalApplications, setTotalApplications] = useState(0);

  // Fetch admin data from localStorage
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      try {
        const adminData = JSON.parse(savedAdmin);
        console.log("📋 Admin data from localStorage:", adminData);
        
        if (adminData && adminData._id) {
          const adminIdValue = adminData._id.toString().trim();
          console.log("✅ Admin ID to use:", adminIdValue);
          
          setAdminId(adminIdValue);
          setAdminInfo(adminData);
          fetchJobs(adminIdValue);
        } else {
          console.error("❌ No _id in admin data:", adminData);
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

  // Fetch jobs by admin ID - FIXED VERSION
  const fetchJobs = async (adminId) => {
    try {
      setLoading(true);
      
      // Ensure adminId is valid
      const adminIdStr = String(adminId).trim();
      console.log("🔄 Fetching jobs for adminId:", adminIdStr);
      
      if (!adminIdStr || adminIdStr === 'undefined' || adminIdStr === 'null') {
        console.error("❌ Invalid adminId:", adminIdStr);
        alert("Please login as admin first");
        setLoading(false);
        return;
      }
      
      // First, let's check what endpoints are available
      console.log("🔍 Testing API endpoints...");
      
      // Try the main endpoint
      const url = `http://localhost:5000/api/jobs/admin/${adminIdStr}`;
      console.log("🌐 Calling URL:", url);
      
      const response = await fetch(url);
      console.log("📡 Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Try alternative endpoints
          console.log("⚠️ Endpoint not found, trying alternatives...");
          
          // Try getAdminJobs endpoint
          const altUrl = `http://localhost:5000/api/jobs/${adminIdStr}`;
          console.log("🌐 Trying alternative URL:", altUrl);
          
          const altResponse = await fetch(altUrl);
          
          if (altResponse.ok) {
            const data = await altResponse.json();
            console.log("✅ Got jobs from alternative endpoint:", data);
            processJobData(data);
          } else {
            // Try simple getAllJobs as fallback
            console.log("🌐 Trying getAllJobs as fallback...");
            const allJobsResponse = await fetch('http://localhost:5000/api/jobs');
            
            if (allJobsResponse.ok) {
              const data = await allJobsResponse.json();
              console.log("✅ Got all jobs:", data);
              
              // Filter jobs by admin
              const adminJobs = data.jobs ? data.jobs.filter(job => 
                job.postedById === adminIdStr || 
                (job.postedByEmail && adminInfo && job.postedByEmail === adminInfo.email)
              ) : [];
              
              processJobData({
                success: true,
                jobs: adminJobs,
                admin: adminInfo
              });
            } else {
              throw new Error(`All endpoints failed. Last status: ${allJobsResponse.status}`);
            }
          }
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        console.log("✅ Got jobs from main endpoint:", data);
        processJobData(data);
      }
      
    } catch (err) {
      console.error('❌ Error fetching jobs:', err);
      
      // User-friendly error messages
      if (err.message.includes("Failed to fetch")) {
        alert("Cannot connect to server. Please check if backend is running.");
      } else if (err.message.includes("404")) {
        alert("API endpoint not found. Please check backend routes.");
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

  // Process job data from API
  const processJobData = (data) => {
    if (data.success) {
      const jobsList = data.jobs || [];
      setJobs(jobsList);
      
      // Calculate total applications
      const totalApps = jobsList.reduce((sum, job) => sum + (job.applications || 0), 0);
      setTotalApplications(totalApps);
      
      // Update admin info if available
      if (data.admin) {
        setAdminInfo(prev => ({
          ...prev,
          ...data.admin,
          totalJobs: jobsList.length
        }));
      }
      
      console.log(`✅ Processed ${jobsList.length} jobs with ${totalApps} total applications`);
    } else {
      console.error("❌ API returned success: false", data);
      setJobs([]);
      setTotalApplications(0);
    }
  };

  // Delete job
  const deleteJob = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Job deleted successfully!');
        // Refresh the jobs list
        if (adminId) {
          fetchJobs(adminId);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading jobs...</p>
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="p-8">
        <div className="alert-warning">
          Please login as admin to view jobs.
        </div>
      </div>
    );
  }

  return (
    <div className="job-management-container">
      {/* Admin Info Panel */}
      {adminInfo && (
        <div className="admin-info-panel">
          <h2 className="admin-info-title">
            {adminInfo.companyName || 'My Company'} - Job Management
          </h2>
          <p className="admin-info-details">
            Email: {adminInfo.email || 'N/A'} | 
            Active Jobs: {jobs.length} | 
            Total Applications: {totalApplications}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{jobs.length}</div>
          <div className="stat-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalApplications}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {jobs.filter(job => job.status === 'Active' || job.status === 'Published').length}
          </div>
          <div className="stat-label">Active Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {jobs.filter(job => job.status === 'Closed' || job.status === 'Expired').length}
          </div>
          <div className="stat-label">Closed Jobs</div>
        </div>
      </div>

      <h1 className="page-title">My Posted Jobs ({jobs.length})</h1>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">You haven't posted any jobs yet.</p>
          <button 
            onClick={() => window.location.href = '/admin/post-job'} 
            className="refresh-button"
          >
            ➕ Post Your First Job
          </button>
          <button 
            onClick={() => adminId && fetchJobs(adminId)} 
            className="refresh-button"
            style={{ marginTop: '1rem', backgroundColor: '#6b7280' }}
          >
            🔄 Refresh Jobs
          </button>
        </div>
      ) : (
        <>
          <div className="jobs-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card">
                {/* Job Header */}
                <div className="job-header">
                  <div className="job-title-section">
                    <h3 className="job-title-text">{job.title || job.jobTitle || 'Untitled Job'}</h3>
                    <div className="job-meta">
                      <span className={`job-type ${getJobTypeColor(job.jobType)}`}>
                        {getJobTypeDisplay(job.jobType)}
                      </span>
                      <span className={`job-status ${job.status === 'Active' || job.status === 'Published' ? 'status-active' : 'status-closed'}`}>
                        {job.status || 'Active'}
                      </span>
                    </div>
                  </div>
                  <div className="job-salary">
                    <span className="salary-amount">
                      {job.salary || job.salaryRange || 'Not specified'}
                    </span>
                    {job.salary && !job.salary.includes('/') && (
                      <span className="salary-period">/month</span>
                    )}
                  </div>
                </div>

                {/* Job Details */}
                <div className="job-details">
                  <div className="detail-item">
                    <span className="detail-label">📍 Location:</span>
                    <span className="detail-value">{job.location || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🏢 Department:</span>
                    <span className="detail-value">{job.department || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🎓 Experience:</span>
                    <span className="detail-value">{job.experience || job.experienceLevel || 'Not specified'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🎯 Applications:</span>
                    <span className="detail-value highlight">
                      {job.applications || 0} candidate{job.applications !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Job Description Preview */}
                <div className="job-description">
                  <p className="description-text">
                    {job.description || job.jobDescription
                      ? (job.description || job.jobDescription).length > 150 
                        ? `${(job.description || job.jobDescription).substring(0, 150)}...` 
                        : (job.description || job.jobDescription)
                      : 'No description available'}
                  </p>
                </div>

                {/* Job Footer */}
                <div className="job-footer">
                  <div className="job-date-info">
                    <div className="date-item">
                      <span className="date-label">Posted:</span>
                      <span className="date-value">{formatDate(job.postedDate || job.createdAt)}</span>
                    </div>
                    {job.deadline && (
                      <div className="date-item">
                        <span className="date-label">Deadline:</span>
                        <span className="date-value deadline">{formatDate(job.deadline)}</span>
                      </div>
                    )}
                  </div>

                  <div className="job-actions">
                    <button
                      onClick={() => window.location.href = `/admin/job/${job._id}/candidates`}
                      className="action-button view-candidates-btn"
                    >
                      👥 View ({job.applications || 0})
                    </button>
                    <button
                      onClick={() => window.location.href = `/admin/edit-job/${job._id}`}
                      className="action-button edit-btn"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => deleteJob(job._id)}
                      className="action-button delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                {/* Skills Tags */}
                {(job.skills && job.skills.length > 0) || (job.tags && job.tags.length > 0) ? (
                  <div className="skills-container">
                    <span className="skills-label">Required Skills:</span>
                    <div className="skills-tags">
                      {(job.skills || job.tags || []).slice(0, 4).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {(job.skills || job.tags || []).length > 4 && (
                        <span className="skill-tag more-tag">
                          +{(job.skills || job.tags || []).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {/* Refresh Button */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              onClick={() => adminId && fetchJobs(adminId)} 
              className="refresh-button"
            >
              🔄 Refresh Jobs
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