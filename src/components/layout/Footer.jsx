// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import AnimatedLogo from '../common/AnimatedLogo';
import './Footer.css';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <AnimatedLogo size="md" to="/" />
          <p>Your one-stop platform for premium event planning. From birthdays to weddings, we make every moment magical.</p>
          <div className="footer-socials">
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="Twitter"><TwitterIcon /></a>
            <a href="#" aria-label="Facebook"><FacebookIcon /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <Link to="/services/birthday">Birthday Planning</Link>
          <Link to="/services/wedding">Wedding Decoration</Link>
          <Link to="/services/dj">DJ Booking</Link>
          <Link to="/services/photography">Photography</Link>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <Link to="/">About Us</Link>
          <Link to="/">Careers</Link>
          <Link to="/">Blog</Link>
          <Link to="/">Press Kit</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <div className="footer-contact-item"><Mail size={14} /> hello@eventaura.in</div>
          <div className="footer-contact-item"><Phone size={14} /> +91 98765 43210</div>
          <div className="footer-contact-item"><MapPin size={14} /> Kolkata, West Bengal</div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <span>© 2025 EventAura. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
