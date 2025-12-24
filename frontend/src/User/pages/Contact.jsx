import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebookF, FaTwitter, FaLinkedinIn, FaPaperPlane, FaClock, FaUser, FaComment } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  return (
    <div className="container-fluid px-0">
      {/* Hero Section */}
      <div className="contact-hero bg-primary text-white py-5">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-3">Get In Touch</h1>
              <p className="lead mb-0">
                Have questions or need assistance? We're here to help you with your career journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mt-n5">
        {/* Contact Info Cards */}
        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 p-4 text-center contact-info-card">
              <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <FaEnvelope size={24} className="text-primary" />
              </div>
              <h5 className="fw-bold">Email Us</h5>
              <p className="text-muted mb-0">support@ladderup.com</p>
              <p className="text-muted">info@ladderup.com</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 p-4 text-center contact-info-card">
              <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <FaPhone size={24} className="text-primary" />
              </div>
              <h5 className="fw-bold">Call Us</h5>
              <p className="text-muted mb-0">+91 98765 43210</p>
              <p className="text-muted">+91 91234 56789</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-lg h-100 p-4 text-center contact-info-card">
              <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                <FaMapMarkerAlt size={24} className="text-primary" />
              </div>
              <h5 className="fw-bold">Visit Us</h5>
              <p className="text-muted">Udhna, Surat, Gujarat, India - 394210</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="row mt-5 mb-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="row g-0">
                {/* Form Column */}
                <div className="col-lg-7">
                  <div className="p-5">
                    <h3 className="fw-bold mb-1">Send us a message</h3>
                    <p className="text-muted mb-4">We typically respond within 24 hours</p>
                    
                    {submitStatus === 'success' && (
                      <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>Success!</strong> Your message has been sent successfully.
                        <button type="button" className="btn-close" onClick={() => setSubmitStatus(null)}></button>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Your Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FaUser className="text-muted" />
                          </span>
                          <input 
                            type="text" 
                            className="form-control border-start-0" 
                            placeholder="Enter your full name" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">Email Address</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <FaEnvelope className="text-muted" />
                          </span>
                          <input 
                            type="email" 
                            className="form-control border-start-0" 
                            placeholder="Enter your email address" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="form-label fw-semibold">Message</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 align-items-start pt-2">
                            <FaComment className="text-muted" />
                          </span>
                          <textarea 
                            className="form-control border-start-0" 
                            rows="5" 
                            placeholder="How can we help you?" 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                          ></textarea>
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2 fw-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaPaperPlane className="me-2" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Info Column */}
                <div className="col-lg-5 bg-primary text-white">
                  <div className="p-5 h-100 d-flex flex-column">
                    <h3 className="fw-bold mb-3">Contact Information</h3>
                    <p className="mb-4">Fill out the form and we'll get back to you as soon as possible.</p>
                    
                    <div className="mb-4">
                      <div className="d-flex align-items-start mb-3">
                        <FaClock size={20} className="mt-1 me-3 flex-shrink-0" />
                        <div>
                          <h6 className="fw-bold">Working Hours</h6>
                          <p className="mb-0">Monday - Friday: 9AM - 6PM</p>
                          <p className="mb-0">Saturday: 10AM - 4PM</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <h6 className="fw-bold mb-3">Follow Us</h6>
                      <div className="d-flex gap-3">
                        <a href="#" className="btn btn-light btn-sm rounded-circle p-2">
                          <FaFacebookF size={16} className="text-primary" />
                        </a>
                        <a href="#" className="btn btn-light btn-sm rounded-circle p-2">
                          <FaTwitter size={16} className="text-primary" />
                        </a>
                        <a href="#" className="btn btn-light btn-sm rounded-circle p-2">
                          <FaLinkedinIn size={16} className="text-primary" />
                        </a>
                      </div>
                      <p className="small mt-3 mb-0 opacity-75">
                        Stay updated with the latest job opportunities and career tips.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <style jsx>{`
        .contact-hero {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
        }
        
        .contact-info-card {
          transition: transform 0.3s ease;
        }
        
        .contact-info-card:hover {
          transform: translateY(-5px);
        }
        
        .icon-wrapper {
          width: 60px;
          height: 60px;
        }
        
        .input-group-text {
          transition: all 0.3s ease;
        }
        
        .form-control:focus + .input-group-text,
        .form-control:focus ~ .input-group-text {
          border-color: #0d6efd;
          background-color: #e8f0fe;
        }
      `}</style>
    </div>
  );
};

export default Contact;