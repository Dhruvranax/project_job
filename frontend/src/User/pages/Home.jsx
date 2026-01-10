import React, { useState, useEffect } from "react";
import { Carousel } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import axios from "axios";
import "./Home.css";

// ============================================
// SAMPLE DATA - જ્યારે backend નથી ચાલતું
// ============================================
const SAMPLE_JOBS = [
  {
    _id: "1",
    jobTitle: "Frontend Developer",
    companyName: "Tech Solutions Inc.",
    location: "Ahmedabad, Gujarat",
    jobType: "Full-time",
    salary: "₹6-8 LPA",
    description: "React.js, JavaScript, HTML/CSS required. 2+ years experience.",
    postedDate: new Date().toISOString(),
    isFeatured: true,
    views: 150
  },
  {
    _id: "2",
    jobTitle: "Backend Engineer",
    companyName: "Data Systems Ltd.",
    location: "Remote",
    jobType: "Full-time",
    salary: "₹8-12 LPA",
    description: "Node.js, MongoDB, Express.js. Work from anywhere in India.",
    postedDate: new Date().toISOString(),
    isFeatured: true,
    views: 120
  },
  {
    _id: "3",
    jobTitle: "UX/UI Designer",
    companyName: "Creative Minds",
    location: "Surat, Gujarat",
    jobType: "Part-time",
    salary: "₹4-6 LPA",
    description: "Figma, Adobe XD, Prototyping skills required.",
    postedDate: new Date().toISOString(),
    isFeatured: false,
    views: 80
  },
  {
    _id: "4",
    jobTitle: "Marketing Manager",
    companyName: "Growth Experts",
    location: "Mumbai",
    jobType: "Full-time",
    salary: "₹7-9 LPA",
    description: "Digital marketing, SEO, Social Media experience.",
    postedDate: new Date().toISOString(),
    isFeatured: true,
    views: 95
  },
  {
    _id: "5",
    jobTitle: "Data Analyst",
    companyName: "Analytics Pro",
    location: "Remote",
    jobType: "Contract",
    salary: "₹5-7 LPA",
    description: "Python, SQL, Data Visualization tools.",
    postedDate: new Date().toISOString(),
    isFeatured: false,
    views: 110
  },
  {
    _id: "6",
    jobTitle: "Mobile App Developer",
    companyName: "App Innovators",
    location: "Rajkot, Gujarat",
    jobType: "Full-time",
    salary: "₹5-7 LPA",
    description: "React Native, Android/iOS development.",
    postedDate: new Date().toISOString(),
    isFeatured: true,
    views: 75
  }
];

const SAMPLE_STATS = {
  totalJobs: 156,
  activeJobs: 89,
  featuredJobs: 42,
  totalViews: 12500,
  totalApplications: 567
};

// Hero Carousel Images
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
    title: "Hire top talent",
    desc: "Find the perfect candidates for your organization",
  },
  {
    id: 3,
    imgUrl: "https://images.unsplash.com/photo-1635350736475-c8cef4b21906?auto=format&fit=crop&w=1470&q=80",
    title: "Easy Application Process",
    desc: "Apply to jobs with just a few clicks.",
  },
];

// Feature Cards
const featureCards = [
  {
    id: 1,
    title: "Remote Jobs",
    desc: "Work Anywhere in World",
    icon: "🏠",
    color: "primary"
  },
  {
    id: 2,
    title: "Higher Salary",
    desc: "Competitive salary packages",
    icon: "💰",
    color: "success"
  },
  {
    id: 3,
    title: "Flexible hours",
    desc: "Better work-life balance",
    icon: "⏰",
    color: "warning"
  },
  {
    id: 4,
    title: "Career Growth",
    desc: "Opportunities for advancement",
    icon: "📈",
    color: "info"
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
  const [usingSampleData, setUsingSampleData] = useState(false);
  const jobsPerPage = 6;
  const [stats, setStats] = useState(SAMPLE_STATS);
  const [userStats, setUserStats] = useState({
    jobsApplied: 0,
    profileViews: 0
  });

  // ============================================
  // FETCH DATA OR USE SAMPLE
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const API_URL = "http://localhost:5000";
        
        // Try to connect to backend
        try {
          const testResponse = await axios.get(`${API_URL}/`, { 
            timeout: 3000 
          });
          
          console.log("✅ Backend connected:", testResponse.data);
          
          // Fetch real data
          const [jobsResponse, statsResponse] = await Promise.allSettled([
            axios.get(`${API_URL}/api/jobs/active`, { timeout: 5000 }),
            axios.get(`${API_URL}/api/jobs/stats/summary`, { timeout: 5000 })
          ]);
          
          if (jobsResponse.status === 'fulfilled') {
            setJobs(jobsResponse.value.data.jobs || SAMPLE_JOBS);
          }
          
          if (statsResponse.status === 'fulfilled') {
            setStats(statsResponse.value.data.stats || SAMPLE_STATS);
          }
          
          setUsingSampleData(false);
          setError("");
          
        } catch (backendError) {
          console.log("⚠️ Using sample data:", backendError.message);
          
          // Use sample data
          setJobs(SAMPLE_JOBS);
          setStats(SAMPLE_STATS);
          setUsingSampleData(true);
          
          setError(
            <div>
              <strong>🔧 Development Mode:</strong> Backend not connected.<br/>
              <small className="text-muted">
                Displaying sample data. To connect backend:
                <ol className="mt-1 mb-0 small">
                  <li>Open terminal in backend folder</li>
                  <li>Run: <code>npm start</code></li>
                  <li>Refresh this page</li>
                </ol>
              </small>
            </div>
          );
        }
        
      } catch (error) {
        console.error("Error:", error);
        
        // Fallback to sample data
        setJobs(SAMPLE_JOBS);
        setStats(SAMPLE_STATS);
        setUsingSampleData(true);
        setError("Connected to sample data. Backend integration available.");
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================
  // FILTER JOBS
  // ============================================
  const filteredJobs = jobs.filter((job) => {
    const matchSearch = searchTerm === "" ||
      (job.jobTitle && job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = filterType === "" ||
      (job.jobType && job.jobType.toLowerCase() === filterType.toLowerCase());

    const matchLocation = locationFilter === "" ||
      (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));

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

  // Handle search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="home-page" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Job Porter loading...</p>
          <div className="alert alert-info mt-3 mx-auto" style={{ maxWidth: '500px' }}>
            <small>
              <strong>💡 Tip:</strong> If not loaded under 10 seconds,<br/>
              <button 
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            </small>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER - BEAUTIFUL DESIGN
  // ============================================
  return (
    <div className="home-page">
      {/* Notification Bar */}
      {usingSampleData && (
        <div className="alert alert-warning alert-dismissible fade show m-0 rounded-0 text-center" role="alert">
          <strong>🔬 Demo Mode:</strong> Using sample data. 
          <button 
            type="button" 
            className="btn btn-sm btn-outline-warning ms-2"
            onClick={() => window.open('http://localhost:5000', '_blank')}
          >
            Start Backend
          </button>
          <button 
            type="button" 
            className="btn-close ms-3" 
            onClick={() => setUsingSampleData(false)}
          />
        </div>
      )}

      {/* Hero Carousel */}
      <Carousel fade controls indicators className="hero-carousel">
        {heroCarouselData.map((slide) => (
          <Carousel.Item key={slide.id}>
            <div 
              className="carousel-image"
              style={{
                backgroundImage: `url(${slide.imgUrl})`,
                height: '70vh',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <Carousel.Caption className="carousel-caption-custom">
              <h1 className="display-4 fw-bold mb-3">{slide.title}</h1>
              <p className="lead mb-4">{slide.desc}</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <a href="/jobs" className="btn btn-primary btn-lg px-4">
                  Browse Jobs
                </a>
                {!isAuthenticated && (
                  <a href="/register" className="btn btn-outline-light btn-lg px-4">
                    Free Sign Up
                  </a>
                )}
              </div>
            </Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Main Content */}
      <div className="container main-content my-5">
        {/* Stats Section */}
        <div className="stats-section mb-5">
          <h2 className="text-center mb-4 fw-bold">📊 Job Portal Statistics</h2>
          <div className="row g-4">
            {[
              { title: "Total Jobs", value: stats.totalJobs, icon: "📋", color: "primary" },
              { title: "Active Jobs", value: stats.activeJobs, icon: "✅", color: "success" },
              { title: "Featured Jobs", value: stats.featuredJobs, icon: "⭐", color: "warning" },
              { title: "Total Applications", value: stats.totalApplications, icon: "📄", color: "info" },
            ].map((stat, index) => (
              <div className="col-md-3 col-sm-6" key={index}>
                <div className={`card border-${stat.color} border-2 shadow-sm h-100`}>
                  <div className="card-body text-center p-4">
                    <div className="display-1 mb-3">{stat.icon}</div>
                    <h3 className={`text-${stat.color} fw-bold`}>{stat.value}</h3>
                    <p className="card-text text-muted">{stat.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Section - COMPACT DESIGN */}
<div className="job-search-section mb-5">
  <div className="card shadow-lg border-0">
    <div className="card-body p-4 p-md-5">
      <h2 className="mb-4 fw-bold text-center">🔍 Find Your Perfect Job Match</h2>
      
      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="row g-2 g-md-3 align-items-center">
          {/* Search Input Group */}
          <div className="col-12">
            <div className="input-group input-group-lg shadow-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Job title, keywords, or company"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="input-group-text bg-white border-end-0 border-start-0">
                <i className="bi bi-geo-alt text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="City, state, or remote"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
              <select
                className="form-select border-start-0"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary px-4"
              >
                Find Jobs
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Quick Filters */}
      <div className="mb-3">
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <small className="text-muted me-2 align-self-center">Quick filters:</small>
          {['Remote', 'Full-time', 'Part-time', 'Internship', 'Entry Level'].map((filter) => (
            <button
              key={filter}
              className={`btn btn-sm ${filterType === filter ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setFilterType(filterType === filter ? '' : filter);
                setCurrentPage(1);
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
        <div>
          <span className="fw-bold">{filteredJobs.length}</span> job{filteredJobs.length !== 1 ? 's' : ''} found
          {(searchTerm || filterType || locationFilter) && (
            <span className="text-muted ms-2">
              <button
                className="btn btn-link text-danger p-0 border-0"
                onClick={handleResetFilters}
                style={{ textDecoration: 'none' }}
              >
                <i className="bi bi-x-circle me-1"></i>Clear filters
              </button>
            </span>
          )}
        </div>
        <div className="text-muted">
          Page <span className="fw-bold">{currentPage}</span> of <span className="fw-bold">{totalPages}</span>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Feature Cards */}
        <div className="feature-cards-section mb-5">
          <h2 className="text-center mb-4 fw-bold">✨ LadderUp Job Features</h2>
          <div className="row g-4">
            {featureCards.map((feature) => (
              <div className="col-md-3 col-sm-6" key={feature.id}>
                <div className={`card border-${feature.color} border-2 shadow-sm h-100 hover-lift`}>
                  <div className="card-body text-center p-4">
                    <div className="feature-icon display-1 mb-3">{feature.icon}</div>
                    <h4 className="card-title fw-bold">{feature.title}</h4>
                    <p className="card-text text-muted">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs Listing */}
        <div className="all-jobs-section">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h2 className="fw-bold mb-3 mb-md-0">💼 Fresh Job Opportunities</h2>
            <div className="d-flex flex-wrap gap-2">
              {['All', 'Full-time', 'Part-time', 'Remote', 'Contract'].map(type => (
                <button
                  key={type}
                  className={`btn ${filterType === (type === 'All' ? '' : type) ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => {
                    setFilterType(type === 'All' ? '' : type);
                    setCurrentPage(1);
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {filteredJobs.length > 0 ? (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {currentJobs.map((job) => (
                  <div key={job._id} className="col">
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-5">
                  <ul className="pagination justify-content-center flex-wrap">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        &laquo; Previous
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => handlePageChange(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(currentPage + 1)}
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
              <div className="card shadow border-0">
                <div className="card-body py-5">
                  <div className="display-1 text-muted mb-4">🔍</div>
                  <h3 className="mb-3">No Jobs Found</h3>
                  <p className="text-muted mb-4">
                    There are no jobs matching your search criteria.<br/>
                    Please try a different search term or filters.
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleResetFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="cta-section mt-5 pt-5">
          <div className="card bg-gradient-primary text-white border-0 shadow-lg">
            <div className="card-body text-center p-4 p-md-5">
              <h2 className="display-5 fw-bold mb-3">Start Your Journey</h2>
              <p className="lead mb-4">
                Thousands of Professionals Found Their Dream Job on LadderUp
              </p>
              <div className="d-flex flex-wrap gap-3 justify-content-center">
                {!isAuthenticated ? (
                  <>
                    <a href="/register" className="btn btn-light btn-lg px-4 px-md-5">
                      Free Register
                    </a>
                    <a href="/login" className="btn btn-outline-light btn-lg px-4 px-md-5">
                      Login
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/jobs" className="btn btn-light btn-lg px-4 px-md-5">
                      Explore More Jobs
                    </a>
                    <a href="/profile" className="btn btn-outline-light btn-lg px-4 px-md-5">
                      Update Profile
                    </a>
                  </>
                )}
              </div>
              <div className="mt-4">
                <small className="opacity-75">
                  ⚡ 100% Free | 🔒 Secure | 🌐 5000+ Jobs
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="container mt-5">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="display-4 mb-3">🚀</div>
                <h5>Fast Application</h5>
                <p className="small text-muted">One-Click Quick Apply System</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="display-4 mb-3">🎯</div>
                <h5>Smart Matching</h5>
                <p className="small text-muted">AI-based Job Recommendations</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="display-4 mb-3">📱</div>
                <h5>Responsive</h5>
                <p className="small text-muted">Access From Any Device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;