// src/pages/Dashboard.jsx
import { Link } from 'react-router-dom';
import { CalendarCheck, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../utils/constants';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, userDoc } = useAuth();
  const name = currentUser?.displayName?.split(' ')[0] || 'there';

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome */}
        <div className="dashboard-welcome card">
          <div className="welcome-orb" />
          <div className="welcome-content">
            <div className="welcome-badge"><Sparkles size={14} /> EventAura Dashboard</div>
            <h1>Welcome back, {name}! 👋</h1>
            <p>Ready to plan something extraordinary? Browse services and create unforgettable memories.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <Link to="/services" className="quick-action-card card">
              <ShoppingBag size={28} className="qa-icon" />
              <div>
                <div className="qa-title">Browse Services</div>
                <div className="qa-sub">Explore all event categories</div>
              </div>
              <ArrowRight size={18} className="qa-arrow" />
            </Link>
            <Link to="/my-bookings" className="quick-action-card card">
              <CalendarCheck size={28} className="qa-icon" />
              <div>
                <div className="qa-title">My Bookings</div>
                <div className="qa-sub">View your booked events</div>
              </div>
              <ArrowRight size={18} className="qa-arrow" />
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="dashboard-section">
          <h2>Explore Services</h2>
          <div className="dashboard-categories">
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} to={`/services/${cat.id}`} className="dashboard-cat-card" style={{ background: cat.gradient }}>
                <span className="dashboard-cat-emoji">{cat.icon}</span>
                <span className="dashboard-cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
