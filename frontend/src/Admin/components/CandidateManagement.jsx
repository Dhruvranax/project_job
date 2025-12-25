// components/CandidateManagement.jsx (નવું ડિઝાઇન)
import React, { useState, useEffect } from 'react';
import './CandidateManagement.css';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // ✅ API URL
  const API_URL = 'http://localhost:5000';

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
    
    if (adminData._id) {
      setAdminId(adminData._id);
      fetchCandidates(adminData._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCandidates = async (adminId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/admin/candidates/admin/${adminId}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setCandidates(result.candidates || []);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (candidateId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchCandidates(adminId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/candidates/${candidateId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchCandidates(adminId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // ✅ ફિલ્ટર્ડ candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'All' || candidate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ✅ Status counts
  const statusCounts = {
    All: candidates.length,
    Pending: candidates.filter(c => c.status === 'Pending').length,
    Reviewed: candidates.filter(c => c.status === 'Reviewed').length,
    Shortlisted: candidates.filter(c => c.status === 'Shortlisted').length,
    Rejected: candidates.filter(c => c.status === 'Rejected').length,
    Accepted: candidates.filter(c => c.status === 'Accepted').length
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading candidates...</p>
      </div>
    );
  }

  if (!adminId) {
    return (
      <div className="login-prompt">
        <div className="login-card">
          <h3>🔒 Admin Login Required</h3>
          <p>Please login as admin to view candidate dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Candidate Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your job applicants efficiently
          </p>
        </div>
        <div className="header-right">
          <div className="total-candidates-card">
            <span className="total-count">{candidates.length}</span>
            <span className="total-label">Total Candidates</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div 
            key={status} 
            className={`stat-card ${status === statusFilter ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            <div className="stat-count">{count}</div>
            <div className="stat-label">{status}</div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name, email, or job..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">
            🔍
          </button>
        </div>
        
        <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="table-wrapper">
        {filteredCandidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No candidates found</h3>
            <p>Try changing your search or filters</p>
          </div>
        ) : (
          <table className="candidate-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Contact</th>
                <th>Job Applied</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map((candidate) => (
                <tr key={candidate._id}>
                  <td>
                    <div className="candidate-profile">
                      <div className="avatar">
                        {candidate.userName?.charAt(0) || 'C'}
                      </div>
                      <div className="candidate-details">
                        <strong className="candidate-name">
                          {candidate.userName || 'N/A'}
                        </strong>
                        <small className="candidate-id">
                          ID: {candidate._id?.substring(0, 8)}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="email">{candidate.userEmail || 'N/A'}</div>
                      <div className="phone">{candidate.userPhone || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="job-info">
                      <strong>{candidate.jobTitle || 'N/A'}</strong>
                      <div className="company">{candidate.companyName}</div>
                    </div>
                  </td>
                  <td>
                    {candidate.appliedAt ? 
                      new Date(candidate.appliedAt).toLocaleDateString('en-IN') : 
                      'N/A'}
                  </td>
                  <td>
                    <div className="status-wrapper">
                      <select
                        value={candidate.status || 'Pending'}
                        onChange={(e) => updateStatus(candidate._id, e.target.value)}
                        className={`status-select status-${candidate.status?.toLowerCase()}`}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Reviewed">👁️ Reviewed</option>
                        <option value="Shortlisted">⭐ Shortlisted</option>
                        <option value="Rejected">❌ Rejected</option>
                        <option value="Accepted">✅ Accepted</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => window.open(candidate.resume, '_blank')}
                        disabled={!candidate.resume}
                      >
                        📄 Resume
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteCandidate(candidate._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Footer */}
      <div className="summary-footer">
        <div className="summary-item">
          <span className="summary-label">Showing:</span>
          <span className="summary-value">
            {filteredCandidates.length} of {candidates.length} candidates
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Last Updated:</span>
          <span className="summary-value">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CandidateManagement;