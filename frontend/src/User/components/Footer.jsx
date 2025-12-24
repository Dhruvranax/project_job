// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { MDBFooter, MDBContainer, MDBRow, MDBCol, MDBIcon } from 'mdb-react-ui-kit';
import './Footer.css';

export default function Footer() {
  return (
    <MDBFooter className='text-center text-lg-start MDBFooter'>
      <section className='d-flex justify-content-center justify-content-lg-between p-4 border-bottom'>
        <div className='me-5 d-none d-lg-block'>
          <span>Get connected with us on social networks:</span>
        </div>

        <div>
          <a href='https://facebook.com' className='footer-link social-icon text-reset'>
            <MDBIcon fab icon="facebook-f" />
          </a>
          <a href='https://x.com/LadderU11298' className='footer-link social-icon text-reset'>
            <MDBIcon fab icon="twitter" />
          </a>
          <a href='https://google.com' className='footer-link social-icon text-reset'>
            <MDBIcon fab icon="google" />
          </a>
          <a href='https://www.instagram.com/ladde_rup' className='footer-link social-icon text-reset' target='_blank' rel="noopener noreferrer">
            <MDBIcon fab icon="instagram" />
          </a>
          <a href='https://www.linkedin.com/in/ladderup-38ab79378' className='footer-link social-icon text-reset' target="_blank" rel="noopener noreferrer">
            <MDBIcon fab icon="linkedin" />
          </a>
          <a href='https://github.com' className='footer-link social-icon text-reset'>
            <MDBIcon fab icon="github" />
          </a>
        </div>
      </section>

      <section>
        <MDBContainer className='text-center text-md-start mt-5'>
          <MDBRow className='mt-3'>
            <MDBCol md="3" lg="4" xl="3" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>
                <MDBIcon icon="gem" className="me-3" /> LadderUp
              </h6>
              <p>
                LadderUp is a modern job-finding platform that connects talent with opportunity.
              </p>
            </MDBCol>

            <MDBCol md="2" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Products</h6>
              <p><Link to="/Salary" className='footer-link text-reset'>Salary Calculator</Link></p>
              <p><Link to="/notfound" className='footer-link text-reset'>Courses</Link></p>
              <p><Link to="/notfound" className='footer-link text-reset'>Build Resume</Link></p>
              <p><Link to="/CareerAdvice" className='footer-link text-reset'>Career Advice</Link></p>
              <p><Link to="/notfound" className='footer-link text-reset'>AI Interview Prep</Link></p>
            </MDBCol>

            <MDBCol md="3" lg="2" xl="2" className='mx-auto mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Useful Links</h6>
              <p><Link to="/pricing" className='footer-link text-reset'>Pricing</Link></p>
              <p><Link to="/notfound" className='footer-link text-reset'>Settings</Link></p>
              <p><Link to="/notfound" className='footer-link text-reset'>Orders</Link></p>
              <p><Link to="/Help" className='footer-link text-reset'>Help</Link></p>
              <p><Link to="/CompanyReviews" className='footer-link text-reset'>Company Reviews</Link></p>
            </MDBCol>

            <MDBCol md="4" lg="3" xl="3" className='mx-auto mb-md-0 mb-4'>
              <h6 className='text-uppercase fw-bold mb-4'>Contact</h6>
              <p><MDBIcon icon="home" className="me-2" /> Surat, Gujarat, India</p>
              <p><MDBIcon icon="envelope" className="me-3" /> support@ladderup.com</p>
              <p><MDBIcon icon="phone" className="me-3" /> +91 12345 67890</p>
              <p><MDBIcon icon="print" className="me-3" /> +91 09876 54321</p>
            </MDBCol>
          </MDBRow>
        </MDBContainer>
      </section>

      <div className='text-center p-4' style={{ backgroundColor: '#f1f1f1' }}>
        © {new Date().getFullYear()} <a className='text-reset fw-bold' href='/'>LadderUp.com</a>
      </div>
    </MDBFooter>
  );
}
