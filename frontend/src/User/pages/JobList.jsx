import React, { useState, useEffect } from "react";
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
  }, [filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("Fetching jobs with filters:", filters);
      
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.jobType) params.jobType = filters.jobType;
      if (filters.location) params.location = filters.location;
      if (filters.experienceLevel) params.experienceLevel = filters.experienceLevel;
      
      const response = await axios.get("https://project-job-i2vd.vercel.app/api/jobs", { params });
      
      console.log("Jobs API response:", response.data);
      
      if (response.data.success) {
        let filteredJobs = response.data.jobs || [];
        
        // Only active jobs
        filteredJobs = filteredJobs.filter(job => 
          job.status === "Active" || job.status === "Published"
        );
        
        console.log(`Filtered ${filteredJobs.length} active jobs`);
        setJobs(filteredJobs);
      } 
      // else {
      //   setError("Failed to load jobs");
      // }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle apply success callback - FIXED
  const handleApplySuccess = (jobId, newApplication) => {
    console.log(`Application success for job ${jobId}`, newApplication);
    
    setJobs(prevJobs => 
      prevJobs.map(job => {
        if (job._id === jobId) {
          // Get current applications
          const currentApplications = job.jobApplications || [];
          
          // Add the new application
          const updatedJobApplications = [
            ...currentApplications,
            newApplication
          ];
          
          return {
            ...job,
            applications: updatedJobApplications.length,
            jobApplications: updatedJobApplications
          };
        }
        return job;
      })
    );
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
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

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
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

  // Pagination
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="job-list-page">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" style={{width: "3rem", height: "3rem"}} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-page">
      <div className="container py-5">
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
                    <div className="user-avatar-small me-3">
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
                  onClick={() => setFilters(prev => ({ ...prev, jobType: '' }))}
                >
                  All
                </button>
                {['Full-time', 'Part-time', 'Remote'].map(type => (
                  <button
                    key={type}
                    className={`btn btn-sm ms-2 ${filters.jobType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilters(prev => ({ ...prev, jobType: type }))}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-warning alert-dismissible fade show mb-4" role="alert">
                {error}
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
                    <button 
                      className="btn btn-primary"
                      onClick={handleResetFilters}
                    >
                      Clear All Filters
                    </button>
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
                    <h6 className="mb-1">Upload Your Resume</h6>
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

export default JobList;