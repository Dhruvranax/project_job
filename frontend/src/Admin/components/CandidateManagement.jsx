// components/CandidateManagement.jsx
import React, { useState, useEffect } from 'react';
import './CandidateManagement.css';

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState('all');
  const [toast, setToast] = useState(null); // Toast notification માટે

  // ============================================
  // API URL ડાયનેમિક રીતે સેટ કરો
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // Toast message બતાવવાનું function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const adminData = getAdminData();
    if (adminData) {
      fetchAllData(adminData);
    } else {
      setLoading(false);
      setError('Please First Admin Login');
    }
  }, []);

  // Admin data localStorage માંથી મેળવો
  const getAdminData = () => {
    try {
      const savedAdmin = localStorage.getItem('admin');
      if (savedAdmin) {
        const adminData = JSON.parse(savedAdmin);
        console.log('🔵 Admin Data:', adminData);
        return adminData;
      }
    } catch (err) {
      console.error('❌ Admin Data Fatching Error:', err);
    }
    return null;
  };

  // તમામ ડેટા fetch કરો
  const fetchAllData = async (adminData) => {
    try {
      setLoading(true);
      setError('');
      
      console.log(`🟡 Fetching Admin Data: ${adminData.email}`);
      
      // પહેલા આ એડમિનની જોબ્સ fetch કરો
      await fetchAdminJobs(adminData.email);
      
      // પછી candidates fetch કરો
      await fetchCandidatesForAdminJobs(adminData);
      
      showToast('Data Load Sucessfully', 'success');
    } catch (err) {
      console.error('❌ Error in Data Fetch:', err);
      setError(`કનેક્શન ભૂલ: ${err.message}`);
      
      // Demo માટે sample data બતાવો
      setCandidates(getSampleCandidates(adminData));
      setJobs(getSampleJobs(adminData));
      showToast('Showing Demo Data', 'warning');
    } finally {
      setLoading(false);
    }
  };

  // ફક્ત આ એડમિનની જોબ્સ fetch કરો
  const fetchAdminJobs = async (adminEmail) => {
    try {
      console.log(`📋 Fetch Admin Jobs: ${adminEmail}`);
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // ફક્ત આ એડમિન દ્વારા પોસ્ટ કરાયેલ જોબ્સ filter કરો
          const adminJobs = data.jobs.filter(job => {
            const postedByMatch = job.postedBy === adminEmail;
            const companyNameMatch = job.companyName && 
              job.companyName.toLowerCase().includes(adminEmail.split('@')[0].toLowerCase());
            
            return postedByMatch || companyNameMatch;
          });
          
          console.log(`✅ Admin Jobs: ${adminJobs.length}`);
          
          if (adminJobs.length === 0) {
            console.log('⚠️ Not Found Job for Admin');
            setJobs(getSampleJobs(getAdminData()));
          } else {
            setJobs(adminJobs);
          }
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      console.warn('⚠️ Job not Fetch:', err);
      setJobs(getSampleJobs(getAdminData()));
    }
  };

  // એડમિનની જોબ્સ માટે candidates fetch કરો
  const fetchCandidatesForAdminJobs = async (adminData) => {
    try {
      const adminEmail = adminData.email;
      
      console.log(`👥 Candidate Fetch For Admin: ${adminEmail}`);
      
      // પહેલા, તમામ એપ્લિકેશન્સ મેળવો
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 All Application:', data);
      
      if (data.success) {
        const allApplications = data.applications || [];
        console.log(`📈 Total Application in Database: ${allApplications.length}`);
        
        // એડમિનની જોબ્સ મેળવો
        const adminJobs = jobs.length > 0 ? jobs : await getAdminJobsFromDB(adminEmail);
        
        // એડમિનની જોબ્સના ID
        const adminJobIds = adminJobs.map(job => job._id);
        console.log(`📋 Admin Job ID:`, adminJobIds);
        
        // ફક્ત એડમિનની જોબ્સ માટેની એપ્લિકેશન્સ filter કરો
        const adminCandidates = allApplications.filter(app => {
          return adminJobIds.some(jobId => 
            jobId.toString() === app.jobId?.toString()
          );
        });
        
        console.log(`✅ This is Admin Candidate: ${adminCandidates.length}`);
        
        // જોબ details સાથે enrich કરો
        const enrichedCandidates = adminCandidates.map(candidate => {
          const job = adminJobs.find(j => j._id.toString() === candidate.jobId?.toString());
          return {
            ...candidate,
            jobTitle: job?.jobTitle || 'Unknown Job',
            companyName: job?.companyName || 'Unknown  Company',
            adminEmail: adminEmail
          };
        });
        
        setCandidates(enrichedCandidates);
        
      } else {
        throw new Error(data.message || 'Fali In Application Fetch');
      }
      
    } catch (err) {
      console.error('❌ Error Candidate Fetch :', err);
      throw err;
    }
  };

  // ડેટાબેઝમાંથી એડમિનની જોબ્સ મેળવવાનું helper function
  const getAdminJobsFromDB = async (adminEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.jobs.filter(job => job.postedBy === adminEmail);
        }
      }
      return [];
    } catch (err) {
      console.error('Error Find Jobs From Database :', err);
      return [];
    }
  };

  // સ્ટેટસ update કરવાનું function - FIXED VERSION
  const updateStatus = async (candidateId, newStatus) => {
    try {
      console.log(`🔄 Updating Status: ${candidateId} -> ${newStatus}`);
      
      // સાચો API endpoint ઉપયોગ કરો
      const response = await fetch(`${API_BASE_URL}/api/applications/${candidateId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const responseData = await response.json();
      console.log('📊 Server Response:', responseData);
      
      if (response.ok && responseData.success) {
        // Frontend update
        setCandidates(prev => 
          prev.map(c => c._id === candidateId ? { ...c, status: newStatus } : c)
        );
        
        // Toast message બતાવો
        showToast(`Status ${newStatus} Update`, 'success');
        
        // ડેટાબેઝમાં યોગ્ય રીતે સાચવાયેલ છે તે verify કરવા ફરીથી fetch કરો
        setTimeout(() => {
          const adminData = getAdminData();
          if (adminData) {
            fetchCandidatesForAdminJobs(adminData);
          }
        }, 1000);
        
      } else {
        console.error('Server Error:', responseData);
        throw new Error(responseData.message || 'Fail in Update Status');
      }
    } catch (err) {
      console.error('Error in Update Status:', err);
      
      // Network error હોય તો પણ frontend update કરો
      setCandidates(prev => 
        prev.map(c => c._id === candidateId ? { ...c, status: newStatus } : c)
      );
      
      showToast(`Updated locally, but not saved to server`, 'warning');
    }
  };

  // કેન્ડિડેટ ડીલીટ કરવાનું function
  const deleteCandidate = async (candidateId) => {
    if (!window.confirm('Do You Want To Delete This Candidate?')) return;
    
    try {
      console.log(`🗑️ Deleting candidate: ${candidateId}`);
      
      const response = await fetch(`${API_BASE_URL}/api/applications/${candidateId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      
      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        // Frontend update
        setCandidates(prev => prev.filter(c => c._id !== candidateId));
        showToast('Candidate Delete Sucessfully', 'success');
      } else {
        throw new Error(responseData.message || 'Fail Delete');
      }
    } catch (err) {
      console.error('Fail in Delete:', err);
      
      // Network error હોય તો પણ frontend update કરો
      setCandidates(prev => prev.filter(c => c._id !== candidateId));
      showToast('Deleted locally, but not on the server', 'warning');
    }
  };

  // Excel માં export કરવાનું function
  const exportToExcel = () => {
    try {
      const headers = ['Name', 'Email', 'Phone', 'Job Title', 'Company', 'Status', 'Application Date'];
      const csvContent = [
        headers.join(','),
        ...candidates.map(c => [
          `"${c.userName || ''}"`,
          `"${c.userEmail || ''}"`,
          `"${c.userPhone || ''}"`,
          `"${c.jobTitle || ''}"`,
          `"${c.companyName || ''}"`,
          `"${c.status || ''}"`,
          `"${c.appliedAt ? new Date(c.appliedAt).toLocaleDateString() : 'N/A'}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `candidates_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast('Downloading CSV file', 'success');
    } catch (err) {
      console.error('Error in Export:', err);
      showToast('Error in Export', 'error');
    }
  };

  // Demo માટે sample data
  const getSampleCandidates = (adminData) => {
    return [
      {
        _id: 'sample1',
        userName: 'jhon doi',
        userEmail: 'john@example.com',
        userPhone: '9876543210',
        jobTitle: 'Frontend developer',
        companyName: adminData.companyName || 'Tech solution',
        status: 'Pending',
        appliedAt: new Date().toISOString(),
        resume: 'https://example.com/resume1.pdf',
        jobId: 'job1'
      },
      {
        _id: 'sample2',
        userName: 'Jem smith',
        userEmail: 'jane@example.com',
        userPhone: '9876543211',
        jobTitle: 'UI/UX Desiginner',
        companyName: adminData.companyName || 'solution Tech',
        status: 'Reviewed',
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        resume: 'https://example.com/resume2.pdf',
        jobId: 'job2'
      },
      {
        _id: 'sample3',
        userName: 'rajesh patel',
        userEmail: 'rajesh@example.com',
        userPhone: '9876543212',
        jobTitle: 'frontend developer',
        companyName: adminData.companyName || 'Tech solution',
        status: 'Accepted',
        appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        resume: 'https://example.com/resume3.pdf',
        jobId: 'job1'
      }
    ];
  };

  const getSampleJobs = (adminData) => {
    return [
      {
        _id: 'job1',
        jobTitle: 'frontend developer',
        companyName: adminData.companyName || 'Tech solution',
        location: 'Ahemdabad',
        salaryRange: '₹6-8 LPA',
        currency: 'INR',
        jobType: 'FUll time ',
        postedBy: adminData.email || 'admin@example.com'
      },
    ];
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = searchTerm === '' || 
      candidate.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      candidate.status?.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesJob = selectedJob === 'all' || 
      candidate.jobTitle === selectedJob;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Unique job titles for filter dropdown
  const uniqueJobTitles = ['all', ...new Set(candidates.map(c => c.jobTitle).filter(Boolean))];

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Candidate Dashboard...</p>
          <small className="text-muted">
            Only Fetch Your Job...<br/>
            Please wait...
          </small>
        </div>
      </div>
    );
  }

  const adminData = getAdminData();

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* Connection Info */}
      <div className="alert alert-info mb-3">
        <small>
          <strong>🔧 API Status:</strong> {API_BASE_URL}<br/>
          <strong>👔 Admin:</strong> {adminData?.fullName} ({adminData?.companyName})<br/>
          <strong>📊 Data:</strong> {candidates.length} Candidate, {jobs.length} Jobs<br/>
          <strong>🔒 Security:</strong> Only Show Your Jobs
        </small>
      </div>

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Candidate Management</h1>
          <p className="subtitle">Manage Only Your Job Application</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={exportToExcel}>
            📊 CSV Export
          </button>
          <button className="btn-refresh" onClick={() => {
            const adminData = getAdminData();
            if (adminData) fetchAllData(adminData);
          }}>
            🔄 Refersh 
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card total-jobs">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{jobs.length}</div>
            <div className="stat-label">Your Jobs</div>
          </div>
        </div>
        
        <div className="stat-card total-candidates">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{candidates.length}</div>
            <div className="stat-label">Your Application</div>
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

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger">
          <strong>⚠️ Error:</strong> {error}
          <div className="mt-2">
            <button 
              className="btn btn-sm btn-outline-warning me-2"
              onClick={() => {
                const adminData = getAdminData();
                if (adminData) fetchAllData(adminData);
              }}
            >
              Try Again
            </button>
            <button 
              className="btn btn-sm btn-outline-info"
              onClick={() => {
                setCandidates(getSampleCandidates(adminData));
                setJobs(getSampleJobs(adminData));
                setError('');
              }}
            >
              Show Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Jobs Overview */}
      <div className="section mt-4">
        <h2 className="section-title">📋 Your Jobs ({jobs.length})</h2>
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
                    <strong>{jobCandidates.length}</strong> Application
                  </div>
                  <button 
                    className="btn-view-applicants"
                    onClick={() => setSelectedJob(job.jobTitle)}
                  >
                    Show Application
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidates Table */}
      <div className="section mt-4">
        <div className="section-header">
          <h2 className="section-title">
            👥 Application For Your Jobs ({filteredCandidates.length})
          </h2>
          <div className="filters">
            <input 
              type="text" 
              placeholder="Find Using Name And Emai..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {/* Job Filter */}
            <select 
              className="filter-select"
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
            >
              <option value="all">All Jobs</option>
              {uniqueJobTitles
                .filter(title => title !== 'all' && title !== 'Unknown Jobs')
                .map((title, index) => (
                  <option key={index} value={title}>
                    {title}
                  </option>
                ))
              }
            </select>
            
            {/* Status Filter */}
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Pending">⏳ Pending</option>
              <option value="Reviewed">👁️ Reviewed</option>
              <option value="Shortlisted">⭐ Shortlisted</option>
              <option value="Rejected">❌ Rejected</option>
              <option value="Accepted">✅ Accepted</option>
            </select>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Not Find Application</h3>
            <p>{candidates.length === 0 ? 
              "Not Find Your Application Right Now." : 
              "Not Find Any Job In Your Filter."}
            </p>
            <p className="hint">
              <strong>Your Email:</strong> {adminData?.email}<br/>
              <strong>Your Company:</strong> {adminData?.companyName}
            </p>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setSelectedJob('all');
              }}
            >
            Clear All Filter
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate</th>
                  <th>Contact</th>
                  <th>Job</th>
                  <th>Stauts</th>
                  <th>Application Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((candidate, index) => (
                  <tr key={candidate._id}>
                    <td className="index">{index + 1}</td>
                    <td className="candidate-cell">
                      <div className="candidate-avatar">
                        {candidate.userName?.charAt(0) || 'U'}
                      </div>
                      <div className="candidate-info">
                        <strong>{candidate.userName || 'Unknown'}</strong>
                        <small className="candidate-id">ID: {candidate._id?.substring(0, 6) || 'N/A'}</small>
                      </div>
                    </td>
                    <td className="contact-cell">
                      <div className="email">{candidate.userEmail || 'Email not Found'}</div>
                      <div className="phone">{candidate.userPhone || 'Phone not Found'}</div>
                    </td>
                    <td className="job-cell">
                      <div className="job-title">{candidate.jobTitle || 'Unknown Jobs'}</div>
                      <div className="company">{candidate.companyName || 'Unknown Company'}</div>
                    </td>
                    <td className="status-cell">
                      <select
                        value={candidate.status || 'Pending'}
                        onChange={(e) => updateStatus(candidate._id, e.target.value)}
                        className={`status-select ${candidate.status?.toLowerCase() || 'pending'}`}
                      >
                        <option value="Pending">⏳ Pending</option>
                        <option value="Reviewed">👁️ Reviewed</option>
                        <option value="Shortlisted">⭐ Shortlisted</option>
                        <option value="Rejected">❌ Rejected</option>
                        <option value="Accepted">✅ Accepted</option>
                      </select>
                      <small className="status-hint">
                        {candidate.status === 'Pending' && ' Pending...'}
                        {candidate.status === 'Accepted' && 'Accepted!'}
                      </small>
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
                            title="Show Resume"
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

      {/* Summary */}
      <div className="alert alert-success mt-4">
        <small>
          <strong>✅ Security Check:</strong> This Page Show Only Job Posting Application.<br/>
          <strong>👥 Total Candidates:</strong> {candidates.length}<br/>
          <strong>📋 Your Total Jobs:</strong> {jobs.length}<br/>
          <strong>🔧 API End Point:</strong> /api/applications/:id (PUT/DELETE)
        </small>
      </div>
    </div>
  );
};

export default CandidateManagement;