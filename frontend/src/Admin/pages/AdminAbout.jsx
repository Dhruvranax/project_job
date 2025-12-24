// src/Admin/pages/About.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import './AdminAbout.css';
 

const About = () => {
  const { admin } = useAdmin();

  const teamMembers = [
    {
      id: 1,
      name: "Rajesh Patel",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      description: "10+ years in HR Tech",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "#"
      }
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1494790108755-2616b786d4d9?auto=format&fit=crop&w=400&q=80",
      description: "Product strategy expert",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "#"
      }
    },
    {
      id: 3,
      name: "Amit Kumar",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      description: "Technology visionary",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "#"
      }
    },
    {
      id: 4,
      name: "Neha Gupta",
      role: "Head of Customer Success",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      description: "Customer experience specialist",
      social: {
        linkedin: "#",
        twitter: "#",
        email: "#"
      }
    }
  ];

  const milestones = [
    { year: "2020", event: "Founded JobFind with vision to revolutionize hiring" },
    { year: "2021", event: "Launched first version of Admin Portal" },
    { year: "2022", event: "Reached 1000+ companies using our platform" },
    { year: "2023", event: "Expanded to 50+ cities across India" },
    { year: "2024", event: "Launched AI-powered candidate matching" }
  ];

  const values = [
    {
      icon: "fas fa-handshake",
      title: "Trust & Transparency",
      description: "We believe in building relationships based on trust and complete transparency."
    },
    {
      icon: "fas fa-rocket",
      title: "Innovation",
      description: "Continuously innovating to provide the best hiring solutions for our clients."
    },
    {
      icon: "fas fa-users",
      title: "Customer Centric",
      description: "Our customers are at the heart of everything we do."
    },
    {
      icon: "fas fa-shield-alt",
      title: "Security",
      description: "Top-notch security to protect your data and candidate information."
    }
  ];

  return (
    <div className="admin-about-page">
      {/* Hero Section */}
      <section className="about-hero-section py-5 bg-primary text-white">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent p-0 mb-3">
                  <li className="breadcrumb-item">
                    <Link to="/admin-dashboard" className="text-white-50">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active text-white" aria-current="page">About Us</li>
                </ol>
              </nav>
              
              <h1 className="display-4 fw-bold mb-3">About JobFind Admin Portal</h1>
              <p className="lead mb-4">
                Empowering recruiters and businesses with intelligent hiring solutions since 2020
              </p>
              
              <div className="d-flex flex-wrap gap-3">
                <Link to="/admin-dashboard" className="btn btn-light">
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Dashboard
                </Link>
                <Link to="/contact" className="btn btn-outline-light">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="col-lg-4 text-center">
              <div className="hero-icon">
                <i className="fas fa-info-circle fa-6x opacity-75"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="story-section py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
                alt="Our Story"
                className="img-fluid rounded shadow"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="section-title mb-4">Our Story</h2>
              <p className="lead text-muted mb-4">
                JobFind was born out of a simple observation: hiring is hard, and great talent is hard to find. 
                We saw recruiters and HR professionals struggling with outdated systems, fragmented tools, 
                and inefficient processes.
              </p>
              <p className="text-muted mb-4">
                In 2020, we set out to change that. Our mission was to create a comprehensive, 
                user-friendly platform that would streamline the entire hiring process from start to finish.
              </p>
              <p className="text-muted">
                Today, JobFind Admin Portal serves hundreds of companies across India, 
                helping them find, screen, and hire the right talent efficiently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="mission-icon mb-3">
                    <i className="fas fa-bullseye fa-3x text-primary"></i>
                  </div>
                  <h3 className="card-title mb-3">Our Mission</h3>
                  <p className="card-text text-muted">
                    To empower every organization with the tools and insights they need to make 
                    smart hiring decisions, connect with exceptional talent, and build teams that drive success.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="mission-icon mb-3">
                    <i className="fas fa-eye fa-3x text-primary"></i>
                  </div>
                  <h3 className="card-title mb-3">Our Vision</h3>
                  <p className="card-text text-muted">
                    To become the most trusted and innovative hiring platform in India, 
                    transforming how companies discover and hire talent through technology 
                    and data-driven insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="values-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Our Core Values</h2>
            <p className="lead text-muted">The principles that guide everything we do</p>
          </div>
          
          <div className="row g-4">
            {values.map((value, index) => (
              <div className="col-md-6 col-lg-3" key={index}>
                <div className="value-card text-center p-4 h-100">
                  <div className="value-icon mb-3">
                    <i className={`${value.icon} fa-3x text-primary`}></i>
                  </div>
                  <h4 className="mb-3">{value.title}</h4>
                  <p className="text-muted mb-0">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Meet Our Leadership Team</h2>
            <p className="lead text-muted">The passionate people behind JobFind</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {teamMembers.map((member) => (
              <div className="col-md-6 col-lg-3" key={member.id}>
                <div className="team-card text-center">
                  <div className="team-image mb-3">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="img-fluid rounded-circle"
                    />
                  </div>
                  <h5 className="mb-1">{member.name}</h5>
                  <p className="text-primary fw-bold mb-1">{member.role}</p>
                  <p className="text-muted small mb-3">{member.description}</p>
                  <div className="social-links">
                    <a href={member.social.linkedin} className="btn btn-sm btn-outline-primary mx-1">
                      <i className="fab fa-linkedin"></i>
                    </a>
                    <a href={member.social.twitter} className="btn btn-sm btn-outline-info mx-1">
                      <i className="fab fa-twitter"></i>
                    </a>
                    <a href={`mailto:${member.social.email}`} className="btn btn-sm btn-outline-danger mx-1">
                      <i className="fas fa-envelope"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="milestones-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Our Journey</h2>
            <p className="lead text-muted">Key milestones in our growth story</p>
          </div>
          
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <p className="mb-0">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-primary text-white">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h2 className="display-2 fw-bold mb-2">1000+</h2>
                <p className="mb-0">Companies Trust Us</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h2 className="display-2 fw-bold mb-2">50+</h2>
                <p className="mb-0">Cities Across India</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h2 className="display-2 fw-bold mb-2">10K+</h2>
                <p className="mb-0">Successful Hires</p>
              </div>
            </div>
            <div className="col-md-3 mb-4">
              <div className="stat-item">
                <h2 className="display-2 fw-bold mb-2">24/7</h2>
                <p className="mb-0">Support Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="card border-0 shadow-lg">
            <div className="card-body p-5 text-center">
              <h2 className="card-title mb-3">Ready to Join Our Growing Community?</h2>
              <p className="card-text lead text-muted mb-4">
                Join thousands of recruiters and HR professionals who trust JobFind for their hiring needs.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                {admin ? (
                  <>
                    <Link to="/admin-dashboard" className="btn btn-primary btn-lg">
                      <i className="fas fa-tachometer-alt me-2"></i>
                      Go to Dashboard
                    </Link>
                    <Link to="/admin-jobs" className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-briefcase me-2"></i>
                      Post a Job
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin-register" className="btn btn-primary btn-lg">
                      <i className="fas fa-user-plus me-2"></i>
                      Register as Admin
                    </Link>
                    <Link to="/admin-login" className="btn btn-outline-primary btn-lg">
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Admin Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links py-4 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <Link to="/contact" className="btn btn-outline-primary w-100">
                <i className="fas fa-headset me-2"></i>
                Contact Support
              </Link>
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <Link to="/faq" className="btn btn-outline-primary w-100">
                <i className="fas fa-question-circle me-2"></i>
                View FAQ
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/pricing" className="btn btn-outline-primary w-100">
                <i className="fas fa-tag me-2"></i>
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;