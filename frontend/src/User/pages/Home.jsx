import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import axios from "axios";
import "./Home.css";

// Hero Carousel Data (Static images - તમે બદલી શકો છો)
const heroCarouselData = [
  {
    id: 1,
    imgUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1470&q=80",
    title: "Find Your Dream Job",
    desc: "Connect with top employers and discover exciting opportunities",
  },
  {
    id: 2,
    imgUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1470&q=80",
    title: "Hire Top Talent",
    desc: "Find the perfect candidates for your organization",
  },
  {
    id: 3,
    imgUrl: "https://images.unsplash.com/photo-1635350736475-c8cef4b21906?auto=format&fit=crop&w=1470&q=80",
    title: "Easy Application Process",
    desc: "Apply to jobs with just a few clicks",
  },
];

// Feature Cards (Static content)
const featureCards = [
  {
    id: 1,
    title: "Remote Jobs",
    desc: "Work from anywhere in the world",
    icon: "🏠",
  },
  {
    id: 2,
    title: "High Salary",
    desc: "Competitive salary packages",
    icon: "💰",
  },
  {
    id: 3,
    title: "Flexible Hours",
    desc: "Better work-life balance",
    icon: "⏰",
  },
  {
    id: 4,
    title: "Career Growth",
    desc: "Opportunities for advancement",
    icon: "📈",
  },
];

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    featuredJobs: 0,
    totalViews: 0,
    totalApplications: 0
  });
  const [userStats, setUserStats] = useState({
    jobsApplied: 0,
    profileViews: 0
  });

  // Fetch jobs and stats on component mount
  useEffect(() => {
    fetchJobs();
    fetchStats();
    if (isAuthenticated && user) {
      fetchUserApplications();
    }
  }, [isAuthenticated, user]);

  // Fetch jobs from backend API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch active jobs for homepage
      const response = await axios.get("https://project-job-i2vd.vercel.app/api/jobs/active");

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        throw new Error("Failed to fetch jobs");
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again later.");
      setJobs([]); // Empty array instead of dummy data
    } finally {
      setLoading(false);
    }
  };

  // Fetch platform statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get("https://project-job-i2vd.vercel.app/api/jobs/stats/summary");
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Use default stats
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        featuredJobs: 0,
        totalViews: 0,
        totalApplications: 0
      });
    }
  };

  // Fetch user's applications
  const fetchUserApplications = async () => {
    if (!user?._id) return;

    try {
      const response = await axios.get(
        `https://project-job-i2vd.vercel.app/api/jobs/user/applications/${user._id}`
      );
      if (response.data.success) {
        setUserStats(prev => ({
          ...prev,
          jobsApplied: response.data.count || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  // Filter Jobs based on search
  const filteredJobs = jobs.filter((job) => {
    const matchSearch = searchTerm === "" ||
      job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchType = filterType === "" ||
      job.jobType?.toLowerCase() === filterType.toLowerCase();

    const matchLocation = locationFilter === "" ||
      job.location?.toLowerCase().includes(locationFilter.toLowerCase());

    return matchSearch && matchType && matchLocation;
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

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setLocationFilter("");
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm || filterType || locationFilter) {
      // Navigate to jobs page with filters
      window.location.href = `/jobs?search=${searchTerm}&jobType=${filterType}&location=${locationFilter}`;
    }
  };

  const getUserGreeting = () => {
    if (!user) return "";

    if (user.firstName && user.lastName) {
      return `Welcome back, ${user.firstName} ${user.lastName}!`;
    }
    if (user.fullName) {
      return `Welcome back, ${user.fullName}!`;
    }
    if (user.name) {
      return `Welcome back, ${user.name}!`;
    }
    if (user.email) {
      const username = user.email.split('@')[0];
      return `Welcome back, ${username}!`;
    }

    return "Welcome back!";
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading jobs from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <Carousel fade controls indicators className="hero-carousel">
        {heroCarouselData.map((slide) => (
          <Carousel.Item key={slide.id}>
            <img
              className="d-block w-100 carousel-img"
              src={slide.imgUrl}
              alt={slide.title}
              loading="lazy"
            />
            <Carousel.Caption className="carousel-caption-custom">
              <h2>{slide.title}</h2>
              <p>{slide.desc}</p>
              {!isAuthenticated && (
                <a href="/register" className="btn btn-primary btn-lg mt-3">
                  Get Started Free
                </a>
              )}
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="container main-content my-5">
        {/* Error Message */}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError("")}
            ></button>
          </div>
        )}

        {/* User Greeting */}
        {isAuthenticated && (
          <div className="user-greeting-section mb-5">
            <div className="card bg-primary text-white shadow">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h2 className="card-title mb-3">
                      👋 {getUserGreeting()}
                    </h2>
                    <div className="d-flex gap-3">
                      <a href="/jobs" className="btn btn-light">
                        Browse All Jobs
                      </a>
                      <a href="/profile" className="btn btn-outline-light">
                        Update Profile
                      </a>
                      <a href="/my-applications" className="btn btn-outline-light">
                        My Applications ({userStats.jobsApplied})
                      </a>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="stats-card p-3 bg-white bg-opacity-25 rounded">
                      <div className="d-flex justify-content-between">
                        <span>Jobs Applied:</span>
                        <strong>{userStats.jobsApplied}</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Profile Views:</span>
                        <strong>{user?.profileViews || 0}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Platform Stats */}
        <div className="stats-section mb-5">
          <h3 className="text-center mb-4">📊 Live Job Portal Statistics</h3>
          <div className="row">
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <div className="stats-icon">📋</div>
                  <h2 className="display-6 text-primary">{stats.totalJobs}</h2>
                  <p className="card-text">Total Jobs</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <div className="stats-icon">✅</div>
                  <h2 className="display-6 text-success">{stats.activeJobs}</h2>
                  <p className="card-text">Active Jobs</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <div className="stats-icon">👁️</div>
                  <h2 className="display-6 text-info">{stats.totalViews}</h2>
                  <p className="card-text">Total Views</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card text-center shadow-sm h-100">
                <div className="card-body">
                  <div className="stats-icon">📄</div>
                  <h2 className="display-6 text-warning">{stats.totalApplications}</h2>
                  <p className="card-text">Total Applications</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards-section mb-5">
          <h3 className="text-center mb-4">✨ Why Choose LadderUp Jobs?</h3>
          <div className="row">
            {featureCards.map((feature) => (
              <div className="col-md-3 col-sm-6 mb-4" key={feature.id}>
                <div className="card text-center shadow-sm h-100 feature-card">
                  <div className="card-body">
                    <div className="feature-icon mb-3">
                      <span style={{ fontSize: "2.5rem" }}>{feature.icon}</span>
                    </div>
                    <h5 className="card-title">{feature.title}</h5>
                    <p className="card-text text-muted">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Search Section */}
        <div className="job-search-section mb-5">
          <div className="card shadow">
            <div className="card-body">
              <h3 className="mb-4">🔍 Find Your Dream Job</h3>

              <form onSubmit={handleSearchSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Job Title or Company</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Software Developer, Google"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="form-label">Job Type</label>
                      <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => {
                          setFilterType(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Types</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Remote">Remote</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Remote, New York"
                        value={locationFilter}
                        onChange={(e) => {
                          setLocationFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-2 d-flex align-items-end">
                    <div className="d-flex gap-2 w-100">
                      <button
                        type="submit"
                        className="btn btn-primary flex-grow-1"
                      >
                        Search Jobs
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleResetFilters}
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="mt-4">
                <h5>
                  {filteredJobs.length} Job{filteredJobs.length !== 1 ? 's' : ''} Found
                  {searchTerm && ` for "${searchTerm}"`}
                  {locationFilter && ` in ${locationFilter}`}
                </h5>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Jobs */}
        {filteredJobs.filter(job => job.isFeatured || job.isUrgent).length > 0 && (
          <div className="featured-jobs-section mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>⭐ Featured & Urgent Jobs</h3>
              <span className="badge bg-warning">Limited Time</span>
            </div>
            <div className="row">
              {filteredJobs
                .filter(job => job.isFeatured || job.isUrgent)
                .slice(0, 3)
                .map((job) => (
                  <div key={job._id} className="col-md-4 mb-4">
                    <div className="card featured-job-card shadow h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h5 className="card-title">{job.jobTitle}</h5>
                            <h6 className="card-subtitle text-primary">{job.companyName}</h6>
                          </div>
                          <div>
                            {job.isUrgent && (
                              <span className="badge bg-danger me-1">Urgent</span>
                            )}
                            {job.isFeatured && (
                              <span className="badge bg-warning">Featured</span>
                            )}
                          </div>
                        </div>
                        <p className="card-text">
                          <span className="badge bg-light text-dark me-2">{job.jobType}</span>
                          <span className="badge bg-light text-dark">{job.location}</span>
                        </p>
                        <p className="text-success">
                          <strong>{job.salaryRange || "Salary negotiable"}</strong>
                        </p>
                        <p className="text-muted small">
                          <i className="bi bi-eye me-1"></i> {job.views || 0} views •
                          <i className="bi bi-people ms-2 me-1"></i> {job.applications || 0} applications
                        </p>
                        <a href={`/jobs/${job._id}`} className="btn btn-primary w-100">
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* All Jobs */}
        <div className="all-jobs-section">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>📋 Latest Job Opportunities</h3>
            <div className="filter-buttons">
              <button
                className={`btn btn-sm ${filterType === '' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterType('')}
              >
                All
              </button>
              {['Full-time', 'Part-time', 'Remote'].map(type => (
                <button
                  key={type}
                  className={`btn btn-sm ms-2 ${filterType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilterType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <>
              <div className="row">
                {currentJobs.map((job) => (
                  <div key={job._id} className="col-md-6 col-lg-4 mb-4">
                    <JobCard job={job} />
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
                  <h4 className="mb-3">No jobs available</h4>
                  <p className="text-muted mb-4">
                    {searchTerm || locationFilter || filterType
                      ? "No jobs match your search criteria. Try different filters."
                      : "Currently no jobs are available. Check back soon or post a job!"}
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="btn btn-primary"
                      onClick={handleResetFilters}
                    >
                      Clear All Filters
                    </button>
                    <a href="/jobs" className="btn btn-outline-primary">
                      Browse All Jobs
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="cta-section mt-5 pt-5">
          <div className="card bg-dark text-white">
            <div className="card-body text-center py-5">
              <h2 className="display-5 mb-3">Ready to Advance Your Career?</h2>
              <p className="lead mb-4">
                Join thousands of professionals who found their dream job through LadderUp Jobs
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                {!isAuthenticated ? (
                  <>
                    <a href="/register" className="btn btn-light btn-lg px-4">
                      Sign Up Free
                    </a>
                    <a href="/jobs" className="btn btn-outline-light btn-lg px-4">
                      Browse All Jobs
                    </a>
                    <a href="/login" className="btn btn-outline-light btn-lg px-4">
                      Employer Login
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/jobs" className="btn btn-light btn-lg px-4">
                      Explore More Jobs
                    </a>
                    <a href="/profile" className="btn btn-outline-light btn-lg px-4">
                      Complete Profile
                    </a>
                    {user.role === 'admin' && (
                      <a href="/admin/jobs/create" className="btn btn-outline-light btn-lg px-4">
                        Post New Job
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;