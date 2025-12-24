// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'; // optional styling

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Oops! Page Not Found</h2>
      <p>Our Developer Fix this problem soon</p>
      <p>Looks like you climbed the wrong ladder. But hey, you're still on LadderUp.</p>
      <Link to="/" className="home-link">Back to Home</Link>
    </div>
  );
};

export default NotFound;
