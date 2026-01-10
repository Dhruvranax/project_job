import React from "react";
import "./AdminFooter.css";
import { 
  FaBriefcase, 
  FaLinkedin, 
  FaTwitter, 
  FaGithub,
  FaHome,
  FaUsers,
  FaFileAlt,
  FaChartBar,
  FaCog,
  FaQuestionCircle,
  FaBook,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaLock,
  FaServer,
  FaBell,
  FaInfoCircle,
  FaBuilding,
  FaHeadset,
  FaCode,
  FaCheckCircle
} from "react-icons/fa";

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  const userEmail = "admin@ladderup.com";

  return (
    <footer className="admin-footer">
      <div className="footer-container">
        
        {/* Main Content Grid */}
        <div className="footer-grid">
          
          {/* Company Info */}
          <div className="footer-col">
            <div className="footer-logo">
              <FaBriefcase className="logo-icon" />
              <div>
                <h3>LadderUp</h3>
                <span className="logo-sub">Admin Dashboard</span>
              </div>
            </div>
            <p className="company-desc">
              Professional recruitment management platform for modern hiring teams.
            </p>
            
            <div className="social-icons">
              <a href="#" className="social-icon">
                <FaLinkedin />
              </a>
              <a href="#" className="social-icon">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon">
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-col">
            <h4 className="col-title">Platform</h4>
            <ul className="footer-links">
              <li><a href="/admin/dashboard"><FaHome /> Dashboard </a></li>
              <li><a href="/admin/jobs"><FaBriefcase /> Jobs</a></li>
              <li><a href="/admin/candidates"><FaUsers /> Candidates</a></li>
              <li><a href="/admin/applications"><FaFileAlt /> Applications</a></li>
              <li><a href="/admin/analytics"><FaChartBar /> Analytics</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="footer-col">
            <h4 className="col-title">Company</h4>
            <ul className="footer-links">
              <li><a href="/about">About Us</a></li>
              <li><a href="/careers">Careers</a></li>
              <li><a href="/blog">Blog</a></li>
              <li><a href="/partners">Partners</a></li>
              <li><a href="/press">Press</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-col">
            <h4 className="col-title">Support</h4>
            <ul className="footer-links">
              <li><a href="/help"><FaQuestionCircle /> Help Center</a></li>
              <li><a href="/docs"><FaBook /> Documentation</a></li>
              <li><a href="/api"><FaCode /> API</a></li>
              <li><a href="/status"><FaServer /> Status</a></li>
              <li><a href="/contact"><FaHeadset /> Contact</a></li>
            </ul>
          </div>

        </div>

        {/* Contact Information */}
        <div className="contact-section">
          <div className="contact-info">
            <div className="contact-item">
              <FaEnvelope />
              <div>
                <span className="contact-label">Email</span>
                <a href="mailto:support@ladderup.com">support@ladderup.com</a>
              </div>
            </div>
            
            <div className="contact-item">
              <FaPhone />
              <div>
                <span className="contact-label">Phone</span>
                <a href="tel:+911234567890">+91 123 456 7890</a>
              </div>
            </div>
            
            <div className="contact-item">
              <FaMapMarkerAlt />
              <div>
                <span className="contact-label">Location</span>
                <span>Ahmedabad, Gujarat</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="system-section">
          <div className="system-status">
            <div className="status-item">
              <FaServer />
              <span>v2.5.1</span>
            </div>
            <div className="status-item">
              <FaLock />
              <span>SSL Secured</span>
            </div>
            <div className="status-item">
              <FaCheckCircle />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {currentYear} LadderUp Technologies. All rights reserved.</p>
          </div>
          
          <div className="legal-links">
            <a href="/privacy"><FaShieldAlt /> Privacy</a>
            <span className="divider">•</span>
            <a href="/terms">Terms</a>
            <span className="divider">•</span>
            <a href="/cookies">Cookies</a>
          </div>
          
          <div className="user-info">
            <FaUsers />
            <span>Admin: {userEmail}</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default AdminFooter;