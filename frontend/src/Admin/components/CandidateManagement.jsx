// components/CandidateManagement.jsx (COMPLETELY FIXED)
import React, { useState, useEffect } from 'react';
import './CandidateManagement.css';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  const API_URL = 'https://project-job-i2vd.vercel.app';

  useEffect(() => {
    const adminData = getAdminData();
    if (adminData) {
      fetchAllData(adminData);
    } else {
      setLoading(false);
      setError('Please login as admin first');
    }
  }, []);

  const getAdminData = () => {
    try {
      const savedAdmin = localStorage.getItem('admin');
      if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        console.log('🔵 Admin Data:', adminData);
        return adminData;
      }
    } catch (err) {
      console.error('Error getting admin data:', err);
    }
    return null;
  };

  const fetchAllData = async (adminData) => {
    try {
      setLoading(true);
      setError('');
      
      const adminEmail = adminData.email;
      const adminId = adminData._id;
      
      console.log(`🟡 Fetching data for Admin: ${adminEmail} (${adminId})`);
      
      // 🔍 DEBUG: Check ALL candidates first
      console.log('🔍 Checking ALL candidates in database...');
      const allCandidatesResponse = await fetch(`${API_URL}/api/admin/candidates`);
      
      if (allCandidatesResponse.ok) {
        const allCandidatesData = await allCandidatesResponse.json();
        console.log('📊 ALL Candidates in DB:', allCandidatesData);
        
        if (allCandidatesData.success) {
          const allCandidates = allCandidatesData.candidates || [];
          console.log(`📈 Total candidates in DB: ${allCandidates.length}`);
          
          // Show ALL candidates (for debugging)
          allCandidates.forEach((candidate, index) => {
            console.log(`Candidate ${index + 1}:`, {
              name: candidate.userName,
              email: candidate.userEmail,
              jobTitle: candidate.jobTitle,
              adminEmail: candidate.adminEmail,
              postedBy: candidate.postedBy,
              adminId: candidate.adminId
            });
          });
          
          // ✅ FILTER: Find candidates for THIS admin
          const myCandidates = allCandidates.filter(candidate => {
            return (
              candidate.adminEmail === adminEmail ||
              candidate.postedBy === adminEmail ||
              candidate.adminId === adminId ||
              (candidate.userEmail && candidate.userEmail.includes(adminEmail))
            );
          });
          
          console.log(`✅ My Candidates: ${myCandidates.length}`);
          setCandidates(myCandidates);
          
          // Save debug info
          setDebugInfo({
            totalInDB: allCandidates.length,
            myCandidates: myCandidates.length,
            adminEmail,
            adminId
          });
        }
      }
      
      // ✅ Fetch jobs
      await fetchJobs(adminEmail);
      
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(`Error: ${err.message}`);
      
      // Fallback: Try direct endpoints
      tryFallbackMethods(adminData);
    } finally {
      setLoading(false);
    }
  };

  const tryFallbackMethods = async (adminData) => {
    console.log('🔄 Trying fallback methods...');
    
    const endpoints = [
      `${API_URL}/api/admin/candidates/admin/${adminData._id}`,
      `${API_URL}/api/admin/candidates/email/${adminData.email}`,
      `${API_URL}/api/admin/candidates/simple/${adminData._id}`,
      `${API_URL}/api/admin/candidates/debug/all`
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying: ${endpoint}`);
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.candidates) {
            console.log(`✅ Found ${data.candidates.length} candidates from ${endpoint}`);
            setCandidates(data.candidates);
            break;
          }
        }
      } catch (e) {
        console.log(`Failed: ${endpoint}`, e.message);
      }
    }
  };

  const fetchJobs = async (adminEmail) => {
    try {
      const response = await fetch(`${API_URL}/api/jobs`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const adminJobs = data.jobs.filter(job => 
            job.postedBy === adminEmail
          );
          console.log(`📋 Admin Jobs: ${adminJobs.length}`);
          setJobs(adminJobs);
        }
      }
    } catch (err) {
      console.warn('Could not fetch jobs:', err);
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
        setCandidates(prev => 
          prev.map(c => c._id === candidateId ? { ...c, status: newStatus } : c)
        );
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status');
    }
  };

  const deleteCandidate = async (candidateId) => {
    if (!window.confirm('Are you sure?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/candidates/${candidateId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCandidates(prev => prev.filter(c => c._id !== candidateId));
      }
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Error deleting');
    }
  };

  const exportToExcel = () => {
    // Simple CSV export
    const headers = ['Name', 'Email', 'Phone', 'Job Title', 'Company', 'Status', 'Applied Date'];
    const csvContent = [
      headers.join(','),
      ...candidates.map(c => [
        c.userName,
        c.userEmail,
        c.userPhone,
        c.jobTitle,
        c.companyName,
        c.status,
        c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
        <p className="debug-info">Fetching all applications...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Candidate Management</h1>
          <p className="subtitle">Manage all job applications</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={exportToExcel}>
            📊 Export CSV
          </button>
          <button className="btn-refresh" onClick={() => fetchAllData(getAdminData())}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-jobs">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Jobs Posted</div>
          </div>
        </div>
        
        <div className="stat-card total-candidates">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{candidates.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">
              {candidates.filter(c => c.status === 'Pending').length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        
        <div className="stat-card accepted">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">
              {candidates.filter(c => c.status === 'Accepted').length}
            </div>
            <div className="stat-label">Accepted</div>
          </div>
        </div>
      </div>

      {/* Debug Info (visible in development) */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="debug-panel">
          <h4>Debug Information</h4>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          <button onClick={() => console.log('Candidates:', candidates)}>
            Log Candidates to Console
          </button>
        </div>
      )} */}

      {/* Jobs Overview */}
      <div className="section">
        <h2 className="section-title">📋 Your Jobs Overview</h2>
        <div className="jobs-container">
          {jobs.map((job, index) => {
            const jobCandidates = candidates.filter(candidate => 
              candidate.jobTitle === job.jobTitle
            );
            
            return (
              <div key={job._id || index} className="job-item">
                <div className="job-item-header">
                  <h3>{job.jobTitle}</h3>
                  <span className="company-tag">{job.companyName}</span>
                </div>
                <div className="job-item-details">
                  <span className="location">📍 {job.location}</span>
                  <span className="salary">💰 {job.salaryRange} {job.currency}</span>
                  <span className="type">{job.jobType}</span>
                </div>
                <div className="job-item-stats">
                  <div className="applicants-count">
                    <strong>{jobCandidates.length}</strong> Applicants
                  </div>
                  <div className="status-breakdown">
                    {['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Accepted'].map(status => {
                      const count = jobCandidates.filter(c => c.status === status).length;
                      return count > 0 ? (
                        <span key={status} className={`status-dot status-${status.toLowerCase()}`}>
                          {status}: {count}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">👥 All Applications ({candidates.length})</h2>
          <div className="filters">
            <input 
              type="text" 
              placeholder="Search by name or email..."
              className="search-input"
              onChange={(e) => {
                // Add search functionality here
              }}
            />
            <select className="filter-select">
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Accepted">Accepted</option>
            </select>
          </div>
        </div>

        {candidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Applications Found</h3>
            <p>You don't have any job applications yet.</p>
            <p className="hint">
              Make sure candidates are applying to jobs posted with your email: <strong>{getAdminData()?.email}</strong>
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Job Applied</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate, index) => (
                  <tr key={candidate._id}>
                    <td className="index">{index + 1}</td>
                    <td className="candidate-cell">
                      <div className="candidate-avatar">
                        {candidate.userName?.charAt(0) || 'U'}
                      </div>
                      <div className="candidate-info">
                        <strong>{candidate.userName || 'Unknown'}</strong>
                        <small className="candidate-id">ID: {candidate._id?.substring(0, 6)}</small>
                      </div>
                    </td>
                    <td className="contact-cell">
                      <div className="email">{candidate.userEmail}</div>
                      <div className="phone">{candidate.userPhone}</div>
                    </td>
                    <td className="job-cell">
                      <div className="job-title">{candidate.jobTitle}</div>
                      <div className="company">{candidate.companyName}</div>
                    </td>
                    <td className="status-cell">
                      <select
                        value={candidate.status || 'Pending'}
                        onChange={(e) => updateStatus(candidate._id, e.target.value)}
                        className={`status-select ${candidate.status?.toLowerCase()}`}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Reviewed">👁️ Reviewed</option>
                        <option value="Shortlisted">⭐ Shortlisted</option>
                        <option value="Rejected">❌ Rejected</option>
                        <option value="Accepted">✅ Accepted</option>
                      </select>
                      <div className="current-status">{candidate.status}</div>
                    </td>
                    <td className="date-cell">
                      {candidate.appliedAt ? 
                        new Date(candidate.appliedAt).toLocaleDateString('en-IN') : 
                        'N/A'}
                      <br/>
                      <small>{candidate.appliedAt ? 
                        new Date(candidate.appliedAt).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : 
                        ''}
                      </small>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {candidate.resume && (
                          <button 
                            className="btn-resume"
                            onClick={() => window.open(candidate.resume, '_blank')}
                            title="View Resume"
                          >
                            📄
                          </button>
                        )}
                        <button 
                          className="btn-email"
                          onClick={() => window.location.href = `mailto:${candidate.userEmail}`}
                          title="Send Email"
                        >
                          📧
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => deleteCandidate(candidate._id)}
                          title="Delete"
                        >
                          🗑️
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

      {/* Error Display */}
      {error && (
        <div className="error-alert">
          <strong>Error:</strong> {error}
          <button onClick={() => fetchAllData(getAdminData())}>Retry</button>
        </div>
      )}
    </div>
  );
};

export default CandidateManagement;