import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
  
  // Fetch job details
  useEffect(() => {
    fetchJobDetails();
    checkIfSaved();
  }, [id]);
  
  // Check if user has applied
  useEffect(() => {
    if (job && user && isAuthenticated) {
      checkIfUserApplied();
    }
  }, [job, user, isAuthenticated]);
  
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
      const response = await axios.get(`https://project-job-i2vd.vercel.app/api/jobs/${id}`);
      
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      setMessage({ 
        text: "Fail to load Job Detail", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const checkIfUserApplied = async () => {
    try {
      // Try the check-application endpoint first
      try {
        const response = await axios.get(
          `https://project-job-i2vd.vercel.app/api/jobs/${id}/check-application/${user._id}`
        );
        
        if (response.data.success) {
          setHasApplied(response.data.hasApplied);
          return;
        }
      } catch (apiError) {
        console.log("Using fallback method to check application");
      }
      
      // Fallback: Check local storage or job applications
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      setHasApplied(appliedJobs.includes(id));
      
    } catch (error) {
      console.error("Error checking application status:", error);
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
          text: "✅ Job Save Sucessfully!", 
          type: "success" 
        });
      } else {
        // Remove from saved
        savedJobs = savedJobs.filter(jobId => jobId !== id);
        localStorage.setItem('savedJobs', JSON.stringify(savedJobs));
        setIsSaved(false);
        setMessage({ 
          text: "Job remove save list ", 
          type: "info" 
        });
      }
      
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      
    } catch (error) {
      console.error("Error saving job:", error);
      setMessage({ 
        text: "Fail to Save job", 
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
    
    if (hasApplied) {
      setMessage({ 
        text: "Youe alreay apply for this job", 
        type: "warning" 
      });
      return;
    }
    
    setShowApplyModal(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };
  
  // Close modal function
  const closeModal = () => {
    setShowApplyModal(false);
    // Restore body scroll
    document.body.style.overflow = 'auto';
  };
  
  // Submit Application
  const submitApplication = async () => {
    if (!isAuthenticated || !user) {
      setMessage({ 
        text: "Please Login first", 
        type: "error" 
      });
      return;
    }
    
    // Validate resume
    if (!application.resume.trim()) {
      setMessage({ 
        text: "Please add you resume link", 
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
        coverLetter: application.coverLetter || ""
      };
      
      console.log("Submitting application with data:", applicationData);
      
      // ✅ IMPORTANT: Use this API call to apply
      const response = await axios.post(
        `https://project-job-i2vd.vercel.app/api/jobs/${id}/apply`,
        applicationData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Application response:", response.data);
      
      if (response.data.success) {
        // Save to local storage
        let appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
        appliedJobs.push(id);
        localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
        
        // Update state
        setHasApplied(true);
        closeModal();
        setMessage({ 
          text: "✅ Application Submit Sucessfully!", 
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
      console.error("Application error:", error);
      
      let errorMessage = "Fail to Submit Application";
      
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
        
        // If already applied, update UI
        if (error.response.data.message?.includes("already applied")) {
          setHasApplied(true);
          setMessage({ 
            text: "Your already apply for this job", 
            type: "warning" 
          });
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
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };
  
  const formatSalary = () => {
    if (!job?.salaryRange) return "Negotiable";
    return `${job.salaryRange} ${job.currency || ""}`.trim();
  };
  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading Job details...</p>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Job not found</h4>
          <p>The job you are looking for does not exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
            Browse Job
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="job-details-page">
      <div className="container py-4">
        {/* Message Alert */}
        {message.text && (
          <div className={`alert alert-${message.type === "success" ? "success" : 
            message.type === "error" ? "danger" : 
            message.type === "warning" ? "warning" : "info"} 
            alert-dismissible fade show`}>
            {message.text}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setMessage({ text: "", type: "" })}
            ></button>
          </div>
        )}
        
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Home</a></li>
            <li className="breadcrumb-item"><a href="/jobs">Jobs</a></li>
            <li className="breadcrumb-item active">{job.jobTitle}</li>
          </ol>
        </nav>
        
        {/* Job Header */}
        <div className="card shadow mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-9">
                <h1 className="h2 mb-2">{job.jobTitle}</h1>
                <h2 className="h4 text-primary mb-3">{job.companyName}</h2>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-primary">{job.jobType}</span>
                  <span className="badge bg-info text-dark">{job.experienceLevel}</span>
                  <span className="badge bg-secondary">{job.workLocation}</span>
                  {job.isUrgent && <span className="badge bg-danger">Important </span>}
                  {job.isFeatured && <span className="badge bg-warning text-dark">featured</span>}
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>📍 Location:</strong> {job.location}</p>
                    <p><strong>💰 Salary:</strong> {formatSalary()}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>📅 Post Date:</strong> {formatDate(job.postedDate)}</p>
                    <p><strong>👁️ View:</strong> {job.views || 0}</p>
                    <p><strong>📝 Application:</strong> {job.applications || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-3 text-center">
                {job.companyLogo ? (
                  <img 
                    src={job.companyLogo} 
                    alt={job.companyName}
                    className="img-fluid mb-3"
                    style={{ maxHeight: "80px" }}
                  />
                ) : (
                  <div className="mb-3 p-3 bg-light rounded">
                    <div className="h1 text-muted">
                      {job.companyName?.charAt(0) || 'C'}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  {!isAuthenticated ? (
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate("/login", { state: { from: `/jobs/${id}` } })}
                    >
                      Login now for Apply job
                    </button>
                  ) : hasApplied ? (
                    <button className="btn btn-success" disabled>
                      ✓ Application done
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary btn-lg"
                      onClick={handleApplyNow}
                    >
                     Apply Now
                    </button>
                  )}
                  
                  <button 
                    className={`btn ${isSaved ? 'btn-warning' : 'btn-outline-primary'}`}
                    onClick={handleSaveJob}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        {isSaved ? '✓ Already saved' : 'Save Job '}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Job Description */}
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow mb-4">
              <div className="card-header bg-light">
                <h4 className="mb-0">Job description</h4>
              </div>
              <div className="card-body">
                {job.jobDescription ? (
                  <div dangerouslySetInnerHTML={{ __html: job.jobDescription.replace(/\n/g, '<br>') }} />
                ) : (
                  <p className="text-muted">No Job Description</p>
                )}
              </div>
            </div>
            
            {/* Requirements */}
            {job.requirements && job.requirements.trim() && (
              <div className="card shadow mb-4">
                <div className="card-header bg-light">
                  <h4 className="mb-0">Requirements</h4>
                </div>
                <div className="card-body">
                  <div dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br>') }} />
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="col-lg-4">
            <div className="card shadow mb-4">
              <div className="card-header bg-light">
                <h4 className="mb-0">Job Description</h4>
              </div>
              <div className="card-body">
                <ul className="list-unstyled">
                  <li className="mb-2"><strong>Job Type:</strong> {job.jobType}</li>
                  <li className="mb-2"><strong>Experience:</strong> {job.experienceLevel}</li>
                  <li className="mb-2"><strong>Location:</strong> {job.location}</li>
                  <li className="mb-2"><strong>Type Of Work:</strong> {job.workLocation}</li>
                  <li className="mb-2"><strong>Salary:</strong> {formatSalary()}</li>
                  {job.applicationDeadline && (
                    <li className="mb-2"><strong>Last Date:</strong> {formatDate(job.applicationDeadline)}</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Apply Modal */}
      {showApplyModal && (
        <>
          <div 
            className="modal-backdrop fade show" 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1040
            }}
            onClick={closeModal}
          ></div>
          
          <div 
            className="modal fade show d-block" 
            tabIndex="-1"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1050,
              width: '100%',
              maxWidth: '800px',
              outline: 0
            }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    Apply For This: {job.jobTitle}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={closeModal}
                    disabled={applying}
                  ></button>
                </div>
                
                <div className="modal-body">
                  {/* Application Info */}
                  <div className="alert alert-info mb-4">
                    <h6 className="mb-1">📋 Application Information</h6>
                    <p className="mb-0">Your profile Information send will your application.</p>
                  </div>
                  
                  {/* User Information */}
                  <div className="card mb-4">
                    <div className="card-header">
                      <h6 className="mb-0">👤 Your information</h6>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Name</label>
                          <div className="form-control bg-light">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user?.name || user?.email?.split('@')[0]}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Email</label>
                          <div className="form-control bg-light">
                            {user?.email}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Phone no</label>
                          <div className="form-control bg-light">
                            {user?.phone || "પ્રદાન કરેલ નથી"}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted small">Resume Status</label>
                          <div className={`form-control ${user?.resume ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                            {user?.resume ? (
                              <>
                                <i className="bi bi-check-circle me-1"></i>
                                Uploaded
                              </>
                            ) : (
                              <>
                                <i className="bi bi-exclamation-circle me-1"></i>
                                Not Uploaded
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {!user?.resume && (
                        <div className="alert alert-warning mt-2">
                          <small>
                            <i className="bi bi-exclamation-triangle me-1"></i>
                            Please Upload Your Resume To Your Profile Before Applying.
                            <a href="/profile" className="alert-link ms-1">Go To Profile</a>
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Resume Link Input */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      📄 Your Resume Link *
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://drive.google.com/... Or https://example.com/resume.pdf"
                      value={application.resume}
                      onChange={(e) => setApplication({...application, resume: e.target.value})}
                      disabled={!!user?.resume}
                      required
                    />
                    <div className="form-text text-muted">
                      {user?.resume 
                        ? "Using Resume from Your Prfile"
                        : "Upload your resume to Google Drive, Dropbox, or any cloud storage and share the link"}
                    </div>
                  </div>
                  
                  {/* Cover Letter */}
                  <div className="mb-4">
                    <label className="form-label fw-bold">
                      ✍️ Cover Letter (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={6}
                      placeholder="Why are you interested in this position? Why are you a good fit? Include any relevant experience or skills..."
                      value={application.coverLetter}
                      onChange={(e) => setApplication({...application, coverLetter: e.target.value})}
                    />
                    <div className="form-text text-muted">
                      <i className="bi bi-lightbulb me-1"></i>
                      A good cover letter increases your chances of being selected.
                    </div>
                  </div>
                  
                  {/* Job Summary */}
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">📋 Job Description</h6>
                    </div>
                    <div className="card-body">
                      <p><strong>JOb:</strong> {job.jobTitle}</p>
                      <p><strong>Company:</strong> {job.companyName}</p>
                      <p><strong>Location:</strong> {job.location}</p>
                      <p><strong>Salary:</strong> {formatSalary()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={applying}
                  >
                   cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={submitApplication}
                    disabled={applying || !application.resume.trim()}
                  >
                    {applying ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Custom CSS */}
      <style jsx>{`
        .modal-backdrop.show {
          opacity: 0.5;
        }
        .bg-success-light {
          background-color: #d1f7c4 !important;
        }
        .bg-danger-light {
          background-color: #ffe6e6 !important;
        }
        .form-control[disabled] {
          background-color: #f8f9fa !important;
          cursor: not-allowed !important;
        }
        .modal {
          z-index: 1055 !important;
        }
        .modal-content {
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default JobDetails;