import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./MyApplications.css"; // Optional CSS

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ============================================
  // DYNAMIC API URL - LOCALHOST OR PRODUCTION
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";
  
  useEffect(() => {
    if (user && user._id) {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("📋 Fetching applications for user:", user._id);
      console.log("🌐 API URL:", API_BASE_URL);
      
      // ✅ USE DYNAMIC API URL
      const response = await axios.get(
        `${API_BASE_URL}/api/jobs/user/applications/${user._id}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      console.log("✅ Applications response:", response.data);
      
      if (response.data.success) {
        setApplications(response.data.applications || []);
      } else {
        setError("Failed to load applications");
      }
    } catch (error) {
      console.error("❌ Error fetching applications:", error.message);
      
      if (error.code === 'ERR_NETWORK') {
        setError(
          <div>
            <strong>🌐 Connection Error!</strong><br/>
            <small className="text-muted">
              Cannot connect to server at: {API_BASE_URL}<br/>
              Please make sure backend is running.
            </small>
          </div>
        );
      } else if (error.response?.status === 404) {
        // No applications found is okay
        setApplications([]);
        setError("No applications found. Start applying for jobs!");
      } else {
        setError("Failed to load applications. Please try again.");
      }
      
      // Sample data for demo
      setApplications(getSampleApplications());
    } finally {
      setLoading(false);
    }
  };
  
  // Sample applications for fallback/demo
  const getSampleApplications = () => {
    return [
      {
        _id: "1",
        jobTitle: "Frontend Developer",
        companyName: "Tech Solutions Inc.",
        status: "Pending",
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        resume: "https://example.com/resumes/sample.pdf",
        coverLetter: "I'm very interested in this position and believe my skills match your requirements perfectly."
      },
      {
        _id: "2",
        jobTitle: "UI/UX Designer",
        companyName: "Creative Designs Ltd.",
        status: "Reviewed",
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resume: "https://example.com/resumes/sample.pdf",
        coverLetter: "I have 3 years of experience in UI/UX design and am excited about this opportunity."
      },
      {
        _id: "3",
        jobTitle: "Backend Engineer",
        companyName: "Data Systems Corp",
        status: "Shortlisted",
        appliedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        resume: "https://example.com/resumes/sample.pdf",
        coverLetter: "I'm proficient in Node.js and MongoDB and have worked on similar projects."
      }
    ];
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      "Pending": { class: "bg-secondary", icon: "⏳" },
      "Reviewed": { class: "bg-info", icon: "👁️" },
      "Shortlisted": { class: "bg-warning", icon: "⭐" },
      "Accepted": { class: "bg-success", icon: "✅" },
      "Rejected": { class: "bg-danger", icon: "❌" }
    };
    return badges[status] || { class: "bg-secondary", icon: "❓" };
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Recently';
    }
  };
  
  if (!user) {
    return (
      <div className="my-applications-page">
        <div className="container py-5">
          <div className="card shadow">
            <div className="card-body text-center py-5">
              <div className="display-1 text-muted mb-4">🔒</div>
              <h3 className="mb-3">Authentication Required</h3>
              <p className="text-muted mb-4">
                Please login to view your job applications
              </p>
              <a href="/login" className="btn btn-primary btn-lg">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login to Continue
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="my-applications-page">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" style={{width: "3rem", height: "3rem"}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your applications...</p>
          <small className="text-muted">
            Fetching from: {API_BASE_URL}<br/>
            User ID: {user._id}
          </small>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-applications-page">
      <div className="container py-5">
        {/* Page Header */}
        <div className="row mb-5">
          <div className="col">
            <h1 className="fw-bold mb-3">
              <i className="bi bi-files me-3"></i>
              My Job Applications
            </h1>
            <p className="text-muted">
              Track all your job applications in one place
            </p>
          </div>
          <div className="col-auto">
            <div className="card bg-light">
              <div className="card-body py-2">
                <small className="text-muted">
                  <strong>Total Applications:</strong> {applications.length}
                </small>
              </div>
            </div>
          </div>
        </div>
        
        {/* Connection Info */}
        <div className="alert alert-info mb-4">
          <small>
            <strong>🔧 API Status:</strong> {API_BASE_URL}<br/>
            <strong>📊 Applications Found:</strong> {applications.length}
          </small>
          <button 
            className="btn btn-sm btn-outline-info float-end"
            onClick={fetchApplications}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
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
        
        {/* Applications Grid */}
        {applications.length === 0 ? (
          <div className="text-center py-5">
            <div className="card shadow border-0">
              <div className="card-body py-5">
                <div className="display-1 text-muted mb-4">📄</div>
                <h3 className="mb-3">No Applications Yet</h3>
                <p className="text-muted mb-4">
                  You haven't applied for any jobs yet.<br/>
                  Start browsing jobs and apply to find your dream career!
                </p>
                <div className="d-flex gap-3 justify-content-center">
                  <a href="/jobs" className="btn btn-primary btn-lg">
                    <i className="bi bi-search me-2"></i>
                    Browse Jobs
                  </a>
                  <a href="/home" className="btn btn-outline-primary btn-lg">
                    <i className="bi bi-house me-2"></i>
                    Go to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="row mb-4">
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card text-center border-primary">
                  <div className="card-body">
                    <div className="display-6 text-primary">
                      {applications.filter(app => app.status === 'Pending').length}
                    </div>
                    <p className="text-muted mb-0">Pending</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card text-center border-info">
                  <div className="card-body">
                    <div className="display-6 text-info">
                      {applications.filter(app => app.status === 'Reviewed').length}
                    </div>
                    <p className="text-muted mb-0">Reviewed</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card text-center border-warning">
                  <div className="card-body">
                    <div className="display-6 text-warning">
                      {applications.filter(app => app.status === 'Shortlisted').length}
                    </div>
                    <p className="text-muted mb-0">Shortlisted</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-sm-6 mb-3">
                <div className="card text-center border-success">
                  <div className="card-body">
                    <div className="display-6 text-success">
                      {applications.filter(app => app.status === 'Accepted').length}
                    </div>
                    <p className="text-muted mb-0">Accepted</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Applications List */}
            <div className="row">
              {applications.map(app => {
                const statusBadge = getStatusBadge(app.status);
                
                return (
                  <div className="col-lg-6 mb-4" key={app._id}>
                    <div className="card shadow-sm h-100 hover-card">
                      <div className="card-body">
                        {/* Application Header */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="flex-grow-1">
                            <h5 className="card-title fw-bold mb-1">{app.jobTitle || "Untitled Position"}</h5>
                            <h6 className="card-subtitle text-primary">
                              <i className="bi bi-building me-1"></i>
                              {app.companyName || "Unknown Company"}
                            </h6>
                          </div>
                          <div className="text-end">
                            <span className={`badge ${statusBadge.class} px-3 py-2`}>
                              {statusBadge.icon} {app.status}
                            </span>
                            <div className="text-muted small mt-1">
                              {formatDate(app.appliedAt)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Application Details */}
                        <div className="application-details mt-4">
                          {app.jobType && (
                            <div className="d-flex mb-2">
                              <span className="text-muted" style={{width: '120px'}}>Job Type:</span>
                              <span className="fw-semibold">{app.jobType}</span>
                            </div>
                          )}
                          
                          {app.location && (
                            <div className="d-flex mb-2">
                              <span className="text-muted" style={{width: '120px'}}>Location:</span>
                              <span className="fw-semibold">{app.location}</span>
                            </div>
                          )}
                          
                          {app.salary && (
                            <div className="d-flex mb-2">
                              <span className="text-muted" style={{width: '120px'}}>Salary:</span>
                              <span className="fw-semibold text-success">{app.salary}</span>
                            </div>
                          )}
                          
                          {app.coverLetter && (
                            <div className="mt-3">
                              <strong className="d-block mb-2">Cover Letter:</strong>
                              <p className="text-muted small bg-light p-3 rounded">
                                {app.coverLetter.length > 150 
                                  ? `${app.coverLetter.substring(0, 150)}...` 
                                  : app.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                          <div>
                            {app.resume ? (
                              <a 
                                href={app.resume} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                View Resume
                              </a>
                            ) : (
                              <span className="text-muted small">
                                <i className="bi bi-file-earmark-x me-1"></i>
                                Resume not uploaded
                              </span>
                            )}
                          </div>
                          
                          <div className="d-flex gap-2">
                            <button 
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                // View application details
                                console.log("View application:", app);
                                alert(`Application ID: ${app._id}\nStatus: ${app.status}`);
                              }}
                            >
                              <i className="bi bi-eye me-1"></i>
                              Details
                            </button>
                            {app.status === 'Pending' && (
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => {
                                  // Withdraw application
                                  if (window.confirm("Are you sure you want to withdraw this application?")) {
                                    console.log("Withdraw application:", app._id);
                                    alert("Application withdrawal feature coming soon!");
                                  }
                                }}
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            <div className="card bg-light mt-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-graph-up me-2"></i>
                      Application Statistics
                    </h6>
                    <div className="small">
                      <div className="d-flex justify-content-between">
                        <span>Total Applications:</span>
                        <strong>{applications.length}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Pending Review:</span>
                        <strong>{applications.filter(app => app.status === 'Pending').length}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Under Review:</span>
                        <strong>{applications.filter(app => app.status === 'Reviewed').length}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Success Rate:</span>
                        <strong>
                          {applications.length > 0 
                            ? `${Math.round((applications.filter(app => 
                                ['Accepted', 'Shortlisted'].includes(app.status)).length / applications.length) * 100)}%` 
                            : '0%'}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">
                      <i className="bi bi-lightbulb me-2"></i>
                      Tips
                    </h6>
                    <ul className="small text-muted mb-0">
                      <li>Follow up after 7-10 days if status is "Pending"</li>
                      <li>Keep your resume updated for better chances</li>
                      <li>Apply to jobs that match your skills</li>
                      <li>Withdraw applications if you're no longer interested</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Call to Action */}
        {applications.length > 0 && (
          <div className="text-center mt-5">
            <div className="d-flex gap-3 justify-content-center">
              <a href="/jobs" className="btn btn-primary btn-lg">
                <i className="bi bi-plus-circle me-2"></i>
                Apply for More Jobs
              </a>
              <button 
                className="btn btn-outline-secondary btn-lg"
                onClick={fetchApplications}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh Applications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;