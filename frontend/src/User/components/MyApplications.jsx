import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);
  
  const fetchApplications = async () => {
    try {
      const response = await axios.get(`https://project-job-i2vd.vercel.app/api/jobs/user/applications/${user._id}`);
      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      "Pending": "bg-secondary",
      "Reviewed": "bg-info",
      "Shortlisted": "bg-warning",
      "Accepted": "bg-success",
      "Rejected": "bg-danger"
    };
    return badges[status] || "bg-secondary";
  };
  
  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">
          Please login to view your applications
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Applications</h2>
      
      {applications.length === 0 ? (
        <div className="alert alert-info">
          You haven't applied for any jobs yet.
        </div>
      ) : (
        <div className="row">
          {applications.map(app => (
            <div className="col-md-6 mb-4" key={app._id}>
              <div className="card shadow h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="card-title">{app.jobTitle}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">{app.companyName}</h6>
                    </div>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <p className="card-text">
                    <small>Applied: {new Date(app.appliedAt).toLocaleDateString()}</small>
                  </p>
                  
                  {app.coverLetter && (
                    <div className="mt-3">
                      <strong>Cover Letter:</strong>
                      <p className="text-muted">{app.coverLetter.substring(0, 100)}...</p>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <a href={app.resume} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                      View Resume
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;