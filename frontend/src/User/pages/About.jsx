import React, { useState, useEffect, useRef } from 'react';
import { FaBullseye, FaUsers, FaRocket, FaChartLine, FaHandshake, FaAward, FaLightbulb, FaHeart, FaGlobe, FaUserTie, FaCode, FaMobileAlt } from 'react-icons/fa';
import { IoStatsChart, IoPeople, IoBriefcase } from 'react-icons/io5';

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const [counterValues, setCounterValues] = useState({
    candidates: 0,
    companies: 0,
    placements: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          
          // Animate counters
          animateCounter('candidates', 10000);
          animateCounter('companies', 500);
          animateCounter('placements', 5000);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const animateCounter = (key, target) => {
    let count = 0;
    const duration = 2000; 
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      setCounterValues(prev => ({ ...prev, [key]: Math.floor(count) }));
    }, interval);
  };

  const TabContent = () => {
    switch(activeTab) {
      case 'mission':
        return (
          <div className="tab-pane fade show active">
            <div className="row">
              <div className="col-md-6">
                <h4>Our Purpose</h4>
                <p>We're on a mission to transform how people find meaningful work and how companies discover exceptional talent.</p>
                <ul className="list-unstyled">
                  <li className="mb-2"><FaHeart className="text-primary me-2" /> Passion for helping others succeed</li>
                  <li className="mb-2"><FaLightbulb className="text-primary me-2" /> Innovative approach to job matching</li>
                  <li className="mb-2"><FaGlobe className="text-primary me-2" /> Commitment to connecting talent globally</li>
                </ul>
              </div>
              <div className="col-md-6">
                <div className="progress-container">
                  <div className="d-flex justify-content-between">
                    <span>Job Match Accuracy</span>
                    <span>92%</span>
                  </div>
                  <div className="progress mb-4">
                    <div className="progress-bar bg-primary" role="progressbar" style={{width: '92%'}}></div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <span>User Satisfaction</span>
                    <span>95%</span>
                  </div>
                  <div className="progress mb-4">
                    <div className="progress-bar bg-success" role="progressbar" style={{width: '95%'}}></div>
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <span>Employer Retention</span>
                    <span>89%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar bg-info" role="progressbar" style={{width: '89%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'story':
        return (
          <div className="tab-pane fade show active">
            <div className="row">
              <div className="col-md-6">
                <h4>Our Journey</h4>
                <p>Founded in 2018, LadderUp started as a small initiative to help local job seekers in Surat connect with nearby employers.</p>
                <p>Today, we've grown into a comprehensive platform serving thousands of users across India with plans to expand globally.</p>
              </div>
              <div className="col-md-6">
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">2018</div>
                    <div className="timeline-content">
                      <h5>Foundation</h5>
                      <p>LadderUp was founded with a vision to transform job searching</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">2020</div>
                    <div className="timeline-content">
                      <h5>Platform Launch</h5>
                      <p>Launched our AI-powered matching algorithm</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">2022</div>
                    <div className="timeline-content">
                      <h5>Mobile App</h5>
                      <p>Released our iOS and Android applications</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-date">2023</div>
                    <div className="timeline-content">
                      <h5>10k Users</h5>
                      <p>Reached milestone of 10,000 active job seekers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="tab-pane fade show active">
            <h4>Our Approach</h4>
            <div className="row">
              <div className="col-md-6">
                <div className="team-approach-card">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <FaUserTie className="text-primary fs-1" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5>Candidate Focused</h5>
                      <p>We prioritize the job seeker experience with intuitive tools and personalized guidance.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="team-approach-card">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <IoBriefcase className="text-primary fs-1" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5>Employer Solutions</h5>
                      <p>We provide employers with efficient tools to find the perfect candidates quickly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="team-approach-card">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <FaCode className="text-primary fs-1" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5>Technology Driven</h5>
                      <p>Our platform uses advanced algorithms to match skills with opportunities.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="team-approach-card">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <FaMobileAlt className="text-primary fs-1" />
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h5>Mobile First</h5>
                      <p>We've designed our experience for the modern, on-the-go job seeker.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid px-0 about-page">
      {/* Animated Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h1 className="display-3 fw-bold mb-3">About <span className="text-primary">LadderUp</span></h1>
                <p className="lead mb-4">
                  Empowering careers. Connecting talent. Building futures.
                </p>
                <div className="hero-badges">
                  <span className="badge bg-primary me-2">Innovative</span>
                  <span className="badge bg-success me-2">Trusted</span>
                  <span className="badge bg-info">Effective</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,224C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <section className="stats-section py-5" ref={sectionRef}>
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-md-4">
              <div className={`stats-card ${isVisible ? 'animate' : ''}`}>
                <div className="icon-wrapper">
                  <IoPeople size={30} />
                </div>
                <h2 className="counter-value">{counterValues.candidates.toLocaleString()}+</h2>
                <p className="stats-label">Active Job Seekers</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`stats-card ${isVisible ? 'animate' : ''}`}>
                <div className="icon-wrapper">
                  <IoBriefcase size={30} />
                </div>
                <h2 className="counter-value">{counterValues.companies.toLocaleString()}+</h2>
                <p className="stats-label">Partner Companies</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`stats-card ${isVisible ? 'animate' : ''}`}>
                <div className="icon-wrapper">
                  <IoStatsChart size={30} />
                </div>
                <h2 className="counter-value">{counterValues.placements.toLocaleString()}+</h2>
                <p className="stats-label">Successful Placements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Section */}
      <section className="tabs-section py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="tabs-card">
                <ul className="nav nav-tabs" id="aboutTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'mission' ? 'active' : ''}`}
                      onClick={() => setActiveTab('mission')}
                    >
                      <FaBullseye className="me-2" /> Mission & Values
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'story' ? 'active' : ''}`}
                      onClick={() => setActiveTab('story')}
                    >
                      <FaRocket className="me-2" /> Our Story
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'team' ? 'active' : ''}`}
                      onClick={() => setActiveTab('team')}
                    >
                      <FaUsers className="me-2" /> Our Approach
                    </button>
                  </li>
                </ul>
                <div className="tab-content p-4">
                  <TabContent />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="technology-section py-5">
        <div className="container">
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-3">Our Technology</h2>
              <p className="text-muted">Powered by cutting-edge algorithms and designed for simplicity</p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="tech-card">
                <div className="tech-icon ai-icon">
                  <div className="inner-circle"></div>
                </div>
                <h5>AI Matching</h5>
                <p>Advanced algorithms connect the right talent with the right opportunities</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="tech-card">
                <div className="tech-icon data-icon">
                  <div className="inner-circle"></div>
                </div>
                <h5>Data Insights</h5>
                <p>Real-time analytics help optimize your profile and job search strategy</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="tech-card">
                <div className="tech-icon mobile-icon">
                  <div className="inner-circle"></div>
                </div>
                <h5>Mobile First</h5>
                <p>Access your job search anywhere, anytime with our mobile app</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="tech-card">
                <div className="tech-icon security-icon">
                  <div className="inner-circle"></div>
                </div>
                <h5>Privacy Focused</h5>
                <p>Your data is protected with enterprise-grade security measures</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="fw-bold mb-4">Ready to climb your career ladder?</h2>
              <p className="mb-4">Join thousands who have found their dream jobs through LadderUp</p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-light btn-lg">Sign Up Now</button>
                <button className="btn btn-outline-light btn-lg">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .about-page {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .about-hero {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          padding: 5rem 0 0;
          position: relative;
        }
        
        .hero-content {
          padding-bottom: 6rem;
        }
        
        .hero-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          overflow: hidden;
          line-height: 0;
        }
        
        .hero-badges {
          margin-top: 1.5rem;
        }
        
        .stats-section {
          background: white;
          margin-top: -2rem;
          position: relative;
          z-index: 10;
        }
        
        .stats-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(20px);
        }
        
        .stats-card.animate {
          opacity: 1;
          transform: translateY(0);
        }
        
        .stats-card:nth-child(1).animate {
          transition-delay: 0.1s;
        }
        
        .stats-card:nth-child(2).animate {
          transition-delay: 0.2s;
        }
        
        .stats-card:nth-child(3).animate {
          transition-delay: 0.3s;
        }
        
        .stats-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        
        .icon-wrapper {
          width: 70px;
          height: 70px;
          background: rgba(13, 110, 253, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        
        .counter-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0d6efd;
          margin-bottom: 0.5rem;
        }
        
        .stats-label {
          color: #6c757d;
          font-weight: 500;
        }
        
        .tabs-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        
        .nav-tabs {
          padding: 1.5rem 1.5rem 0;
          border-bottom: 1px solid #dee2e6;
          background: #f8f9fa;
        }
        
        .nav-link {
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 8px 8px 0 0;
          font-weight: 500;
          color: #6c757d;
          background: transparent;
        }
        
        .nav-link.active {
          color: #0d6efd;
          background: white;
          border-bottom: 3px solid #0d6efd;
        }
        
        .tab-content {
          min-height: 250px;
        }
        
        .progress-container {
          padding: 1rem;
        }
        
        .progress {
          height: 8px;
          border-radius: 4px;
        }
        
        .timeline {
          position: relative;
          padding-left: 2rem;
        }
        
        .timeline-item {
          position: relative;
          padding-bottom: 2rem;
        }
        
        .timeline-item:before {
          content: '';
          position: absolute;
          left: -2rem;
          top: 0;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0d6efd;
        }
        
        .timeline-item:after {
          content: '';
          position: absolute;
          left: -1.92rem;
          top: 16px;
          width: 2px;
          height: 100%;
          background: #dee2e6;
        }
        
        .timeline-item:last-child:after {
          display: none;
        }
        
        .timeline-date {
          font-weight: 600;
          color: #0d6efd;
          margin-bottom: 0.5rem;
        }
        
        .team-approach-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          height: 100%;
        }
        
        .technology-section {
          background: white;
        }
        
        .tech-card {
          text-align: center;
          padding: 2rem 1rem;
        }
        
        .tech-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          margin: 0 auto 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        
        .inner-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0d6efd;
          font-size: 1.8rem;
        }
        
        .cta-section {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
        }
      `}</style>
    </div>
  );
};

export default About;