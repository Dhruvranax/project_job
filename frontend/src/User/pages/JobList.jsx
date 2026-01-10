import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import axios from "axios";
import "./JobList.css";

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
  const jobsPerPage = 9;
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // ============================================
  // DYNAMIC API URL - LOCALHOST OR PRODUCTION
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // URL parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get("search") || "";
    
    if (searchParam) {
      setFilters(prev => ({
        ...prev,
        search: searchParam
      }));
    }
  }, [location.search]);

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, []); // Empty dependency - fetch only once on mount

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("📡 Fetching jobs from:", API_BASE_URL);
      
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.location) params.location = filters.location;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      
      // ✅ USE DYNAMIC API URL
      const response = await axios.get(`${API_BASE_URL}/api/jobs`, { 
        params,
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log("✅ Jobs API response:", response.data);
      
      if (response.data.success) {
        let filteredJobs = response.data.jobs || [];
        
        // Only active jobs
        filteredJobs = filteredJobs.filter(job => 
          job.status === "Active" || job.status === "Published"
        );
        
        console.log(`✅ Found ${filteredJobs.length} active jobs`);
        setJobs(filteredJobs);
      } else {
        console.log("⚠️ No active jobs endpoint, using sample data");
        // Use sample data if endpoint not available
        setJobs(getSampleJobs());
        setError("Using sample data. Backend jobs endpoint not configured.");
      }
    } catch (err) {
      console.error("❌ Error fetching jobs:", err.message);
      
      if (err.code === 'ERR_NETWORK') {
        setError(
          <div>
            <strong>🌐 Connection Error!</strong><br/>
            <small className="text-muted">
              Cannot connect to backend at: {API_BASE_URL}<br/>
              Please make sure backend server is running.
            </small>
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-warning"
                onClick={() => window.open(API_BASE_URL, '_blank')}
              >
                Test Backend
              </button>
              <button 
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </div>
          </div>
        );
      } else if (err.response?.status === 404) {
        console.log("⚠️ /api/jobs endpoint not found, using sample data");
        setJobs(getSampleJobs());
        setError(
          <div>
            <strong>🔧 Using Sample Data</strong><br/>
            <small className="text-muted">
              Backend endpoint /api/jobs not configured.<br/>
              Displaying sample job listings for demo.
            </small>
          </div>
        );
      } else {
        setError("Failed to load jobs. Please try again later.");
      }
      
      // Fallback to sample data
      setJobs(getSampleJobs());
    } finally {
      setLoading(false);
    }
  };

  // Sample jobs for fallback - useMemo to prevent recreation
  const getSampleJobs = useCallback(() => {
    return [
      {
        _id: "1",
        jobTitle: "Frontend Developer",
        companyName: "Tech Solutions Inc.",
        location: "Ahmedabad, Gujarat",
        jobType: "Full-time",
        experienceLevel: "Mid Level",
        salary: "₹6-8 LPA",
        jobDescription: "React.js, JavaScript, HTML/CSS required. 2+ years experience.",
        status: "Active",
        views: 150,
        applications: 5,
        postedDate: new Date().toISOString(),
        isFeatured: true
      },
      {
        _id: "2",
        jobTitle: "Backend Engineer",
        companyName: "Data Systems Ltd.",
        location: "Remote",
        jobType: "Full-time",
        experienceLevel: "Senior Level",
        salary: "₹8-12 LPA",
        jobDescription: "Node.js, MongoDB, Express.js. Work from anywhere in India.",
        status: "Active",
        views: 120,
        applications: 3,
        postedDate: new Date().toISOString(),
        isFeatured: true
      },
      {
        _id: "3",
        jobTitle: "UX/UI Designer",
        companyName: "Creative Minds",
        location: "Surat, Gujarat",
        jobType: "Part-time",
        experienceLevel: "Entry Level",
        salary: "₹4-6 LPA",
        jobDescription: "Figma, Adobe XD, Prototyping skills required.",
        status: "Active",
        views: 80,
        applications: 2,
        postedDate: new Date().toISOString(),
        isFeatured: false
      },
      {
        _id: "4",
        jobTitle: "Marketing Manager",
        companyName: "Growth Experts",
        location: "Mumbai",
        jobType: "Full-time",
        experienceLevel: "Mid Level",
        salary: "₹7-9 LPA",
        jobDescription: "Digital marketing, SEO, Social Media experience.",
        status: "Active",
        views: 95,
        applications: 4,
        postedDate: new Date().toISOString(),
        isFeatured: true
      },
      {
        _id: "5",
        jobTitle: "Data Analyst",
        companyName: "Analytics Pro",
        location: "Remote",
        jobType: "Contract",
        experienceLevel: "Mid Level",
        salary: "₹5-7 LPA",
        jobDescription: "Python, SQL, Data Visualization tools.",
        status: "Active",
        views: 110,
        applications: 6,
        postedDate: new Date().toISOString(),
        isFeatured: false
      },
      {
        _id: "6",
        jobTitle: "Mobile App Developer",
        companyName: "App Innovators",
        location: "Rajkot, Gujarat",
        jobType: "Full-time",
        experienceLevel: "Mid Level",
        salary: "₹5-7 LPA",
        jobDescription: "React Native, Android/iOS development.",
        status: "Active",
        views: 75,
        applications: 3,
        postedDate: new Date().toISOString(),
        isFeatured: true
      }
    ];
  }, []);

  // Handle apply success callback - memoized
  const handleApplySuccess = useCallback((jobId, newApplication) => {
    console.log(`✅ Application success for job ${jobId}`, newApplication);
    
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job._id === jobId) {
          const currentApplications = job.jobApplications || [];
          const updatedJobApplications = [...currentApplications, newApplication];
          
          return {
            ...job,
            applications: updatedJobApplications.length,
            jobApplications: updatedJobApplications
          };
        }
        return job;
      })
    );
  }, []);

  // Filter jobs - memoized for performance
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchSearch = filters.search === "" || 
        job.jobTitle?.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.companyName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.location?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchType = filters.jobType === "" || 
        job.jobType?.toLowerCase() === filters.jobType.toLowerCase();
      
      const matchLocation = filters.location === "" || 
        job.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchExperience = filters.experienceLevel === "" || 
        job.experienceLevel?.toLowerCase() === filters.experienceLevel.toLowerCase();
      
      return matchSearch && matchType && matchLocation && matchExperience;
    });
  }, [jobs, filters]);

  // Pagination - memoized
  const { currentJobs, totalPages } = useMemo(() => {
    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
    
    return { currentJobs, totalPages };
  }, [currentPage, filteredJobs]);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: "",
      jobType: "",
      location: "",
      experienceLevel: ""
    });
    setCurrentPage(1);
    navigate("/jobs");
  }, [navigate]);

  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle filter button clicks
  const handleFilterButtonClick = useCallback((type) => {
    setFilters(prev => ({ ...prev, jobType: type }));
    setCurrentPage(1);
  }, []);

  if (loading) {
    return (
      <div className="job-list-page">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" style={{width: "3rem", height: "3rem"}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading jobs from {API_BASE_URL}...</p>
          <small className="text-muted">
            Backend URL: {API_BASE_URL}<br/>
            જો લાંબો સમય લાગે તો refresh કરો.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-page">
      <div className="container py-5">
        {/* Connection Info */}
        <div className="alert alert-info mb-4">
          <small>
            <strong>🔧 API Status:</strong> {API_BASE_URL}<br/>
            {API_BASE_URL.includes('localhost') && (
              <span className="text-muted">
                Using local development server. Backend must be running on port 5000.
              </span>
            )}
          </small>
        </div>

        <div className="row">
          <div className="col-lg-3 mb-4">
            {/* Filters Sidebar */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">🔍 Filters</h5>
                
                <div className="mb-3">
                  <label className="form-label">Search</label>
                  <input
                    type="text"
                    className="form-control"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Job title or company"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    name="jobType"
                    value={filters.jobType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    placeholder="City, State or Remote"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="form-label">Experience Level</label>
                  <select
                    className="form-select"
                    name="experienceLevel"
                    value={filters.experienceLevel}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Levels</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={handleResetFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* User Info Card */}
            {isAuthenticated && (
              <div className="card shadow-sm mt-4">
                <div className="card-body">
                  <h6 className="fw-bold mb-3">
                    <i className="bi bi-person-circle me-2"></i>
                    Your Profile
                  </h6>
                  <div className="d-flex align-items-center mb-3">
                    <div className="user-avatar-small me-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                      style={{width: '40px', height: '40px', fontSize: '16px'}}>
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <strong>{user.firstName} {user.lastName}</strong>
                      <p className="text-muted small mb-0">{user.email}</p>
                    </div>
                  </div>
                  <a href="/profile" className="btn btn-outline-primary w-100">
                    <i className="bi bi-pencil-square me-2"></i>
                    Update Profile
                  </a>
                </div>
              </div>
            )}

            {/* API Info Card */}
            <div className="card shadow-sm mt-4 border-info">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-wrench me-2"></i>
                  API Information
                </h6>
                <small className="text-muted">
                  <strong>Endpoint:</strong> {API_BASE_URL}/api/jobs<br/>
                  <strong>Status:</strong> {jobs.length > 0 ? 'Connected' : 'Using Sample Data'}<br/>
                  <strong>Jobs Found:</strong> {filteredJobs.length}
                </small>
                <button 
                  className="btn btn-sm btn-outline-info w-100 mt-3"
                  onClick={() => window.open(`${API_BASE_URL}/api/jobs/active`, '_blank')}
                >
                  Test Jobs API
                </button>
              </div>
            </div>
          </div>
          
          <div className="col-lg-9">
            {/* Results Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>
                {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                {filters.search && ` for "${filters.search}"`}
              </h3>
              
              <div className="filter-buttons">
                <button 
                  className={`btn btn-sm ${filters.jobType === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterButtonClick('')}
                >
                  All
                </button>
                {['Full-time', 'Part-time', 'Remote'].map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm ms-2 ${filters.jobType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleFilterButtonClick(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
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
                  onClick={() => setError("")}
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
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-5">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          &laquo; Previous
                        </button>
                      </li>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = i + 1;
                        return (
                          <li
                            key={i}
                            className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          </li>
                        );
                      })}
                      
                      {totalPages > 5 && (
                        <li className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      )}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next &raquo;
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <div className="card shadow">
                  <div className="card-body py-5">
                    <div className="empty-state-icon mb-3">🔍</div>
                    <h4 className="mb-3">No jobs found</h4>
                    <p className="text-muted mb-4">
                      {filters.search || filters.location || filters.jobType 
                        ? "Try adjusting your search criteria" 
                        : "No jobs available at the moment. Check back soon!"}
                    </p>
                    <div className="d-flex gap-3 justify-content-center">
                      <button 
                        className="btn btn-primary"
                        onClick={handleResetFilters}
                      >
                        Clear All Filters
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={fetchJobs}
                      >
                        Retry Loading
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Apply Instructions */}
            {isAuthenticated && !user.resume && (
              <div className="alert alert-info mt-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-1">📄 Upload Your Resume</h6>
                    <p className="mb-0">
                      You need to upload your resume before applying for jobs. 
                      <a href="/profile" className="alert-link ms-1">Go to Profile</a>
                    </p>
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

export default React.memo(JobList);