import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import axios from "axios";
import "./JobList.css";

// API Base URL - Using your Vercel backend URL
const API_BASE_URL = "https://project-job-i2vd.vercel.app/api";

// Configure axios defaults
axios.defaults.baseURL = "https://project-job-i2vd.vercel.app";
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for logging
axios.interceptors.request.use(
  config => {
    console.log(`Making ${config.method.toUpperCase()} request to:`, config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('Response error:', error);
    
    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your internet connection.";
    }
    
    // Handle specific HTTP status codes
    if (error.response?.status === 401) {
      error.message = "Session expired. Please log in again.";
    } else if (error.response?.status === 404) {
      error.message = "Resource not found.";
    } else if (error.response?.status >= 500) {
      error.message = "Server error. Please try again later.";
    }
    
    return Promise.reject(error);
  }
);

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    jobType: "",
    location: "",
    experienceLevel: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 9;
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Debounce function
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 500);
  const debouncedLocation = useDebounce(filters.location, 500);

  // URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("search") || "";
    const jobTypeParam = queryParams.get("jobType") || "";
    const locationParam = queryParams.get("location") || "";
    const experienceParam = queryParams.get("experienceLevel") || "";
    
    if (searchParam || jobTypeParam || locationParam || experienceParam) {
      setFilters(prev => ({
        ...prev,
        search: searchParam,
        jobType: jobTypeParam,
        location: locationParam,
        experienceLevel: experienceParam
      }));
    }
  }, [location.search]);

  // Fetch jobs when filters change (with debouncing)
  useEffect(() => {
    fetchJobs();
  }, [debouncedSearch, filters.jobType, debouncedLocation, filters.experienceLevel]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching jobs from:", `${API_BASE_URL}/jobs`);
      console.log("Current filters:", filters);
      
      const params = {};
      if (filters.search.trim()) params.search = filters.search.trim();
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.location.trim()) params.location = filters.location.trim();
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      
      // Add page and limit for pagination
      params.page = currentPage;
      params.limit = jobsPerPage;
      
      const response = await axios.get(`${API_BASE_URL}/jobs`, { 
        params,
        timeout: 10000 // 10 second timeout
      });
      
      console.log("Jobs API response:", response.data);
      
      if (response.data.success) {
        let filteredJobs = response.data.jobs || [];
        setTotalJobs(response.data.total || filteredJobs.length);
        
        // Only active jobs
        filteredJobs = filteredJobs.filter(job => 
          job.status === "Active" || job.status === "Published" || !job.status
        );
        
        console.log(`Loaded ${filteredJobs.length} active jobs`);
        setJobs(filteredJobs);
      } else {
        setError(response.data.message || "Failed to load jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Unable to connect to server. Please try again later.";
      setError(errorMessage);
      setJobs([]);
      setTotalJobs(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle apply success callback
  const handleApplySuccess = useCallback((jobId, newApplication) => {
    console.log(`Application success for job ${jobId}`, newApplication);
    
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job._id === jobId) {
          const currentApplications = job.jobApplications || [];
          const updatedJobApplications = [
            ...currentApplications,
            newApplication
          ];
          
          return {
            ...job,
            applications: updatedJobApplications.length,
            jobApplications: updatedJobApplications,
            hasApplied: true
          };
        }
        return job;
      })
    );
    
    // Show success toast/notification
    if (window.toast) {
      window.toast.success("Application submitted successfully!");
    }
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
    
    // Update URL with filters
    const queryParams = new URLSearchParams();
    if (name === 'search' && value) queryParams.set('search', value);
    if (name === 'jobType' && value) queryParams.set('jobType', value);
    if (name === 'location' && value) queryParams.set('location', value);
    if (name === 'experienceLevel' && value) queryParams.set('experienceLevel', value);
    
    const queryString = queryParams.toString();
    navigate(`/jobs${queryString ? `?${queryString}` : ''}`);
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      jobType: "",
      location: "",
      experienceLevel: ""
    });
    setCurrentPage(1);
    navigate("/jobs");
  };

  // Memoized filtered jobs
  const filteredJobs = useMemo(() => {
    if (!jobs.length) return [];
    
    return jobs.filter((job) => {
      const searchTerm = filters.search.toLowerCase().trim();
      const locationTerm = filters.location.toLowerCase().trim();
      
      const matchSearch = searchTerm === "" || 
        (job.jobTitle?.toLowerCase().includes(searchTerm) ||
        job.companyName?.toLowerCase().includes(searchTerm) ||
        job.location?.toLowerCase().includes(searchTerm) ||
        job.description?.toLowerCase().includes(searchTerm) ||
        job.skills?.some(skill => skill.toLowerCase().includes(searchTerm)));
      
      const matchType = filters.jobType === "" || 
        job.jobType?.toLowerCase() === filters.jobType.toLowerCase();
      
      const matchLocation = locationTerm === "" || 
        job.location?.toLowerCase().includes(locationTerm) ||
        (locationTerm === "remote" && job.jobType?.toLowerCase() === "remote");
      
      const matchExperience = filters.experienceLevel === "" || 
        job.experienceLevel?.toLowerCase() === filters.experienceLevel.toLowerCase();
      
      return matchSearch && matchType && matchLocation && matchExperience;
    });
  }, [jobs, filters]);

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Extract active filters for display
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value && value.trim() !== "")
      .map(([key, value]) => ({ 
        key, 
        value,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
      }));
  }, [filters]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxPagesToShow + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  const LoadingSpinner = () => (
    <div className="job-list-page">
      <div className="container py-5 text-center">
        <div 
          className="spinner-border text-primary" 
          style={{width: "3rem", height: "3rem"}} 
          role="status"
          aria-live="polite"
          aria-label="Loading jobs"
        >
          <span className="visually-hidden">Loading jobs...</span>
        </div>
        <p className="mt-3 text-muted">Loading available jobs...</p>
        <p className="small text-muted">
          Connected to: {API_BASE_URL.replace('/api', '')}
        </p>
      </div>
    </div>
  );

  return (
    <div className="job-list-page">
      <div className="container py-4 py-lg-5">
        <div className="row">
          <div className="col-lg-3 mb-4">
            {/* Filters Sidebar */}
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h5 className="card-title mb-4 d-flex align-items-center">
                  <i className="bi bi-funnel me-2"></i>
                  Filters
                  {activeFilters.length > 0 && (
                    <span className="badge bg-primary ms-2">
                      {activeFilters.length}
                    </span>
                  )}
                </h5>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Search</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Job title, company, or keywords"
                      aria-label="Search jobs"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Job Type</label>
                  <select
                    className="form-select"
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                    aria-label="Filter by job type"
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-semibold">Location</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-geo-alt"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={filters.location}
                      onChange={handleFilterChange}
                      placeholder="City, State or Remote"
                      aria-label="Filter by location"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="form-label fw-semibold">Experience Level</label>
                  <select
                    className="form-select"
                    name="experienceLevel"
                    value={filters.experienceLevel}
                    onChange={handleFilterChange}
                    aria-label="Filter by experience level"
                  >
                    <option value="">All Levels</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                
                <button
                  className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                  onClick={handleResetFilters}
                  disabled={activeFilters.length === 0}
                  aria-label="Clear all filters"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Active Filters Chips */}
            {activeFilters.length > 0 && (
              <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-tags me-2"></i>
                    Active Filters
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {activeFilters.map(({ key, value, label }) => (
                      <span key={key} className="badge bg-primary d-flex align-items-center py-2">
                        <span className="me-1">{label}:</span>
                        <strong>{value}</strong>
                        <button 
                          onClick={() => setFilters(prev => ({ ...prev, [key]: "" }))}
                          className="btn-close btn-close-white ms-2"
                          style={{ fontSize: '0.6rem' }}
                          aria-label={`Remove ${label} filter`}
                        ></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Info Card */}
            {isAuthenticated && user && (
              <div className="card shadow-sm border-0 mt-4">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-person-circle me-2"></i>
                    Your Profile
                  </h6>
                  <div className="d-flex align-items-center mb-3">
                    <div className="user-avatar-small me-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <strong>{user.firstName} {user.lastName}</strong>
                      <p className="text-muted small mb-0">{user.email}</p>
                    </div>
                  </div>
                  <a href="/profile" className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center">
                    <i className="bi bi-pencil-square me-2"></i>
                    Update Profile
                  </a>
                </div>
              </div>
            )}

            {/* Stats Card */}
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-graph-up me-2"></i>
                  Job Stats
                </h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="display-6 fw-bold text-primary">{totalJobs}</div>
                    <div className="text-muted small">Total Jobs</div>
                  </div>
                  <div className="col-6">
                    <div className="display-6 fw-bold text-success">{filteredJobs.length}</div>
                    <div className="text-muted small">Filtered</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-9">
            {/* Results Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
              <div>
                <h3 className="mb-2">
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                  {filters.search && (
                    <span className="text-primary"> for "{filters.search}"</span>
                  )}
                </h3>
                <p className="text-muted mb-0">
                  Showing {Math.min(indexOfFirstJob + 1, filteredJobs.length)}-
                  {Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length} results
                </p>
              </div>
              
              <div className="mt-3 mt-md-0">
                <div className="d-flex flex-wrap gap-2">
                  <button 
                    className={`btn btn-sm ${filters.jobType === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, jobType: '' }));
                      setCurrentPage(1);
                    }}
                    aria-label="Show all job types"
                  >
                    All Jobs
                  </button>
                  {['Full-time', 'Part-time', 'Remote'].map(type => (
                    <button
                      key={type}
                      className={`btn btn-sm ${filters.jobType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => {
                        setFilters(prev => ({ ...prev, jobType: type }));
                        setCurrentPage(1);
                      }}
                      aria-label={`Show ${type} jobs`}
                    >
                      {type}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={fetchJobs}
                    aria-label="Refresh jobs"
                    disabled={loading}
                  >
                    <i className={`bi bi-arrow-clockwise ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>
                    <strong>Unable to load jobs</strong>
                    <p className="mb-0 mt-1">{error}</p>
                    <button 
                      className="btn btn-sm btn-outline-warning mt-2"
                      onClick={fetchJobs}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                  aria-label="Close error message"
                ></button>
              </div>
            )}

            {/* Job Results */}
            {filteredJobs.length > 0 ? (
              <>
                <div className="row">
                  {currentJobs.map((job) => (
                    <div key={job._id} className="col-md-6 col-lg-4 mb-4">
                      <JobCard 
                        job={job} 
                        onApplySuccess={handleApplySuccess} 
                        userId={user?._id}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-5" aria-label="Job pagination">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          aria-label="Previous page"
                        >
                          <i className="bi bi-chevron-left"></i>
                          <span className="d-none d-md-inline"> Previous</span>
                        </button>
                      </li>
                      
                      {getPageNumbers().map((pageNumber) => (
                        <li
                          key={pageNumber}
                          className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pageNumber)}
                            aria-label={`Go to page ${pageNumber}`}
                            aria-current={currentPage === pageNumber ? 'page' : undefined}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          aria-label="Next page"
                        >
                          <span className="d-none d-md-inline">Next </span>
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                    <p className="text-center text-muted small mt-2">
                      Page {currentPage} of {totalPages}
                    </p>
                  </nav>
                )}
              </>
            ) : loading ? (
              <LoadingSpinner />
            ) : (
              <div className="text-center py-5">
                <div className="card shadow border-0">
                  <div className="card-body py-5">
                    <div className="empty-state-icon mb-3">
                      <i className="bi bi-search display-1 text-muted"></i>
                    </div>
                    <h4 className="mb-3">No jobs found</h4>
                    <p className="text-muted mb-4">
                      {filters.search || filters.location || filters.jobType 
                        ? "Try adjusting your search criteria or clear filters to see more results." 
                        : "No jobs are currently available. Please check back later or try refreshing the page."}
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                      {filters.search || filters.location || filters.jobType ? (
                        <button 
                          className="btn btn-primary"
                          onClick={handleResetFilters}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          Clear All Filters
                        </button>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          onClick={fetchJobs}
                          disabled={loading}
                        >
                          <i className={`bi bi-arrow-clockwise me-2 ${loading ? 'spinner-border spinner-border-sm' : ''}`}></i>
                          Refresh Jobs
                        </button>
                      )}
                      <a href="/" className="btn btn-outline-primary">
                        <i className="bi bi-house me-2"></i>
                        Go to Home
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Instructions */}
            {isAuthenticated && !user?.resume && (
              <div className="alert alert-info mt-4 border-0">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-1">Upload Your Resume</h6>
                    <p className="mb-0">
                      You need to upload your resume before applying for jobs. 
                      <a href="/profile" className="alert-link ms-1 fw-semibold">
                        Go to Profile to upload
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Network Status */}
            <div className="text-center mt-4">
              <small className="text-muted">
                Connected to: <code>{API_BASE_URL.replace('/api', '')}</code>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;