// components/CandidateManagement.jsx (fully updated)
import React, { useState, useEffect } from 'react';
import './CandidateManagement.css';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [adminInfo, setAdminInfo] = useState(null);

  // Login કરતી વખતે admin ID localStorage માં save કરો
  useEffect(() => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
      const adminData = JSON.parse(savedAdmin);
      setAdminId(adminData._id);
      setAdminInfo(adminData);
      fetchCandidates(adminData._id);
    }
  }, []);

  // Admin ID based API call
  const fetchCandidates = async (adminId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/admin/candidates/admin/${adminId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCandidates(data.candidates);
        if (data.admin) {
          setAdminInfo(data.admin);
        }
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('Error:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Status update
  const updateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/candidates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        alert('Status updated!');
        fetchCandidates(adminId);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error updating status');
    }
  };

  // Delete candidate
  const deleteCandidate = async (id) => {
    if (!window.confirm('Delete this candidate?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/candidates/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Deleted!');
        fetchCandidates(adminId);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error deleting');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading candidates...</p>
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="p-8">
        <div className="alert-warning">
          Please login as admin to view candidates.
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-management-container">
      {/* Admin Info */}
      {adminInfo && (
        <div className="admin-info-panel">
          <h2 className="admin-info-title">
            {adminInfo.companyName} - Candidate Management
          </h2>
          <p className="admin-info-details">
            Email: {adminInfo.email} | Jobs: {adminInfo.totalJobs || 0} | 
            Candidates: {candidates.length}
          </p>
        </div>
      )}
      
      <h1 className="page-title">My Job Candidates ({candidates.length})</h1>
      
      {candidates.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-text">No candidates applied to your jobs yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Job Applied</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate._id}>
                  <td className="candidate-info">
                    <div>
                      <strong className="candidate-name">{candidate.userName}</strong>
                      <div className="candidate-contact">{candidate.userEmail}</div>
                      <div className="candidate-contact">{candidate.userPhone}</div>
                    </div>
                  </td>
                  <td className="job-info">
                    <div>
                      <strong className="job-title">{candidate.jobTitle}</strong>
                      <div className="company-name">{candidate.companyName}</div>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => window.open(candidate.resume, '_blank')}
                      className="resume-button"
                    >
                      📄 View Resume
                    </button>
                  </td>
                  <td>
                    <div className="status-container">
                      <span className={`status-badge ${
                        candidate.status === 'Pending' ? 'status-pending' :
                        candidate.status === 'Reviewed' ? 'status-reviewed' :
                        candidate.status === 'Shortlisted' ? 'status-shortlisted' :
                        candidate.status === 'Rejected' ? 'status-rejected' :
                        candidate.status === 'Accepted' ? 'status-accepted' : 'status-default'
                      }`}>
                        {candidate.status}
                      </span>
                      <select
                        value={candidate.status}
                        onChange={(e) => updateStatus(candidate._id, e.target.value)}
                        className="status-dropdown"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Accepted">Accepted</option>
                      </select>
                    </div>
                  </td>
                  <td className="date-cell">
                    {new Date(candidate.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <div className="actions-container">
                      <button
                        onClick={() => deleteCandidate(candidate._id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CandidateManagement;