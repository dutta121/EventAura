// src/pages/LandingPage.jsx
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, CalendarCheck, Award, ChevronRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import './LandingPage.css';

const STATS = [
  { value: '10,000+', label: 'Events Planned' },
  { value: '500+', label: 'Expert Vendors' },
  { value: '4.9★', label: 'Avg Rating' },
  { value: '25+', label: 'Cities Covered' },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma', event: 'Wedding', rating: 5, text: 'EventAura turned our dream wedding into reality. Every detail was perfect!' },
  { name: 'Rohan Das', event: 'Birthday Party', rating: 5, text: 'Found the perfect DJ and photographer in one place. Absolutely magical experience!' },
  { name: 'Ananya Sen', event: 'Corporate Event', rating: 5, text: 'The platform is incredibly intuitive. Booked everything in under 30 minutes.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse Services', desc: 'Explore curated vendors across birthday, wedding, DJ, and photography categories.', icon: '🔍' },
  { step: '02', title: 'Add to Cart', desc: 'Pick your favourite packages and add them to your event cart.', icon: '🛒' },
  { step: '03', title: 'Confirm & Pay', desc: 'Fill in event details, confirm your booking, and pay on the event day.', icon: '✅' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero animated-gradient">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="container hero-content">
          <div className="hero-badge animate-fadeInDown">
            <Sparkles size={14} /> India's #1 Event Planning Platform
          </div>
          <h1 className="hero-title animate-fadeInUp display">
            Plan Events That <span className="text-gradient">Leave Memories</span> Forever
          </h1>
          <p className="hero-subtitle animate-fadeInUp delay-2">
            From intimate birthdays to grand weddings — discover, book, and manage top-tier vendors all in one place.
          </p>
          <div className="hero-actions animate-fadeInUp delay-3">
            <Link to="/services" className="btn btn-primary btn-lg">
              Explore Services <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn btn-secondary btn-lg">
              Get Started Free
            </Link>
          </div>

          {/* Stats */}
          <div className="hero-stats animate-fadeInUp delay-4">
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-pill">Our Services</div>
            <h2>Everything for Your <span className="text-gradient">Perfect Event</span></h2>
            <p>Handpicked vendors, transparent pricing, and seamless booking for every occasion.</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.id} to={`/services/${cat.id}`} className={`category-card animate-fadeInUp delay-${i + 1}`} style={{ '--cat-color': cat.color, background: cat.gradient }}>
                <div className="category-card-icon">{cat.icon}</div>
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
                <div className="category-card-arrow">
                  <ChevronRight size={20} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="section how-it-works">
        <div className="container">
          <div className="section-header">
            <div className="section-pill">Process</div>
            <h2>Book in <span className="text-gradient">3 Simple Steps</span></h2>
            <p>We've made event planning effortless so you can focus on the celebration.</p>
          </div>
          <div className="steps-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className={`step-card card animate-fadeInUp delay-${i + 1}`}>
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div className="section-pill">Reviews</div>
            <h2>What Our <span className="text-gradient">Customers Say</span></h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`testimonial-card card animate-fadeInUp delay-${i + 1}`}>
                <div className="stars">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <span key={j} className="star">★</span>
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-event">{t.event}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card glass">
            <div className="cta-orb" />
            <div className="section-pill">Limited Time</div>
            <h2 className="display">Ready to Plan Something <span className="text-gradient">Amazing?</span></h2>
            <p>Join thousands of happy customers who trusted EventAura for their special moments.</p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Planning Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
