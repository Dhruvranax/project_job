import React from 'react';
import { Link } from 'react-router-dom';
import { MDBFooter, MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <MDBFooter className='text-center text-lg-start ladderup-footer'>
      {/* Social Media Section */}
      <section className='social-section d-flex justify-content-center justify-content-lg-between p-4'>
        <div className='social-text me-5 d-none d-lg-block'>
          <span>Get connected with us on social networks:</span>
        </div>

        <div className="social-icons">
          <a href='https://facebook.com' className='footer-social-link' target='_blank' rel="noopener noreferrer">
            <MDBIcon fab icon="facebook-f" />
          </a>
          <a href='https://x.com/LadderU11298' className='footer-social-link' target='_blank' rel="noopener noreferrer">
            <MDBIcon fab icon="twitter" />
          </a>
          <a href='https://google.com' className='footer-social-link' target='_blank' rel="noopener noreferrer">
            <MDBIcon fab icon="google" />
          </a>
          <a href='https://www.instagram.com/ladde_rup' className='footer-social-link' target='_blank' rel="noopener noreferrer">
            <MDBIcon fab icon="instagram" />
          </a>
          <a href='https://www.linkedin.com/in/ladderup-38ab79378' className='footer-social-link' target="_blank" rel="noopener noreferrer">
            <MDBIcon fab icon="linkedin" />
          </a>
          <a href='https://github.com' className='footer-social-link' target='_blank' rel="noopener noreferrer">
            <MDBIcon fab icon="github" />
          </a>
        </div>
      </section>

      {/* Main Footer Content */}
      <section className='footer-content-section'>
        <MDBContainer className='text-center text-md-start'>
          <MDBRow className='mt-4'>
            {/* Company Info */}
            <MDBCol md="3" lg="3" xl="3" className='mx-auto mb-4'>
              <div className="footer-brand-section">
                <h3 className='footer-logo mb-3'>
                  <MDBIcon icon="gem" className="me-2 text-primary" /> 
                  <span className="gradient-text">LADDERUP</span>
                </h3>
                <p className="footer-description">
                  LadderUp is a modern job-finding platform that connects talent with opportunity.
                </p>
                <div className="footer-newsletter mt-4">
                  <p className="newsletter-text">Subscribe to our newsletter</p>
                  <div className="input-group">
                    <input 
                      type="email" 
                      className="form-control newsletter-input" 
                      placeholder="Your email" 
                    />
                    <button className="btn btn-primary newsletter-btn" type="button">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </MDBCol>

            {/* Products */}
            <MDBCol md="2" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='footer-section-title text-uppercase fw-bold mb-4'>PRODUCTS</h6>
              <ul className="footer-links-list">
                <li><Link to="/salary" className='footer-link'>Salary Calculator</Link></li>
                <li><Link to="/courses" className='footer-link'>Courses</Link></li>
                <li><Link to="/resume-builder" className='footer-link'>Build Resume</Link></li>
                <li><Link to="/career-advice" className='footer-link'>Career Advice</Link></li>
                <li><Link to="/ai-interview" className='footer-link'>AI Interview Prep</Link></li>
              </ul>
            </MDBCol>

            {/* Useful Links */}
            <MDBCol md="2" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='footer-section-title text-uppercase fw-bold mb-4'>USEFUL LINKS</h6>
              <ul className="footer-links-list">
                <li><Link to="/pricing" className='footer-link'>Pricing</Link></li>
                <li><Link to="/settings" className='footer-link'>Settings</Link></li>
                <li><Link to="/orders" className='footer-link'>Orders</Link></li>
                <li><Link to="/help" className='footer-link'>Help</Link></li>
                <li><Link to="/company-reviews" className='footer-link'>Company Reviews</Link></li>
              </ul>
            </MDBCol>

            {/* Contact */}
            <MDBCol md="4" lg="4" xl="3" className='mx-auto mb-md-0 mb-4'>
              <h6 className='footer-section-title text-uppercase fw-bold mb-4'>CONTACT</h6>
              <ul className="footer-contact-list">
                <li className="mb-3">
                  <MDBIcon icon="home" className="me-3 contact-icon" />
                  <span>Surat, Gujarat, India</span>
                </li>
                <li className="mb-3">
                  <MDBIcon icon="envelope" className="me-3 contact-icon" />
                  <a href="mailto:support@ladderup.com" className="footer-link">support@ladderup.com</a>
                </li>
                <li className="mb-3">
                  <MDBIcon icon="phone" className="me-3 contact-icon" />
                  <a href="tel:+911234567890" className="footer-link">+91 12345 67890</a>
                </li>
                <li className="mb-3">
                  <MDBIcon icon="print" className="me-3 contact-icon" />
                  <a href="tel:+910987654321" className="footer-link">+91 09876 54321</a>
                </li>
              </ul>
              
              {/* Quick Links */}
              <div className="mt-4">
                <h6 className='footer-section-title text-uppercase fw-bold mb-3'>QUICK LINKS</h6>
                <div className="d-flex flex-wrap gap-2">
                  <Link to="/about" className="btn btn-outline-primary btn-sm">About Us</Link>
                  <Link to="/contact" className="btn btn-outline-primary btn-sm">Contact</Link>
                     <a href="/privacy.html" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Privacy</a>

                  <a href="/terms.html" class="btn btn-outline-primary btn-sm">Terms</a>
                </div>
              </div>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      {/* Copyright */}
      <div className='copyright-section text-center p-4'>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-md-start mb-2 mb-md-0">
              <span>© {currentYear} LadderUp.com - All rights reserved</span>
            </div>
            <div className="col-md-6 text-md-end">
              <a href="/sitemap.html" className='footer-link me-3'>Sitemap</a>
              <Link to="/privacy-policy" className='footer-link me-3'>Privacy Policy</Link>
              <Link to="/terms-of-service" className='footer-link'>Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </MDBFooter>
  );
}