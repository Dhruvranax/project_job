import React, { useState } from "react";
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
    
    // Final validation
    if (!formData.jobTitle.trim() || !formData.companyName.trim() || 
        !formData.location.trim() || !formData.jobDescription.trim()) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Get admin data from localStorage
      const adminData = JSON.parse(localStorage.getItem("admin") || '{}');
      
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
        postedBy: adminData.email || adminData.fullName || "Admin",
        status: formData.status
      };
      
      console.log("Submitting job:", jobData);
      
      // Send to backend API
      const response = await axios.post(
        "http://localhost:5000/api/jobs",
        jobData
      );
      
      if (response.data.success) {
        setSuccess(true);
        setLoading(false);
        
        // Reset form after 2 seconds
        setTimeout(() => {
          resetForm();
          setCurrentStep(1);
          setSuccess(false);
        }, 99999999);
      }
    } catch (error) {
      console.error("Error submitting job:", error);
      setError(error.response?.data?.error || "Failed to post job. Please try again.");
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
            placeholder="e.g., $50,000 - $70,000"
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
            placeholder="e.g., New York, NY or Remote"
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
          <small className="hint">Enter each responsibility on a new line</small>
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

          <div className="other-benefits">
            <input
              type="text"
              name="benefits.other"
              value={formData.benefits.other}
              onChange={handleChange}
              placeholder="Other benefits (comma separated)"
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
          />
        </div>

        <div className="form-group">
          <label>Application Link</label>
          <input
            type="url"
            name="applicationLink"
            value={formData.applicationLink}
            onChange={handleChange}
            placeholder="https://example.com/apply"
          />
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
      <div className="preview-section">
        <h4>Job Preview</h4>
        <div className="preview-card">
          <h4>{formData.jobTitle || "Job Title"}</h4>
          <p><strong>Company:</strong> {formData.companyName || "Company Name"}</p>
          <p><strong>Location:</strong> {formData.location || "Location"}</p>
          <p><strong>Type:</strong> {formData.jobType} | <strong>Experience:</strong> {formData.experienceLevel}</p>
          <p><strong>Status:</strong> {formData.status}</p>
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
        <div className="success-message">
          ✅ Job posted successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="job-post-form">
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary"
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
                disabled={loading}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-submit"
                disabled={loading}
              >
                {loading ? "Processing..." : formData.status === "Draft" ? "Save as Draft" : "Publish Job"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default JobPostForm;