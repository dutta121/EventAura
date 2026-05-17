// src/pages/services/ServicesHome.jsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../utils/constants';
import './ServicesHome.css';

export default function ServicesHome() {
  return (
    <div className="services-home">
      <div className="container">
        <div className="section-header" style={{ paddingTop: '3rem' }}>
          <div className="section-pill">All Services</div>
          <h1 className="display">Our Event Services</h1>
          <p>Choose from our curated selection of premium event planning services, each with handpicked vendors and transparent pricing.</p>
        </div>

        <div className="services-home-grid">
          {CATEGORIES.map((cat) => (
            <Link to={`/services/${cat.id}`} key={cat.id} className="service-home-card card">
              <div className="service-home-icon-wrap" style={{ background: cat.gradient }}>
                <span>{cat.icon}</span>
              </div>
              <div className="service-home-info">
                <h2>{cat.name}</h2>
                <p>{cat.description}</p>
                <span className="service-home-link">
                  Browse Vendors <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
