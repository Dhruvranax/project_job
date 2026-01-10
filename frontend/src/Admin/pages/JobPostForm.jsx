import React, { useState, useEffect } from "react";
import axios from "axios";
import "./JobPostForm.css";

const JobPostForm = () => {
  // Simplified form state
  const [formData, setFormData] = useState({
    jobTitle: "",
    companyName: "",
    companyLogo: "",
    jobType: "Full-time",
    experienceLevel: "Mid Level",
    salaryRange: "",
    location: "",
    workLocation: "On-site",
    jobDescription: "",
    responsibilities: "",
    benefits: {
      healthInsurance: false,
      paidTimeOff: false,
      flexibleHours: false,
      remoteWork: false,
      training: false,
      retirementPlan: false,
      bonus: false,
      other: ""
    },
    applicationDeadline: "",
    applicationLink: "",
    status: "Draft"
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [adminInfo, setAdminInfo] = useState(null);
  
  // ============================================
  // DYNAMIC API URL - LOCALHOST OR PRODUCTION
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  // Job Types Options
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Freelance",
    "Remote"
  ];

  // Experience Levels
  const experienceLevels = [
    "Entry Level",
    "Mid Level",
    "Senior Level",
    "Executive",
    "Internship",
    "Fresher"
  ];

  // Work Locations
  const workLocations = ["On-site", "Remote", "Hybrid"];

  // Load admin info on mount
  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem("admin") || '{}');
    setAdminInfo(adminData);
    
    if (!adminData || !adminData.email) {
      setError("Please login as admin to post jobs");
    }
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("benefits.")) {
      const benefitField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        benefits: {
          ...prev.benefits,
          [benefitField]: type === "checkbox" ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
    
    // Clear error when user types
    if (error) setError("");
  };

  // Next Step
  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.jobTitle.trim() || !formData.companyName.trim()) {
        setError("Job title and company name are required");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.location.trim() || !formData.jobDescription.trim()) {
        setError("Location and job description are required");
        return;
      }
    }
    
    setError("");
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  // Previous Step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Helper function to get selected benefits as array
  const getSelectedBenefits = () => {
    const benefits = [];
    if (formData.benefits.healthInsurance) benefits.push("Health Insurance");
    if (formData.benefits.paidTimeOff) benefits.push("Paid Time Off");
    if (formData.benefits.flexibleHours) benefits.push("Flexible Hours");
    if (formData.benefits.remoteWork) benefits.push("Remote Work");
    if (formData.benefits.training) benefits.push("Training");
    if (formData.benefits.retirementPlan) benefits.push("Retirement Plan");
    if (formData.benefits.bonus) benefits.push("Bonus");
    if (formData.benefits.other) {
      benefits.push(...formData.benefits.other.split(',').map(b => b.trim()).filter(b => b));
    }
    return benefits;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check admin login
    if (!adminInfo || !adminInfo.email) {
      setError("Please login as admin to post jobs");
      return;
    }
    
    // Final validation
    if (!formData.jobTitle.trim() || !formData.companyName.trim() || 
        !formData.location.trim() || !formData.jobDescription.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Prepare job data for backend
      const jobData = {
        jobTitle: formData.jobTitle,
        companyName: formData.companyName,
        companyLogo: formData.companyLogo || "",
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        salaryRange: formData.salaryRange,
        location: formData.location,
        workLocation: formData.workLocation,
        jobDescription: formData.jobDescription,
        responsibilities: formData.responsibilities ? 
          formData.responsibilities.split('\n').filter(r => r.trim()) : [],
        benefits: getSelectedBenefits(),
        applicationDeadline: formData.applicationDeadline || null,
        applicationLink: formData.applicationLink || "",
        postedBy: adminInfo.email || adminInfo.fullName || "Admin",
        postedByAdminId: adminInfo._id,
        status: formData.status === "Published" ? "Active" : "Draft",
        views: 0,
        applications: 0
      };
      
      console.log("📤 Submitting job to:", `${API_BASE_URL}/api/jobs`);
      console.log("📝 Job data:", jobData);
      
      // ✅ USE DYNAMIC API URL
      const response = await axios.post(
        `${API_BASE_URL}/api/jobs/create`,
        jobData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log("✅ Job submission response:", response.data);
      
      if (response.data.success) {
        setSuccess(true);
        
        // Show success message
        setTimeout(() => {
          // Reset form
          resetForm();
          setCurrentStep(1);
          setSuccess(false);
          
          // Redirect to admin dashboard or jobs list
          window.location.href = "/admin/jobs";
        },50000);
      } else {
        setError(response.data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("❌ Error submitting job:", error);
      
      if (error.code === 'ERR_NETWORK') {
        setError(
          <div>
            <strong>🌐 Network Error!</strong><br/>
            <small className="text-muted">
              Cannot connect to server at: {API_BASE_URL}<br/>
              Please make sure backend is running.
            </small>
            <div className="mt-2">
              <button 
                className="btn btn-sm btn-outline-warning"
                onClick={() => window.open(API_BASE_URL, '_blank')}
              >
                Test Backend
              </button>
            </div>
          </div>
        );
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        setError("You are not authorized to post jobs. Please login as admin.");
      } else if (error.response?.status === 404) {
        setError("Job posting endpoint not found. Please check backend routes.");
      } else {
        setError(error.response?.data?.error || error.response?.data?.message || "Failed to post job. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      jobTitle: "",
      companyName: "",
      companyLogo: "",
      jobType: "Full-time",
      experienceLevel: "Mid Level",
      salaryRange: "",
      location: "",
      workLocation: "On-site",
      jobDescription: "",
      responsibilities: "",
      benefits: {
        healthInsurance: false,
        paidTimeOff: false,
        flexibleHours: false,
        remoteWork: false,
        training: false,
        retirementPlan: false,
        bonus: false,
        other: ""
      },
      applicationDeadline: "",
      applicationLink: "",
      status: "Draft"
    });
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="step-content">
      <h3>Basic Information</h3>
      <p className="step-description">Provide basic job details</p>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Job Title *</label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g., Senior Software Engineer"
            required
          />
        </div>

        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g., Tech Solutions Inc."
            required
          />
        </div>

        <div className="form-group">
          <label>Company Logo URL</label>
          <input
            type="url"
            name="companyLogo"
            value={formData.companyLogo}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
          />
          <small className="text-muted">Optional - for better job display</small>
        </div>

        <div className="form-group">
          <label>Job Type *</label>
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            required
          >
            {jobTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Experience Level</label>
          <select
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
          >
            {experienceLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Salary Range</label>
          <input
            type="text"
            name="salaryRange"
            value={formData.salaryRange}
            onChange={handleChange}
            placeholder="e.g., ₹50,000 - ₹70,000 per month"
          />
        </div>
      </div>
    </div>
  );

  // Step 2: Location & Description
  const renderStep2 = () => (
    <div className="step-content">
      <h3>Location & Description</h3>
      <p className="step-description">Where is the job and what does it involve</p>
      
      <div className="form-grid">
        <div className="form-group">
          <label>Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., Ahmedabad, Gujarat or Remote"
            required
          />
        </div>

        <div className="form-group">
          <label>Work Setup</label>
          <select
            name="workLocation"
            value={formData.workLocation}
            onChange={handleChange}
          >
            {workLocations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <label>Job Description *</label>
          <textarea
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleChange}
            placeholder="Provide a detailed description of the job..."
            rows="6"
            required
          />
          <small className="text-muted">Describe the role, requirements, and expectations</small>
        </div>

        <div className="form-group full-width">
          <label>Responsibilities</label>
          <textarea
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="List key responsibilities (one per line)..."
            rows="4"
          />
          <small className="text-muted">Enter each responsibility on a new line</small>
        </div>
      </div>
    </div>
  );

  // Step 3: Benefits & Publish
  const renderStep3 = () => (
    <div className="step-content">
      <h3>Benefits & Publish</h3>
      <p className="step-description">Add benefits and finalize job posting</p>
      
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Benefits</label>
          <div className="benefits-grid">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.healthInsurance"
                checked={formData.benefits.healthInsurance}
                onChange={handleChange}
              />
              <span>Health Insurance</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.paidTimeOff"
                checked={formData.benefits.paidTimeOff}
                onChange={handleChange}
              />
              <span>Paid Time Off</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.flexibleHours"
                checked={formData.benefits.flexibleHours}
                onChange={handleChange}
              />
              <span>Flexible Hours</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.remoteWork"
                checked={formData.benefits.remoteWork}
                onChange={handleChange}
              />
              <span>Remote Work</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.training"
                checked={formData.benefits.training}
                onChange={handleChange}
              />
              <span>Training</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.retirementPlan"
                checked={formData.benefits.retirementPlan}
                onChange={handleChange}
              />
              <span>Retirement Plan</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="benefits.bonus"
                checked={formData.benefits.bonus}
                onChange={handleChange}
              />
              <span>Bonus</span>
            </label>
          </div>

          <div className="other-benefits mt-2">
            <input
              type="text"
              name="benefits.other"
              value={formData.benefits.other}
              onChange={handleChange}
              placeholder="Other benefits (comma separated)"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Application Deadline</label>
          <input
            type="date"
            name="applicationDeadline"
            value={formData.applicationDeadline}
            onChange={handleChange}
            className="form-control"
          />
          <small className="text-muted">Optional - leave blank for no deadline</small>
        </div>

        <div className="form-group">
          <label>Application Link</label>
          <input
            type="url"
            name="applicationLink"
            value={formData.applicationLink}
            onChange={handleChange}
            placeholder="https://example.com/apply"
            className="form-control"
          />
          <small className="text-muted">Optional - external application link</small>
        </div>

        <div className="form-group">
          <label>Post Status</label>
          <div className="status-options">
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="Draft"
                checked={formData.status === "Draft"}
                onChange={handleChange}
              />
              <span>Save as Draft</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="status"
                value="Published"
                checked={formData.status === "Published"}
                onChange={handleChange}
              />
              <span>Publish Now</span>
            </label>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="preview-section mt-4">
        <h4>📋 Job Preview</h4>
        <div className="preview-card">
          <h5>{formData.jobTitle || "Job Title"}</h5>
          <p><strong>Company:</strong> {formData.companyName || "Company Name"}</p>
          <p><strong>Location:</strong> {formData.location || "Location"}</p>
          <p><strong>Type:</strong> {formData.jobType} | <strong>Experience:</strong> {formData.experienceLevel}</p>
          <p><strong>Salary:</strong> {formData.salaryRange || "Not specified"}</p>
          <p><strong>Status:</strong> <span className={`badge ${formData.status === "Published" ? "bg-success" : "bg-warning"}`}>
            {formData.status === "Published" ? "Active" : "Draft"}
          </span></p>
        </div>
      </div>
    </div>
  );

  // Calculate progress
  const progress = ((currentStep - 1) / 2) * 100;

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="job-post-container">
      {/* Connection Info */}
      <div className="alert alert-info mb-4">
        <small>
          <strong>🔧 API Status:</strong> {API_BASE_URL}<br/>
          {API_BASE_URL.includes('localhost') && (
            <span className="text-muted">
              Make sure backend server is running on port 5000
            </span>
          )}
          {adminInfo && (
            <>
              <br/>
              <strong>👔 Logged in as:</strong> {adminInfo.fullName} ({adminInfo.companyName})
            </>
          )}
        </small>
      </div>

      <div className="job-post-header">
        <h1>Post a New Job</h1>
        <p>Fill in the details below to create a job posting</p>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="steps">
          {[1, 2, 3].map(step => (
            <div
              key={step}
              className={`step ${currentStep >= step ? "active" : ""}`}
              onClick={() => setCurrentStep(step)}
            >
              <div className="step-number">{step}</div>
              <div className="step-label">
                {step === 1 && "Basic"}
                {step === 2 && "Details"}
                {step === 3 && "Publish"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="alert alert-success">
          <strong>✅ Success!</strong> Job posted successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Admin Check */}
      {!adminInfo?.email && (
        <div className="alert alert-warning">
          <strong>⚠️ Admin Login Required</strong><br/>
          Please <a href="/admin-login" className="alert-link">login as admin</a> to post jobs.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="job-post-form">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="form-navigation mt-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-outline-secondary"
              disabled={loading}
            >
              ← Previous
            </button>
          )}
          
          <div className="nav-right">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
                disabled={loading || !adminInfo?.email}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className={`btn ${formData.status === "Published" ? "btn-success" : "btn-warning"}`}
                disabled={loading || !adminInfo?.email}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Processing...
                  </>
                ) : formData.status === "Draft" ? (
                  "💾 Save as Draft"
                ) : (
                  "🚀 Publish Job"
                )}
              </button>
            )}
            
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-outline-danger ms-2"
              disabled={loading}
            >
              Reset Form
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobPostForm;