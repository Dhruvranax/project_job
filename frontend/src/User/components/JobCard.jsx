import React, { useState, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './JobCard.css';

const JobCard = memo(({ job, onApplySuccess, showActions = true }) => {
  const { user, isAuthenticated } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // ============================================
  // DYNAMIC API URL
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // ============================================
  // MEMOIZED HELPER FUNCTIONS
  // ============================================
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Today';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch (error) {
      return 'Today';
    }
  }, []);

  const getJobTitle = useCallback(() => job?.jobTitle || 'Job Title', [job?.jobTitle]);
  const getCompanyName = useCallback(() => job?.companyName || 'Company', [job?.companyName]);
  const getJobType = useCallback(() => job?.jobType || 'Full-time', [job?.jobType]);
  const getLocation = useCallback(() => job?.location || 'Remote', [job?.location]);
  const getExperienceLevel = useCallback(() => job?.experienceLevel || 'Not specified', [job?.experienceLevel]);
  
  const getSalary = useCallback(() => {
    const salary = job?.salaryRange || job?.salary;
    if (!salary) return '₹ Negotiable';
    
    // Format salary
    let formatted = salary.toString();
    if (!formatted.includes('₹')) {
      formatted = `₹${formatted}`;
    }
    return formatted;
  }, [job?.salaryRange, job?.salary]);

  const getSkills = useCallback(() => {
    if (!job?.skills) return '';
    if (Array.isArray(job.skills)) return job.skills.join(', ');
    return job.skills;
  }, [job?.skills]);

  // Check if user has applied
  const hasApplied = useCallback(() => {
    if (!user || !job?.jobApplications) return false;
    return job.jobApplications.some(
      app => app.userId && app.userId.toString() === user._id.toString()
    );
  }, [user, job?.jobApplications]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleClearError = useCallback(() => setApplyError(''), []);
  const handleClearSuccess = useCallback(() => setApplySuccess(''), []);

  // Apply function
  const handleApply = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setApplyError('Please login to apply');
      return;
    }

    if (hasApplied()) {
      setApplyError('You have already applied for this job');
      return;
    }

    setApplying(true);
    setApplyError('');
    setApplySuccess('');

    try {
      if (!job?._id) {
        setApplyError('Invalid job data');
        return;
      }

      if (!user.resume) {
        setApplyError('Please upload your resume first');
        return;
      }

      const applicationData = {
        userId: user._id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        userEmail: user.email || '',
        userPhone: user.phone || '',
        resume: user.resume,
        jobTitle: getJobTitle(),
        companyName: getCompanyName(),
        jobType: getJobType(),
        location: getLocation(),
        salary: getSalary(),
        jobId: job._id
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/jobs/${job._id}/apply`,
        applicationData,
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );

      if (response.data.success) {
        setApplySuccess('Application submitted successfully!');
        
        if (onApplySuccess) {
          const newApplication = {
            userId: user._id,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.email,
            status: "Pending",
            appliedAt: new Date().toISOString()
          };
          onApplySuccess(job._id, newApplication);
        }
        
        setTimeout(() => setApplySuccess(''), 3000);
      } else {
        setApplyError(response.data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Apply error:', error);
      if (error.code === 'ERR_NETWORK') {
        setApplyError('Network error. Please check your connection.');
      } else if (error.response?.status === 409) {
        setApplyError('You have already applied for this job');
      } else {
        setApplyError(error.response?.data?.message || 'Failed to apply');
      }
    } finally {
      setApplying(false);
    }
  }, [job, user, isAuthenticated, API_BASE_URL, onApplySuccess, getJobTitle, getCompanyName, getJobType, getLocation, getSalary, hasApplied]);

  // ============================================
  // RENDER
  // ============================================
  if (!job) return null;

  const jobTitle = getJobTitle();
  const companyName = getCompanyName();
  const jobType = getJobType();
  const location = getLocation();
  const experienceLevel = getExperienceLevel();
  const salary = getSalary();
  const skills = getSkills();
  const postedDate = formatDate(job.postedDate || job.createdAt);
  const appliedStatus = hasApplied();
  const views = job.views || 0;
  const applications = job.applications || 0;

  return (
    <div className="job-card-final">
      <div className="card h-100">
        <div className="card-body">
          {/* Job Title & Company - Top Section */}
          <div className="job-header mb-3">
            <h5 className="job-title mb-1">{jobTitle}</h5>
            <p className="company-name mb-0">{companyName}</p>
          </div>

          {/* Job Type, Location, Experience - Tags */}
          <div className="job-tags-row mb-3">
            <div className="d-flex flex-wrap gap-2">
              <span className="tag job-type-tag">{jobType}</span>
              <span className="tag location-tag">{location}</span>
              <span className="tag experience-tag">{experienceLevel}</span>
            </div>
          </div>

          {/* Salary Display with Pin Icon */}
          <div className="salary-row mb-3">
            <div className="salary-container">
              <span className="pin-icon">📌</span>
              <span className="salary-text">{salary}</span>
            </div>
          </div>

          {/* Skills/Description */}
          <div className="skills-row mb-3">
            <div className="skills-container">
              <span className="skills-text">{skills || jobTitle}</span>
            </div>
          </div>

          {/* Posted Date */}
          <div className="date-row mb-3">
            <span className="date-badge">{postedDate}</span>
          </div>

          {/* Views Stats */}
          <div className="stats-row mb-4">
            <div className="views-count">
              <span className="eye-icon">👁️</span>
              <span className="views-text">{views} views</span>
            </div>
          </div>

          {/* Alerts for Apply Status */}
          {showActions && applyError && (
            <div className="alert alert-danger alert-dismissible fade show mb-3" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div className="flex-grow-1">{applyError}</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClearError}
              ></button>
            </div>
          )}
          
          {showActions && applySuccess && (
            <div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill me-2"></i>
                <div className="flex-grow-1">{applySuccess}</div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClearSuccess}
              ></button>
            </div>
          )}

          {/* ACTIONS BUTTONS SECTION */}
          <div className="actions-buttons">
            {showActions ? (
              /* JobList Page - Show both buttons */
              <div className="d-flex gap-3">
                {/* Details Button - Left Side */}
                <Link 
                  to={`/jobs/${job._id}`} 
                  className="btn btn-details-final flex-fill"
                >
                  <i className="bi bi-info-circle me-2"></i>
                  Details
                </Link>
                
                {/* Apply Button - Right Side */}
                <div className="flex-fill">
                  {isAuthenticated ? (
                    appliedStatus ? (
                      <button className="btn btn-applied-final w-100" disabled>
                        <i className="bi bi-check-circle me-2"></i>
                        Applied
                      </button>
                    ) : (
                      <button 
                        className="btn btn-apply-final w-100"
                        onClick={handleApply}
                        disabled={applying}
                      >
                        {applying ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Applying...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            Apply Now
                          </>
                        )}
                      </button>
                    )
                  ) : (
                    <Link 
                      to="/login" 
                      className="btn btn-apply-final w-100"
                    >
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Login to Apply
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Home Page - Single View Details Button */
              <Link 
                to={`/jobs/${job._id}`} 
                className="btn btn-view-details w-100"
              >
                <i className="bi bi-eye me-2"></i>
                View Details
              </Link>
            )}
          </div>

          {/* Urgent/Featured Badges */}
          <div className="status-badges-final">
            {job.isUrgent && <span className="badge badge-urgent-final">🔥 Urgent</span>}
            {job.isFeatured && <span className="badge badge-featured-final">⭐ Featured</span>}
          </div>
        </div>
      </div>
    </div>
  );
});

JobCard.displayName = 'JobCard';

const areEqual = (prevProps, nextProps) => {
  if (prevProps.job?._id !== nextProps.job?._id) return false;
  if (prevProps.job?.applications !== nextProps.job?.applications) return false;
  if (prevProps.showActions !== nextProps.showActions) return false;
  return true;
};

export default React.memo(JobCard, areEqual);