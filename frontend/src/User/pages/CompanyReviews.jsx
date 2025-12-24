import React from 'react';
import { Link } from 'react-router-dom'; 
import './CompanyReviews.css';

const companies = [
  {
    name: 'Apollo Pharmacy',
    logo: '/Appolo.jpg',
    reviews: 162,
    stars: 4,
  },
  {
    name: 'Kotak Mahindra Bank',
    logo: '/kotak.jpg',
    reviews: 2252,
    stars: 4,
  },
  {
    name: 'IDFC FIRST Bank',
    logo: '/idfc.jpg',
    reviews: 580,
    stars: 4,
  },
  {
    name: 'TCS',
    logo: '/tcs.jpg',
    reviews: 1000,
    stars: 3.5,
  },
  {
    name: 'Google',
    logo: '/google.jpg',
    reviews: 200,
    stars: 4.6,
  },
  {
    name: 'L&T',
    logo: '/lt.jpg',
    reviews: 900,
    stars: 5,
  },
  {
    name: 'Reliance',
    logo: '/reliance.jpg',
    reviews: 100,
    stars: 5,
  },
  {
    name: 'JIO',
    logo: '/jio.jpg',
    reviews: 700,
    stars: 3.5,
  },
  {
    name: 'Amazon',
    logo: '/amazon.jpg',
    reviews: 5000,
    stars: 4.9,
  },
  {
    name: 'Adani port',
    logo: '/adani.jpg',
    reviews: 800,
    stars: 2,
  },
];

const CompanyReviews = () => {
  return (
    <div className="company-reviews-container">
      <h1>Find great places to work</h1>
      <p>Get access to millions of company reviews</p>

      <div className="search-box">
        <input type="text" placeholder="Company name or job title" />
        <button>Find Companies</button>
      </div>

      <p className="salary-link">
        <Link to="/Salary">Do you want to search for salaries?</Link>
      </p>

      <h2>Popular companies</h2>

      <div className="company-cards">
        {companies.map((company, index) => (
          <div className="company-card" key={index}>
            <img src={company.logo} alt={company.name} />
            <h4>{company.name}</h4>
            <div className="stars">
              {'★'.repeat(Math.floor(company.stars))}
              {'☆'.repeat(5 - Math.floor(company.stars))}
            </div>
            <p>{company.reviews.toLocaleString()} reviews</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyReviews;
