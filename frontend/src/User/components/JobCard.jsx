// JobCard.jsx - Full Code with Production API URL
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './JobCard.css';

const JobCard = ({ job, onApplySuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  if (!job) {
    return (
      <div className="job-card">
        <div className="card h-100 shadow-sm">
          <div className="card-body text-center">
            <p className="text-muted">No job data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: diffDays < 365 ? undefined : 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };

  // Get job description
  const getJobDescription = () => {
    if (!job.jobDescription) {
      return 'No description available';
    }
    
    const plainText = job.jobDescription.replace(/<[^>]*>/g, '');
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
  };

  // Check if user has applied - IMPROVED
  const hasApplied = user && job.jobApplications?.some(
    app => app.userId && app.userId.toString() === user._id.toString()
  );

  // Handle apply button click - COMPLETELY FIXED with Production URL
  const handleApply = async () => {
    console.log("Apply button clicked for job:", job._id);
    console.log("User:", user);
    
    if (!isAuthenticated || !user) {
      setApplyError('Please login to apply for this job');
      return;
    }

    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      // Check if resume is available
      if (!user.resume) {
        setApplyError('Please upload your resume in profile before applying');
        setApplying(false);
        return;
      }

      // Prepare application data - Complete data
      const applicationData = {
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email,
        userPhone: user.phone || '',
        resume: user.resume,
        coverLetter: ''
      };

      console.log('Sending application data:', applicationData);
      console.log('Job ID:', job._id);

      // ✅ PRODUCTION API URL - FIXED FOR MOBILE
      const response = await axios.post(
        `https://project-job-i2vd.vercel.app/api/jobs/${job._id}/apply`,
        applicationData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Application response:', response.data);

      if (response.data.success) {
        setApplySuccess('Application submitted successfully!');
        
        // Create the new application object
        const newApplication = {
          userId: user._id,
          userEmail: user.email,
          userName: `${user.firstName} ${user.lastName}`,
          userPhone: user.phone || '',
          resume: user.resume,
          coverLetter: '',
          status: "Pending",
          appliedAt: new Date().toISOString()
        };
        
        // Call parent callback if provided
        if (onApplySuccess) {
          onApplySuccess(job._id, newApplication);
        }
        
        // Refresh after success
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setApplyError(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Detailed apply error:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response error:', error.response.data);
        console.error('Response status:', error.response.status);
        
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            'Error submitting application';
        setApplyError(errorMessage);
        
        // If already applied error
        if (error.response.data?.message?.includes('already applied')) {
          // Update UI to show already applied
          window.location.reload();
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setApplyError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
        setApplyError('Error: ' + error.message);
      }
    } finally {
      setApplying(false);
    }
  };

  // Get job title
  const getJobTitle = () => {
    return job.jobTitle || 'Untitled Job';
  };

  // Get company name
  const getCompanyName = () => {
    return job.companyName || 'Unknown Company';
  };

  // Get job type
  const getJobType = () => {
    return job.jobType || 'Not specified';
  };

  // Get location
  const getLocation = () => {
    return job.location || 'Location not specified';
  };

  // Get salary range
  const getSalaryRange = () => {
    return job.salaryRange || 'Salary negotiable';
  };

  // Get views count
  const getViews = () => {
    return job.views || 0;
  };

  // Get applications count
  const getApplications = () => {
    return job.applications || 0;
  };

  return (
    <div className="job-card">
      <div className="card h-100 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 className="card-title mb-1">
                <Link to={`/jobs/${job._id}`} className="text-decoration-none text-dark">
                  {getJobTitle()}
                </Link>
              </h5>
              <h6 className="card-subtitle text-primary">
                {getCompanyName()}
              </h6>
            </div>
            {job.companyLogo && (
              <div className="company-logo">
                <img 
                  src={job.companyLogo} 
                  alt={getCompanyName()}
                  className="img-fluid"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="logo-placeholder">
                        ${getCompanyName().charAt(0)}
                      </div>
                    `;
                  }}
                />
              </div>
            )}
          </div>
          
          <div className="job-meta mb-3">
            <span className="badge bg-light text-dark me-2">
              <i className="bi bi-briefcase me-1"></i>
              {getJobType()}
            </span>
            <span className="badge bg-light text-dark me-2">
              <i className="bi bi-geo-alt me-1"></i>
              {getLocation()}
            </span>
            {job.experienceLevel && (
              <span className="badge bg-light text-dark">
                <i className="bi bi-person-badge me-1"></i>
                {job.experienceLevel}
              </span>
            )}
          </div>
          
          <div className="salary mb-3">
            <strong className="text-success">
              <i className="bi bi-cash me-1"></i>
              {getSalaryRange()} {job.currency ? `(${job.currency})` : ''}
            </strong>
          </div>
          
          <div className="job-description mb-3">
            <p className="text-muted small">
              {getJobDescription()}
            </p>
          </div>
          
          <div className="job-stats d-flex justify-content-between text-muted small mb-3">
            <div>
              <i className="bi bi-eye me-1"></i>
              {getViews()} views
            </div>
            <div>
              <i className="bi bi-people me-1"></i>
              {getApplications()} applicants
            </div>
            <div>
              <i className="bi bi-clock me-1"></i>
              {formatDate(job.postedDate || job.createdAt)}
            </div>
          </div>
          
          {/* Alerts */}
          {applyError && (
            <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
              <small>{applyError}</small>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setApplyError('')}
              ></button>
            </div>
          )}
          
          {applySuccess && (
            <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
              <small>{applySuccess}</small>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setApplySuccess('')}
              ></button>
            </div>
          )}
          
          <div className="d-flex justify-content-between align-items-center">
            <Link to={`/jobs/${job._id}`} className="btn btn-outline-primary btn-sm">
              View Details
            </Link>
            
            {isAuthenticated ? (
              hasApplied ? (
                <span className="badge bg-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Applied
                </span>
              ) : (
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Applying...
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              )
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm">
                Login to Apply
              </Link>
            )}
            
            {(job.isUrgent || job.isFeatured) && (
              <div>
                {job.isUrgent && (
                  <span className="badge bg-danger me-1">Urgent</span>
                )}
                {job.isFeatured && (
                  <span className="badge bg-warning">Featured</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;