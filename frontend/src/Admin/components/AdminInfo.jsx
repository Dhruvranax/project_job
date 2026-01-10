import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import "./AdminInfo.css";

const AdminInfo = () => {
  const { admin, loading, isAuthenticated, candidates } = useAdmin();
  const [debugInfo, setDebugInfo] = useState("");
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    pendingApplications: 0
  });
  const [adminJobs, setAdminJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // API Base URL
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // Fetch admin stats and data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Get admin info from localStorage as fallback
        const savedAdmin = localStorage.getItem('admin');
        const adminData = admin || (savedAdmin ? JSON.parse(savedAdmin) : null);
        
        if (!adminData || !adminData.email) {
          setIsLoading(false);
          return;
        }

        console.log("🔄 Fetching admin data for:", adminData.email);
        
        // 1. Fetch admin's jobs
        const jobsResponse = await fetch(`${API_BASE_URL}/api/jobs`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          if (jobsData.success) {
            // Filter jobs by admin email
            const adminJobsList = jobsData.jobs.filter(job => 
              job.postedBy === adminData.email || 
              (adminData.companyName && job.companyName?.toLowerCase().includes(adminData.companyName.toLowerCase()))
            );
            
            setAdminJobs(adminJobsList);
            
            // Calculate active jobs
            const activeJobsCount = adminJobsList.filter(job => 
              job.status === 'Active' || job.status === 'Published'
            ).length;
            
            setStats(prev => ({ ...prev, activeJobs: activeJobsCount }));
          }
        }

        // 2. Fetch all applications
        const appsResponse = await fetch(`${API_BASE_URL}/api/applications`);
        if (appsResponse.ok) {
          const appsData = await appsResponse.json();
          if (appsData.success) {
            // Filter applications for admin's jobs
            const adminJobIds = adminJobs.map(job => job._id);
            const adminApplications = appsData.applications.filter(app => 
              adminJobIds.includes(app.jobId)
            );
            
            const totalApplications = adminApplications.length;
            const pendingApplications = adminApplications.filter(app => 
              app.status === 'Pending'
            ).length;
            
            setStats(prev => ({
              ...prev,
              totalApplications: totalApplications,
              pendingApplications: pendingApplications,
              totalCandidates: totalApplications // Each application = one candidate
            }));
          }
        }

        // 3. Try admin stats endpoint
        try {
          const statsResponse = await fetch(`${API_BASE_URL}/api/admin/stats`);
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            if (statsData.success) {
              setStats(prev => ({
                ...prev,
                ...statsData.stats
              }));
            }
          }
        } catch (error) {
          console.log("Admin stats endpoint not available");
        }

      } catch (error) {
        console.error("❌ Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, [admin, API_BASE_URL]);

  useEffect(() => {
    console.log("AdminInfo - Admin state:", admin);
    console.log("AdminInfo - isAuthenticated:", isAuthenticated);
    
    const savedAdmin = localStorage.getItem('admin');
    
    if (admin) {
      setDebugInfo(`Admin logged in: ${admin.fullName || admin.email}`);
    } else if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        setDebugInfo(`Admin in localStorage: ${parsed.fullName || parsed.email || "No name"}`);
      } catch (error) {
        setDebugInfo("Error parsing admin data");
      }
    } else {
      setDebugInfo("No admin found");
    }
  }, [admin, isAuthenticated, loading]);

  const getAdminDisplayName = () => {
    if (admin && admin.fullName) return admin.fullName;   
    if (admin && admin.email) return admin.email.split('@')[0];
    
    try {
      const savedAdmin = localStorage.getItem('admin');
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        return parsed.fullName || parsed.email?.split('@')[0] || "Admin";
      }
    } catch (error) {
      console.error("Error parsing admin from localStorage:", error);
    }
    
    return null;
  };
  
  const adminName = getAdminDisplayName();

  // Get recent applications (last 5)
  const getRecentApplications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const adminJobIds = adminJobs.map(job => job._id);
          const adminApps = data.applications.filter(app => 
            adminJobIds.includes(app.jobId)
          );
          return adminApps.slice(0, 5); // Last 5 applications
        }
      }
    } catch (error) {
      console.error("Error fetching recent applications:", error);
    }
    return [];
  };

  const adminBenefits = [
    {
      id: 1,
      icon: "fas fa-chart-line",
      title: "Advanced Analytics",
      description: "Track job performance, applicant metrics, and hiring trends with detailed analytics dashboard.",
      features: ["Real-time analytics", "Downloadable reports", "Performance metrics", "Trend analysis"]
    },
    {
      id: 2,
      icon: "fas fa-users",
      title: "Candidate Management",
      description: "Manage all job applications, screen candidates, and track hiring pipeline in one place.",
      features: ["Bulk applications review", "Candidate filtering", "Status tracking", "Communication tools"]
    },
    {
      id: 3,
      icon: "fas fa-briefcase",
      title: "Job Posting Tools",
      description: "Create, edit, and manage job listings with advanced tools and templates.",
      features: ["Multiple job templates", "Bulk posting", "Auto-refresh jobs", "Promotion tools"]
    },
    {
      id: 4,
      icon: "fas fa-bell",
      title: "Smart Notifications",
      description: "Get instant alerts for new applications, candidate actions, and important updates.",
      features: ["Real-time alerts", "Email notifications", "Custom alert rules", "Mobile notifications"]
    },
    {
      id: 5,
      icon: "fas fa-shield-alt",
      title: "Enhanced Security",
      description: "Advanced security features to protect your company data and candidate information.",
      features: ["Role-based access", "Data encryption", "Activity logs", "IP restrictions"]
    },
    {
      id: 6,
      icon: "fas fa-headset",
      title: "Priority Support",
      description: "Get dedicated support with faster response times and expert assistance.",
      features: ["24/7 chat support", "Dedicated account manager", "Phone support", "Training sessions"]
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹999",
      period: "/month",
      features: [
        "Post up to 10 jobs",
        "Receive 100 applications/month",
        "Basic analytics",
        "Email support",
        "2 team members"
      ],
      recommended: false
    },
    {
      name: "Professional",
      price: "₹2,499",
      period: "/month",
      features: [
        "Unlimited job postings",
        "Unlimited applications",
        "Advanced analytics",
        "Priority support",
        "10 team members",
        "Bulk candidate management",
        "Custom job templates"
      ],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "₹4,999",
      period: "/month",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "API access",
        "Custom integrations",
        "Dedicated account manager",
        "Onboarding training",
        "Custom reporting",
        "SLA guarantee"
      ],
      recommended: false
    }
  ];

  const handleLogout = () => {  
    localStorage.removeItem('admin');
    localStorage.removeItem('adminToken');
    window.location.href = '/admin-login';
  };

  const quickActions = [
    {
      id: 1,
      title: "Post New Job",
      description: "Create and publish a new job listing",
      icon: "fas fa-plus-circle",
      color: "primary",
      link: "/admin/post-job",
      disabled: !adminName
    },
    {
      id: 2,
      title: "View Jobs",
      description: `Manage your ${adminJobs.length} job postings`,
      icon: "fas fa-briefcase",
      color: "success",
      link: "/admin/jobs",
      disabled: !adminName
    },
    {
      id: 3,
      title: "Candidates",
      description: `Review ${stats.totalApplications} job applications`,
      icon: "fas fa-users",
      color: "info",
      link: "/admin/candidates",
      disabled: !adminName
    },
    {
      id: 4,
      title: "Analytics",
      description: "View hiring analytics",
      icon: "fas fa-chart-bar",
      color: "warning",
      link: "/admin/analytics",
      disabled: !adminName
    }
  ];

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-info-page">
      {/* Debug Info - Optional */}
      <div className="debug-info">
        {debugInfo}
      </div>

      {/* Hero Section */}
      <section className="admin-hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              {adminName ? (
                <>
                  <div className="welcome-badge">
                    <i className="fas fa-user-tie"></i>
                    Welcome back, {admin?.companyName ? `${admin.companyName} Admin` : 'Admin'}
                  </div>
                  <h1 className="hero-title">
                    Hi, <span className="text-gradient">{adminName}</span>!
                  </h1>
                  <p className="hero-subtitle">
                    Ready to find your next great hire? Start posting jobs or explore your dashboard.
                  </p>
                  
                  <div className="hero-stats">
                    <div className="stat-item">
                      <div className="stat-number">{stats.activeJobs}</div>
                      <div className="stat-label">Active Jobs</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats.totalApplications}</div>
                      <div className="stat-label">Applications</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats.totalCandidates}</div>
                      <div className="stat-label">Candidates</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">{stats.pendingApplications}</div>
                      <div className="stat-label">Pending Review</div>
                    </div>
                  </div>
                </>

              ) : ( 
                <>
                  <div className="welcome-badge">
                    <i className="fas fa-briefcase"></i>
                    Admin Portal
                  </div>
                  <h1 className="hero-title">
                    Power Your <span className="text-gradient">Hiring Process</span>
                  </h1>
                  <p className="hero-subtitle">
                    Streamline recruitment, find better candidates faster, and make data-driven hiring decisions.
                  </p>
                </>
              )}

              <div className="hero-actions">
                {adminName ? (
                  <>
                    <Link to="/admin/post-job" className="btn-primary">
                      <i className="fas fa-plus-circle"></i>
                      Post New Job
                    </Link>
                    <Link to="/admin/dashboard" className="btn-secondary">
                      <i className="fas fa-tachometer-alt"></i>
                      View Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin-login" className="btn-primary">
                      <i className="fas fa-sign-in-alt"></i>
                      Admin Login
                    </Link>
                    <Link to="/admin-register" className="btn-secondary">
                      <i className="fas fa-user-plus"></i>
                      Register as Admin
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" 
                alt="Admin Dashboard" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      {adminName && (
        <section className="quick-actions-section">
          <div className="container">
            <div className="section-header">
              <h2>Quick Actions</h2>
              <p>Get started with these common tasks</p>
            </div>
            
            <div className="actions-grid">
              {quickActions.map((action) => (
                <Link 
                  to={action.link} 
                  key={action.id}
                  className={`action-card ${action.disabled ? 'disabled' : ''}`}
                >
                  <div className="action-icon">
                    <i className={action.icon}></i>
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <div className="action-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Admin Stats Overview */}
      {adminName && adminJobs.length > 0 && (
        <section className="stats-overview-section">
          <div className="container">
            <div className="section-header">
              <h2>Your Hiring Overview</h2>
              <p>Real-time insights about your recruitment activities</p>
            </div>
            
            <div className="stats-cards">
              <div className="stats-card primary">
                <div className="stats-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <div className="stats-content">
                  <h3>{adminJobs.length}</h3>
                  <p>Total Jobs Posted</p>
                </div>
                <div className="stats-trend">
                  <i className="fas fa-arrow-up"></i>
                  <span>Active: {stats.activeJobs}</span>
                </div>
              </div>
              
              <div className="stats-card success">
                <div className="stats-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stats-content">
                  <h3>{stats.totalApplications}</h3>
                  <p>Total Applications</p>
                </div>
                <div className="stats-trend">
                  <i className="fas fa-clock"></i>
                  <span>Pending: {stats.pendingApplications}</span>
                </div>
              </div>
              
              <div className="stats-card warning">
                <div className="stats-icon">
                  <i className="fas fa-chart-line"></i>
                </div>
                <div className="stats-content">
                  <h3>
                    {adminJobs.length > 0 
                      ? Math.round((stats.totalApplications / adminJobs.length) * 10) / 10 
                      : 0}
                  </h3>
                  <p>Avg. Applications per Job</p>
                </div>
                <div className="stats-trend">
                  <i className="fas fa-calculator"></i>
                  <span>Across {adminJobs.length} jobs</span>
                </div>
              </div>
              
              <div className="stats-card info">
                <div className="stats-icon">
                  <i className="fas fa-user-check"></i>
                </div>
                <div className="stats-content">
                  <h3>
                    {stats.totalApplications > 0 
                      ? Math.round(((stats.totalApplications - stats.pendingApplications) / stats.totalApplications) * 100) 
                      : 0}%
                  </h3>
                  <p>Applications Reviewed</p>
                </div>
                <div className="stats-trend">
                  <i className="fas fa-chart-pie"></i>
                  <span>Completion Rate</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <div className="activity-list">
                {adminJobs.slice(0, 3).map(job => (
                  <div key={job._id} className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="activity-content">
                      <h4>{job.jobTitle || job.title}</h4>
                      <p>
                        <span className="activity-stat">
                          <i className="fas fa-user-friends"></i>
                          {job.applications || 0} applications
                        </span>
                        <span className="activity-stat">
                          <i className="fas fa-eye"></i>
                          {job.views || 0} views
                        </span>
                      </p>
                    </div>
                    <div className="activity-status">
                      <span className={`status-badge ${job.status === 'Active' ? 'active' : 'inactive'}`}>
                        {job.status || 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {adminJobs.length === 0 && (
                  <div className="activity-item empty">
                    <div className="activity-icon">
                      <i className="fas fa-inbox"></i>
                    </div>
                    <div className="activity-content">
                      <h4>No jobs posted yet</h4>
                      <p>Post your first job to start receiving applications</p>
                    </div>
                    <div className="activity-status">
                      <Link to="/admin/post-job" className="btn-small">
                        Post Job
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Job Posting Promo Section */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-content">
            <div className="promo-text">
              <h2>
                {adminName 
                  ? `Start Hiring Today, ${adminName.split(' ')[0]}!`
                  : "Start Hiring Today!"
                }
              </h2>
              <p>
                {adminName 
                  ? `You have ${stats.activeJobs} active job${stats.activeJobs !== 1 ? 's' : ''}. Post more jobs to reach thousands of qualified candidates.`
                  : "Post your first job in minutes and reach thousands of qualified candidates. Our platform makes hiring simple and effective."
                }
              </p>
              <div className="promo-features">
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Easy job posting wizard</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Free job promotion</span>
                </div>
                <div className="feature">
                  <i className="fas fa-check-circle"></i>
                  <span>Quality candidate matching</span>
                </div>
              </div>
            </div>
            <div className="promo-action">
              {adminName ? (
                <Link to="/admin/post-job" className="promo-btn">
                  <i className="fas fa-plus-circle"></i>
                  {adminJobs.length > 0 ? "Post Another Job" : "Post Your First Job"}
                </Link>
              ) : (
                <div className="promo-auth">
                  <Link to="/admin-login" className="promo-btn">
                    <i className="fas fa-sign-in-alt"></i>
                    Login to Post Jobs
                  </Link>
                  <p className="promo-auth-text">
                    New to JobFind Admin? <Link to="/admin-register">Register here</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose JobFind Admin?</h2>
            <p>Everything you need to manage recruitment efficiently</p>
          </div>
          
          <div className="benefits-grid">
            {adminBenefits.map((benefit) => (
              <div className="benefit-card" key={benefit.id}>
                <div className="benefit-icon">
                  <i className={benefit.icon}></i>
                </div>
                <h3>{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
                <ul className="benefit-features">
                  {benefit.features.map((feature, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Simple, Transparent Pricing</h2>
            <p>Choose the plan that fits your hiring needs</p>
          </div>
          
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div 
                className={`pricing-card ${plan.recommended ? 'recommended' : ''}`} 
                key={index}
              >
                {plan.recommended && (
                  <div className="recommended-badge">Most Popular</div>
                )}
                
                <div className="pricing-header">
                  <h3>{plan.name}</h3>
                  <div className="price">
                    <span className="amount">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>
                
                <div className="pricing-body">
                  <ul className="features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    to="/admin-register" 
                    className={`pricing-btn ${plan.recommended ? 'btn-primary' : 'btn-outline'}`}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Ready to Transform Your Hiring?</h2>
              <p>
                {adminName 
                  ? `You're already making progress with ${stats.totalApplications} applications! Continue to grow.`
                  : "Join hundreds of companies using JobFind Admin to find perfect candidates."
                }
              </p>
            </div>
            <div className="cta-actions">
              {adminName ? (
                <>
                  <Link to="/admin/jobs" className="btn-primary">
                    View All Jobs
                  </Link>
                  <Link to="/admin/candidates" className="btn-outline">
                    Manage Candidates
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/admin-register" className="btn-primary">
                    Start Free Trial
                  </Link>
                  <Link to="/contact" className="btn-outline">
                    Schedule Demo
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
          </div>
          
          <div className="faq-grid">
            <div className="faq-column">
              <div className="faq-item">
                <h4>Who can become an admin?</h4>
                <p>Any recruiter, HR professional, or business owner who needs to hire talent can register. Company verification may be required for certain features.</p>
              </div>
              <div className="faq-item">
                <h4>Is there a free trial?</h4>
                <p>Yes! All plans come with a 14-day free trial. No credit card required. Get full access to all features during the trial.</p>
              </div>
            </div>
            <div className="faq-column">
              <div className="faq-item">
                <h4>How do I post a job?</h4>
                <p>After logging in, click "Post New Job". Fill in job details, requirements, and benefits. Your job will be live immediately.</p>
              </div>
              <div className="faq-item">
                <h4>What support do you offer?</h4>
                <p>Email support for all plans, chat support for Professional and Enterprise plans, and phone support for Enterprise customers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Quick Links */}
      <section className="footer-links">
        <div className="container">
          <div className="links-grid">
            {adminName ? (
              <>
                <Link to="/admin/post-job" className="link-btn btn-primary">
                  <i className="fas fa-plus-circle"></i>
                  Post Job
                </Link>
                <Link to="/admin/dashboard" className="link-btn">
                  <i className="fas fa-tachometer-alt"></i>
                  Dashboard
                </Link>
                <Link to="/admin/profile" className="link-btn">
                  <i className="fas fa-user-cog"></i>
                  Profile
                </Link>
                <button onClick={handleLogout} className="link-btn logout-btn">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/admin-login" className="link-btn btn-primary">
                  <i className="fas fa-sign-in-alt"></i>
                  Admin Login
                </Link>
                <Link to="/admin-register" className="link-btn">
                  <i className="fas fa-user-plus"></i>
                  Register
                </Link>
                <Link to="/contact" className="link-btn">
                  <i className="fas fa-question-circle"></i>
                  Help & Support
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminInfo;