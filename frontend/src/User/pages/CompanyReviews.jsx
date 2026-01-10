import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Star, 
  TrendingUp, 
  Users, 
  Building, 
  Filter,
  ArrowRight,
  Award,
  TrendingUp as TrendingUpIcon,
  MapPin,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import './CompanyReviews.css';

const companies = [
  {
    id: 1,
    name: 'Apollo Pharmacy',
    logo: '/Appolo.jpg',
    reviews: 162,
    stars: 4.2,
    industry: 'Healthcare',
    location: 'Mumbai',
    rating: 'Good',
    trend: 'up',
    featured: true,
    jobs: 45,
    verified: true
  },
  {
    id: 2,
    name: 'Kotak Mahindra Bank',
    logo: '/kotak.jpg',
    reviews: 2252,
    stars: 4.5,
    industry: 'Banking',
    location: 'Mumbai',
    rating: 'Excellent',
    trend: 'up',
    featured: true,
    jobs: 120,
    verified: true
  },
  {
    id: 3,
    name: 'IDFC FIRST Bank',
    logo: '/idfc.jpg',
    reviews: 580,
    stars: 4.0,
    industry: 'Banking',
    location: 'Mumbai',
    rating: 'Good',
    trend: 'up',
    jobs: 85,
    verified: true
  },
  {
    id: 4,
    name: 'TCS',
    logo: '/tcs.jpg',
    reviews: 1000,
    stars: 3.5,
    industry: 'IT Services',
    location: 'Pan India',
    rating: 'Average',
    trend: 'neutral',
    jobs: 500,
    verified: true
  },
  {
    id: 5,
    name: 'Google',
    logo: '/google.jpg',
    reviews: 200,
    stars: 4.6,
    industry: 'Technology',
    location: 'Bangalore',
    rating: 'Excellent',
    trend: 'up',
    featured: true,
    jobs: 75,
    verified: true
  },
  {
    id: 6,
    name: 'L&T',
    logo: '/lt.jpg',
    reviews: 900,
    stars: 4.8,
    industry: 'Engineering',
    location: 'Mumbai',
    rating: 'Excellent',
    trend: 'up',
    jobs: 200,
    verified: true
  },
  {
    id: 7,
    name: 'Reliance Industries',
    logo: '/reliance.jpg',
    reviews: 100,
    stars: 4.9,
    industry: 'Conglomerate',
    location: 'Mumbai',
    rating: 'Excellent',
    trend: 'up',
    featured: true,
    jobs: 150,
    verified: true
  },
  {
    id: 8,
    name: 'JIO Platforms',
    logo: '/jio.jpg',
    reviews: 700,
    stars: 3.5,
    industry: 'Telecom',
    location: 'Pan India',
    rating: 'Average',
    trend: 'down',
    jobs: 95,
    verified: true
  },
  {
    id: 9,
    name: 'Amazon',
    logo: '/amazon.jpg',
    reviews: 5000,
    stars: 4.9,
    industry: 'E-commerce',
    location: 'Bangalore',
    rating: 'Excellent',
    trend: 'up',
    featured: true,
    jobs: 300,
    verified: true
  },
  {
    id: 10,
    name: 'Adani Ports',
    logo: '/adani.jpg',
    reviews: 800,
    stars: 2.5,
    industry: 'Infrastructure',
    location: 'Ahmedabad',
    rating: 'Poor',
    trend: 'down',
    jobs: 60,
    verified: true
  },
  {
    id: 11,
    name: 'Infosys',
    logo: '/infosys.jpg',
    reviews: 3500,
    stars: 4.0,
    industry: 'IT Services',
    location: 'Bangalore',
    rating: 'Good',
    trend: 'up',
    jobs: 400,
    verified: true
  },
  {
    id: 12,
    name: 'Microsoft',
    logo: '/microsoft.jpg',
    reviews: 1500,
    stars: 4.7,
    industry: 'Technology',
    location: 'Hyderabad',
    rating: 'Excellent',
    trend: 'up',
    jobs: 125,
    verified: true
  }
];

const industries = ['All', 'Technology', 'Banking', 'Healthcare', 'Engineering', 'E-commerce', 'Telecom', 'IT Services'];
const locations = ['All Locations', 'Mumbai', 'Bangalore', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad'];
const ratings = ['All Ratings', 'Excellent (4.5+)', 'Good (4.0+)', 'Average (3.0+)', 'Poor (< 3.0)'];

const CompanyReviews = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [sortBy, setSortBy] = useState('rating');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'All' || company.industry === selectedIndustry;
    const matchesLocation = selectedLocation === 'All Locations' || company.location === selectedLocation;
    
    let matchesRating = true;
    if (selectedRating === 'Excellent (4.5+)') matchesRating = company.stars >= 4.5;
    else if (selectedRating === 'Good (4.0+)') matchesRating = company.stars >= 4.0;
    else if (selectedRating === 'Average (3.0+)') matchesRating = company.stars >= 3.0;
    else if (selectedRating === 'Poor (< 3.0)') matchesRating = company.stars < 3.0;
    
    return matchesSearch && matchesIndustry && matchesLocation && matchesRating;
  }).sort((a, b) => {
    switch(sortBy) {
      case 'rating': return b.stars - a.stars;
      case 'reviews': return b.reviews - a.reviews;
      case 'jobs': return b.jobs - a.jobs;
      case 'name': return a.name.localeCompare(b.name);
      default: return b.stars - a.stars;
    }
  });

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="star filled" size={18} fill="#FFD700" />
        ))}
        {halfStar && <Star className="star half" size={18} fill="#FFD700" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="star empty" size={18} fill="#E5E7EB" />
        ))}
        <span className="rating-text">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const getRatingColor = (stars) => {
    if (stars >= 4.5) return '#10B981';
    if (stars >= 4.0) return '#3B82F6';
    if (stars >= 3.0) return '#F59E0B';
    return '#EF4444';
  };

  const getRatingLabel = (stars) => {
    if (stars >= 4.5) return 'Excellent';
    if (stars >= 4.0) return 'Good';
    if (stars >= 3.0) return 'Average';
    return 'Poor';
  };

  const handleImageError = (e, companyName) => {
    e.target.onerror = null;
    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=3B82F6&color=fff&size=128&font-size=0.5&bold=true&length=2`;
  };

  return (
    <div className="company-reviews-page">
      {/* Hero Section */}
      <div className="reviews-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Award size={20} />
            <span>Trusted by 1M+ Professionals</span>
          </div>
          <h1 className="hero-title">
            Find Your <span className="highlight">Perfect</span> Workplace
          </h1>
          <p className="hero-subtitle">
            Get unbiased insights from employees. Discover company culture, salaries, and reviews from real professionals.
          </p>
          
          {/* Search Section */}
          <div className="search-section">
            <div className="search-box">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search companies (e.g., Google, TCS, Infosys...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <Search size={18} />
                Search
              </button>
            </div>
            <div className="quick-filters">
              <span>Trending:</span>
              <button 
                className="quick-filter"
                onClick={() => {
                  setSelectedIndustry('Technology');
                  setSearchTerm('');
                }}
              >
                IT Companies
              </button>
              <button 
                className="quick-filter"
                onClick={() => {
                  setSelectedIndustry('Banking');
                  setSearchTerm('');
                }}
              >
                Banking
              </button>
              <button 
                className="quick-filter"
                onClick={() => {
                  setSelectedIndustry('Healthcare');
                  setSearchTerm('');
                }}
              >
                Healthcare
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-container">
          <div className="stat-card">
            <Building className="stat-icon" size={24} />
            <div className="stat-content">
              <h3>10,000+</h3>
              <p>Companies Reviewed</p>
            </div>
          </div>
          <div className="stat-card">
            <Users className="stat-icon" size={24} />
            <div className="stat-content">
              <h3>2.5M+</h3>
              <p>Employee Reviews</p>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUpIcon className="stat-icon" size={24} />
            <div className="stat-content">
              <h3>94%</h3>
              <p>Review Accuracy</p>
            </div>
          </div>
          <div className="stat-card">
            <Star className="stat-icon" size={24} />
            <div className="stat-content">
              <h3>4.3</h3>
              <p>Avg. Company Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="reviews-main">
        <div className="container">
          {/* Filters Section */}
          <div className="filters-section">
            <div className="filters-header">
              <h2>Popular Companies</h2>
              <div className="results-count">
                <span className="count-badge">{filteredCompanies.length} companies found</span>
              </div>
              <div className="sort-filter">
                <Filter size={18} />
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="rating">Highest Rating</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="jobs">Most Jobs</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>

            <div className="filters-grid">
              <div className="filter-group">
                <label><Briefcase size={16} /> Industry</label>
                <div className="filter-buttons">
                  {industries.map(industry => (
                    <button
                      key={industry}
                      className={`filter-btn ${selectedIndustry === industry ? 'active' : ''}`}
                      onClick={() => setSelectedIndustry(industry)}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label><MapPin size={16} /> Location</label>
                <div className="filter-buttons">
                  {locations.map(location => (
                    <button
                      key={location}
                      className={`filter-btn ${selectedLocation === location ? 'active' : ''}`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label><Star size={16} /> Rating</label>
                <div className="filter-buttons">
                  {ratings.map(rating => (
                    <button
                      key={rating}
                      className={`filter-btn ${selectedRating === rating ? 'active' : ''}`}
                      onClick={() => setSelectedRating(rating)}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="companies-grid">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map(company => (
                <div 
                  className={`company-card ${company.featured ? 'featured' : ''}`} 
                  key={company.id}
                >
                  {company.featured && (
                    <div className="featured-badge">
                      <Star size={14} fill="#FFD700" />
                      <span>Featured</span>
                    </div>
                  )}

                  <div className="company-header">
                    <div className="company-logo-container">
                      <div className="company-logo">
                        <img 
                          src={company.logo} 
                          alt={company.name}
                          onError={(e) => handleImageError(e, company.name)}
                          loading="lazy"
                        />
                        {company.verified && (
                          <div className="verified-badge">
                            <CheckCircle size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="company-info">
                      <h3 className="company-name">{company.name}</h3>
                      <div className="company-meta">
                        <span className="industry">
                          <Briefcase size={12} />
                          {company.industry}
                        </span>
                        <span className="location">
                          <MapPin size={12} />
                          {company.location}
                        </span>
                      </div>
                      <div className="jobs-count">
                        <Briefcase size={12} />
                        <span>{company.jobs} open positions</span>
                      </div>
                    </div>
                    <div className={`trend-indicator ${company.trend}`}>
                      {company.trend === 'up' ? '📈' : company.trend === 'down' ? '📉' : '➡️'}
                    </div>
                  </div>

                  <div className="company-rating">
                    <div className="rating-main">
                      {renderStars(company.stars)}
                      <span 
                        className="rating-label"
                        style={{ backgroundColor: `${getRatingColor(company.stars)}15`, color: getRatingColor(company.stars) }}
                      >
                        {getRatingLabel(company.stars)}
                      </span>
                    </div>
                    <div className="reviews-count">
                      <Users size={16} />
                      <span>{company.reviews.toLocaleString()} reviews</span>
                    </div>
                  </div>

                  <div className="company-footer">
                    <Link to={`/company/${company.id}`} className="view-reviews-btn">
                      View Reviews
                      <ArrowRight size={16} />
                    </Link>
                    <Link to={`/jobs?company=${encodeURIComponent(company.name)}`} className="view-jobs-btn">
                      View Jobs ({company.jobs})
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-content">
                  <Building size={64} />
                  <h3>No companies found</h3>
                  <p>Try adjusting your filters or search term</p>
                  <button 
                    className="reset-filters-btn"
                    onClick={() => {
                      setSelectedIndustry('All');
                      setSelectedLocation('All Locations');
                      setSelectedRating('All Ratings');
                      setSearchTerm('');
                    }}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="cta-section">
            <div className="cta-card">
              <div className="cta-content">
                <h2>Can't find your company?</h2>
                <p>Be the first to review and help others make informed career decisions.</p>
                <button className="cta-btn">
                  Add Your Company Review
                  <ArrowRight size={20} />
                </button>
              </div>
              <div className="cta-image">
                <Building size={120} />
              </div>
            </div>
          </div>

          {/* Salary Link */}
          <div className="salary-cta">
            <div className="salary-content">
              <div className="salary-icon">
                💰
              </div>
              <div>
                <h3>Looking for salary insights?</h3>
                <p>Check our comprehensive salary data to negotiate better offers.</p>
              </div>
              <Link to="/salary" className="salary-link-btn">
                Explore Salary Calculator
                <TrendingUp size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyReviews;