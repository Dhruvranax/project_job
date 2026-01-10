// src/Admin/pages/AdminRegister.jsx - COMPLETE FIXED VERSION
import React, { useState, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/AdminContext";
import Swal from "sweetalert2";

const AdminRegister = () => {
  const initialFormData = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    companyType: "",
    companyWebsite: "",
    companySize: "",
    industry: "",
    companyPan: "",
    gstNumber: "",
    companyAddress: "",
    city: "",
    state: "",
    pincode: "",
    hiringFrequency: "",
    teamSize: "",
    monthlyHiringBudget: "",
    agreeToTerms: false,
    receiveUpdates: true
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdmin();

  // ============================================
  // DYNAMIC API URL
  // ============================================
  const API_BASE_URL = window.location.hostname.includes('localhost') 
    ? "http://localhost:5000" 
    : "https://project-job-i2vd.vercel.app";

  const companyTypes = [
    "Startup",
    "Small Business",
    "Medium Enterprise", 
    "Large Corporation",
    "MNC",
    "Government",
    "NGO/Non-profit",
    "Educational Institution"
  ];

  const companySizes = [
    "1-10 employees",
    "11-50 employees", 
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1000+ employees"
  ];

  const industries = [
    "IT & Software",
    "Finance & Banking",
    "Healthcare",
    "Education",
    "Manufacturing",
    "Retail & E-commerce",
    "Hospitality",
    "Real Estate",
    "Media & Entertainment",
    "Automobile",
    "Telecom",
    "Consulting",
    "Logistics & Supply Chain",
    "Agriculture",
    "Other"
  ];

  const hiringFrequencies = [
    "Occasionally (1-2 positions/year)",
    "Regularly (3-10 positions/year)",
    "Frequently (10+ positions/year)",
    "Mass Hiring (50+ positions/year)"
  ];

  const monthlyBudgets = [
    "Less than ₹50,000",
    "₹50,000 - ₹1,00,000",
    "₹1,00,000 - ₹2,50,000",
    "₹2,50,000 - ₹5,00,000",
    "₹5,00,000+"
  ];

  const indianStates = [
    "Gujarat",
    "Maharashtra",
    "Delhi",
    "Karnataka",
    "Tamil Nadu",
    "Uttar Pradesh",
    "Rajasthan",
    "Punjab",
    "West Bengal",
    "Bihar",
    "Madhya Pradesh",
    "Andhra Pradesh",
    "Telangana",
    "Kerala",
    "Haryana",
    "Other"
  ];

  // Alert functions
  const showErrorAlert = (title, text) => {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'OK'
    });
  };

  const showSuccessAlert = (title, text, showConfirmButton = true) => {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      showConfirmButton: showConfirmButton,
      timer: showConfirmButton ? null : 2000,
      timerProgressBar: !showConfirmButton,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Continue'
    });
  };

  const showLoadingAlert = () => {
    return Swal.fire({
      title: 'Processing...',
      html: 'Please wait while we create your account',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  };

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const validateStep = useCallback((step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^[6-9][0-9]{9}$/.test(formData.phone)) {
        newErrors.phone = "Enter valid 10-digit Indian mobile number";
      }
      if (!formData.password) newErrors.password = "Password is required";
      else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 2) {
      if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!formData.companyType) newErrors.companyType = "Please select company type";
      if (!formData.companySize) newErrors.companySize = "Please select company size";
      if (!formData.industry) newErrors.industry = "Please select industry";
    }

    if (step === 3) {
      if (!formData.companyAddress.trim()) newErrors.companyAddress = "Company address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "Please select state";
      if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required";
      else if (!/^[0-9]{6}$/.test(formData.pincode)) {
        newErrors.pincode = "Enter valid 6-digit pincode";
      }
    }

    if (step === 4) {
      if (!formData.hiringFrequency) newErrors.hiringFrequency = "Please select hiring frequency";
      if (!formData.monthlyHiringBudget) newErrors.monthlyHiringBudget = "Please select monthly budget";
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to terms and conditions";
    }

    return newErrors;
  }, [formData]);

  // ============================================
  // STEP NAVIGATION FUNCTIONS
  // ============================================

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      
      const firstErrorKey = Object.keys(stepErrors)[0];
      const firstErrorMessage = stepErrors[firstErrorKey];
      
      showErrorAlert(
        "Validation Error", 
        `Please fix the error in "${firstErrorKey.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}" field: ${firstErrorMessage}`
      );
      return;
    }
    
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================
  // RENDER STEP FUNCTION - CRITICAL!
  // ============================================

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="step-content">
            <h4 className="mb-4">
              <span className="step-number">1</span> Personal Information
            </h4>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">
                  Email Address <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="Enter your official email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                <small className="text-muted">Use company email for verification</small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength="10"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Create password (min. 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">
                  Confirm Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <h4 className="mb-4">
              <span className="step-number">2</span> Company Information
            </h4>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
                  placeholder="Enter official company name"
                  value={formData.companyName}
                  onChange={handleChange}
                />
                {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">
                  Company Type <span className="text-danger">*</span>
                </label>
                <select
                  id="companyType"
                  name="companyType"
                  className={`form-select ${errors.companyType ? 'is-invalid' : ''}`}
                  value={formData.companyType}
                  onChange={handleChange}
                >
                  <option value="">Select Company Type</option>
                  {companyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.companyType && <div className="invalid-feedback">{errors.companyType}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Company Website (Optional)</label>
                <input
                  type="url"
                  id="companyWebsite"
                  name="companyWebsite"
                  className="form-control"
                  placeholder="https://www.example.com"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-md-6">
                <label className="form-label">
                  Company Size <span className="text-danger">*</span>
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  className={`form-select ${errors.companySize ? 'is-invalid' : ''}`}
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="">Select Company Size</option>
                  {companySizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                {errors.companySize && <div className="invalid-feedback">{errors.companySize}</div>}
              </div>
              
              <div className="col-12">
                <label className="form-label">
                  Industry <span className="text-danger">*</span>
                </label>
                <select
                  id="industry"
                  name="industry"
                  className={`form-select ${errors.industry ? 'is-invalid' : ''}`}
                  value={formData.industry}
                  onChange={handleChange}
                >
                  <option value="">Select Industry</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
                {errors.industry && <div className="invalid-feedback">{errors.industry}</div>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step-content">
            <h4 className="mb-4">
              <span className="step-number">3</span> Business Verification
            </h4>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Company PAN Number (Optional)</label>
                <input
                  type="text"
                  id="companyPan"
                  name="companyPan"
                  className="form-control"
                  placeholder="ABCDE1234F"
                  value={formData.companyPan}
                  onChange={handleChange}
                />
                <small className="text-muted">Required for payment processing</small>
              </div>
              
              <div className="col-md-6">
                <label className="form-label">GST Number (Optional)</label>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  className="form-control"
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstNumber}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-12">
                <label className="form-label">
                  Company Address <span className="text-danger">*</span>
                </label>
                <textarea
                  id="companyAddress"
                  name="companyAddress"
                  className={`form-control ${errors.companyAddress ? 'is-invalid' : ''}`}
                  placeholder="Enter complete company address"
                  rows="3"
                  value={formData.companyAddress}
                  onChange={handleChange}
                ></textarea>
                {errors.companyAddress && <div className="invalid-feedback">{errors.companyAddress}</div>}
              </div>
              
              <div className="col-md-4">
                <label className="form-label">
                  City <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                />
                {errors.city && <div className="invalid-feedback">{errors.city}</div>}
              </div>
              
              <div className="col-md-4">
                <label className="form-label">
                  State <span className="text-danger">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <div className="invalid-feedback">{errors.state}</div>}
              </div>
              
              <div className="col-md-4">
                <label className="form-label">
                  Pincode <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  maxLength="6"
                />
                {errors.pincode && <div className="invalid-feedback">{errors.pincode}</div>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step-content">
            <h4 className="mb-4">
              <span className="step-number">4</span> Hiring Requirements
            </h4>
            
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">
                  Hiring Frequency <span className="text-danger">*</span>
                </label>
                <select
                  id="hiringFrequency"
                  name="hiringFrequency"
                  className={`form-select ${errors.hiringFrequency ? 'is-invalid' : ''}`}
                  value={formData.hiringFrequency}
                  onChange={handleChange}
                >
                  <option value="">Select Hiring Frequency</option>
                  {hiringFrequencies.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
                {errors.hiringFrequency && <div className="invalid-feedback">{errors.hiringFrequency}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Team Size You'll Manage</label>
                <input
                  type="text"
                  id="teamSize"
                  name="teamSize"
                  className="form-control"
                  placeholder="e.g., 5 members"
                  value={formData.teamSize}
                  onChange={handleChange}
                />
              </div>
              
              <div className="col-12">
                <label className="form-label">
                  Monthly Hiring Budget <span className="text-danger">*</span>
                </label>
                <select
                  id="monthlyHiringBudget"
                  name="monthlyHiringBudget"
                  className={`form-select ${errors.monthlyHiringBudget ? 'is-invalid' : ''}`}
                  value={formData.monthlyHiringBudget}
                  onChange={handleChange}
                >
                  <option value="">Select Monthly Budget</option>
                  {monthlyBudgets.map(budget => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
                {errors.monthlyHiringBudget && <div className="invalid-feedback">{errors.monthlyHiringBudget}</div>}
                <small className="text-muted">This helps us recommend suitable plans</small>
              </div>
              
              <div className="col-12">
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    className={`form-check-input ${errors.agreeToTerms ? 'is-invalid' : ''}`}
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="agreeToTerms">
                    I agree to the <a href="#!" onClick={(e) => {
                      e.preventDefault();
                      Swal.fire({
                        title: "Terms of Service",
                        html: "Please read our full terms of service on our website. By agreeing, you confirm that you have authority to hire on behalf of your company."
                      });
                    }}>Terms of Service</a> and <a href="#!" onClick={(e) => {
                      e.preventDefault();
                      Swal.fire({
                        title: "Privacy Policy",
                        html: "Your information is protected according to our privacy policy. We never share your data with third parties without your consent."
                      });
                    }}>Privacy Policy</a> <span className="text-danger">*</span>
                  </label>
                  {errors.agreeToTerms && <div className="invalid-feedback d-block">{errors.agreeToTerms}</div>}
                </div>
                
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="receiveUpdates"
                    name="receiveUpdates"
                    className="form-check-input"
                    checked={formData.receiveUpdates}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="receiveUpdates">
                    Receive updates about new features, job market insights, and promotions
                  </label>
                </div>
              </div>
            </div>
            
            <div className="benefits-card mt-4">
              <h6 className="text-primary">
                <i className="fas fa-gift me-2"></i>
                Benefits of Verified Admin Account:
              </h6>
              <ul className="list-unstyled ms-3">
                <li><i className="fas fa-check-circle text-success me-2"></i>Verified badge on your company profile</li>
                <li><i className="fas fa-check-circle text-success me-2"></i>Priority customer support</li>
                <li><i className="fas fa-check-circle text-success me-2"></i>Access to premium candidate database</li>
                <li><i className="fas fa-check-circle text-success me-2"></i>Advanced analytics dashboard</li>
                <li><i className="fas fa-check-circle text-success me-2"></i>Dedicated account manager</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ============================================
  // SUBMIT FUNCTION
  // ============================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const allErrors = validateStep(1);
    Object.assign(allErrors, validateStep(2));
    Object.assign(allErrors, validateStep(3));
    Object.assign(allErrors, validateStep(4));
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      showErrorAlert(
        "Form Validation Failed",
        "Please fix all errors in the form before submitting."
      );
      return;
    }

    if (!formData.agreeToTerms) {
      setErrors(prev => ({ ...prev, agreeToTerms: "You must agree to terms and conditions" }));
      showErrorAlert("Terms Required", "You must agree to the terms and conditions to proceed.");
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    
    const loadingAlert = showLoadingAlert();

    try {
      console.log("📤 Registering admin at:", `${API_BASE_URL}/api/admin/register`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      loadingAlert.close();

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      console.log("✅ Registration response:", data);

      if (data.success || response.ok) {
        await showSuccessAlert(
          "Registration Successful!",
          data.message || "Your admin account has been created successfully.",
          true
        ).then((result) => {
          if (result.isConfirmed) {
            setFormData(initialFormData);
            setCurrentStep(1);
            setErrors({});
            
            let adminData = null;
            
            if (data.admin) {
              adminData = data.admin;
            } else if (data.data) {
              adminData = data.data;
            } else {
              adminData = {
                _id: `temp_${Date.now()}`,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                companyName: formData.companyName,
                companyType: formData.companyType,
                companySize: formData.companySize,
                industry: formData.industry,
                companyAddress: formData.companyAddress,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                hiringFrequency: formData.hiringFrequency,
                monthlyHiringBudget: formData.monthlyHiringBudget,
                isVerified: true,
                loginTime: new Date().toISOString()
              };
            }
            
            const adminDataWithTimestamp = {
              ...adminData,
              loginTime: new Date().toISOString(),
              fullName: adminData.fullName || formData.fullName,
              email: adminData.email || formData.email,
              companyName: adminData.companyName || formData.companyName
            };
            
            console.log("💾 Saving admin to context:", adminDataWithTimestamp);
            login(adminDataWithTimestamp);
            
            try {
              localStorage.setItem('admin', JSON.stringify(adminDataWithTimestamp));
            } catch (storageError) {
              console.error("LocalStorage error:", storageError);
            }
            
            Swal.fire({
              title: 'Redirecting to Payment...',
              text: 'Please complete payment to activate your account',
              icon: 'info',
              showConfirmButton: false,
              timer: 1500,
              timerProgressBar: true,
              willClose: () => {
                setTimeout(() => {
                  navigate('/Admin-security-payment')
                  // window.location.href = "https://rzp.io/rzp/OtfSyE9";
                }, 200);
              }
            });
          }
        });
        
      } else {
        if (data.errors) {
          setErrors(data.errors);
          const errorMessages = Object.entries(data.errors)
            .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
            .join('');
          
          showErrorAlert(
            "Registration Failed",
            `Please fix the following errors:<br><ul>${errorMessages}</ul>`
          );
        } else {
          showErrorAlert(
            "Registration Failed",
            data.message || "Registration failed. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      loadingAlert.close();
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showErrorAlert(
          "🌐 Connection Error",
          `Cannot connect to server at: ${API_BASE_URL}<br>Please make sure backend is running.`
        );
      } else {
        showErrorAlert(
          "Registration Error",
          error.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  const progressPercentage = ((currentStep - 1) / 3) * 100;

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="card shadow-lg border-0" style={{ maxWidth: "800px", width: "100%" }}>
        <div className="card-body p-4">
          
          {/* Connection Info */}
          <div className="alert alert-info mb-4">
            <small>
              <strong>🔧 API Status:</strong> {API_BASE_URL}<br/>
              {API_BASE_URL.includes('localhost') && (
                <span className="text-muted">
                  Make sure backend server is running on port 5000
                </span>
              )}
            </small>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Step {currentStep} of 4</span>
              <span className="text-primary fw-bold">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="progress" style={{ height: "8px" }}>
              <div 
                className="progress-bar bg-primary" 
                role="progressbar" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="fw-bold text-primary">
              <i className="fas fa-user-tie me-2"></i>
              Register as Admin/Recruiter
            </h1>
            <p className="text-muted">
              Create your admin account to start hiring talent
            </p>
          </div>

          {/* Form Steps */}
          <form onSubmit={handleSubmit} noValidate>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="d-flex justify-content-between mt-5 pt-3 border-top">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handlePrevStep}
                    disabled={loading}
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Previous
                  </button>
                )}
              </div>
              
              <div>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    Next Step
                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success px-4"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle me-2"></i>
                        Complete Registration
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Additional Info */}
          <div className="mt-4 pt-3 border-top">
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold">
                  <i className="fas fa-shield-alt text-primary me-2"></i>
                  Secure & Verified
                </h6>
                <p className="small text-muted mb-0">
                  Your information is encrypted and securely stored. 
                  Verification ensures genuine recruiters.
                </p>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold">
                  <i className="fas fa-clock text-primary me-2"></i>
                  Verification Process
                </h6>
                <p className="small text-muted mb-0">
                  Accounts are verified within 24-48 hours. 
                  You'll receive email confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center mt-4">
            <p className="mb-2">
              Already have an admin account?{" "}
              <Link to="/admin-login" className="text-decoration-none fw-semibold">
                Login here
              </Link>
            </p>
            <p className="text-muted small mb-0">
              By registering, you confirm that you have authority to hire on behalf of your company.
            </p>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          margin-right: 10px;
          font-weight: bold;
        }
        
        .benefits-card {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 15px;
          border-radius: 0 8px 8px 0;
        }
        
        .progress-bar {
          transition: width 0.3s ease;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #80bdff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .btn-primary {
          background-color: #007bff;
          border-color: #007bff;
        }
        
        .btn-primary:hover {
          background-color: #0056b3;
          border-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default AdminRegister;