import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState('checking...');
  const [error, setError] = useState('');

  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await axios.get('https://project-job-i2vd.vercel.app/health');
      setStatus(`✅ Backend Connected: ${response.data.status}`);
    } catch (err) {
      setStatus('❌ Backend Not Reachable');
      setError(err.message);
    }
  };

  const testEndpoints = async () => {
    const endpoints = [
      { name: 'Health', url: 'https://project-job-i2vd.vercel.app/health' },
      { name: 'Payment Test', url: 'https://project-job-i2vd.vercel.app/api/payment/test' },
      { name: 'Home', url: 'https://project-job-i2vd.vercel.app/' }
    ];

    for (let endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint.url);
        console.log(`✅ ${endpoint.name}:`, response.data);
      } catch (err) {
        console.log(`❌ ${endpoint.name}:`, err.message);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="card">
        <div className="card-body">
          <h3>Connection Test</h3>
          <p>Status: <strong>{status}</strong></p>
          {error && <p className="text-danger">Error: {error}</p>}
          
          <button onClick={checkBackend} className="btn btn-primary me-2">
            Check Again
          </button>
          
          <button onClick={testEndpoints} className="btn btn-info">
            Test All Endpoints
          </button>
          
          <div className="mt-4">
            <h5>Test Links:</h5>
            <ul>
              <li>
                <a href="https://project-job-i2vd.vercel.app/health" target="_blank" rel="noreferrer">
                  Health Check
                </a>
              </li>
              <li>
                <a href="https://project-job-i2vd.vercel.app/api/payment/test" target="_blank" rel="noreferrer">
                  Payment Test
                </a>
              </li>
              <li>
                <a href="https://project-job-i2vd.vercel.app/" target="_blank" rel="noreferrer">
                  Home Page
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnection;