import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import "./AdminInfo.css";

const AdminInfo = () => {
  const { admin, loading, isAuthenticated } = useAdmin();
  const [debugInfo, setDebugInfo] = useState("");
  
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
      description: "Manage your job postings",
      icon: "fas fa-briefcase",
      color: "success",
      link: "/admin/jobs",
      disabled: !adminName
    },
    {
      id: 3,
      title: "Candidates",
      description: "Review job applications",
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
                    Welcome back
                  </div>
                  <h1 className="hero-title">
                    Hi, <span className="text-gradient">{adminName}</span>!
                  </h1>
                  <p className="hero-subtitle">
                    Ready to find your next great hire? Start posting jobs or explore your dashboard.
                  </p>
                  
                  <div className="hero-stats">
                    <div className="stat-item">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Active Jobs</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Applications</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">0</div>
                      <div className="stat-label">Candidates</div>
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

      {/* Job Posting Promo Section */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-content">
            <div className="promo-text">
              <h2>Start Hiring Today!</h2>
              <p>
                Post your first job in minutes and reach thousands of qualified candidates. 
                Our platform makes hiring simple and effective.
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
                  Post Your First Job
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
              <p>Join hundreds of companies using JobFind Admin to find perfect candidates.</p>
            </div>
            <div className="cta-actions">
              <Link to="/admin-register" className="btn-primary">
                Start Free Trial
              </Link>
              <Link to="/contact" className="btn-outline">
                Schedule Demo
              </Link>
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