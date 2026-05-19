// src/pages/LandingPage.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, ChevronRight, Sparkles,
  CalendarCheck, Users, Award, Shield,
} from 'lucide-react';
import { CATEGORIES } from '../utils/constants';
import AnimatedLogo from '../components/common/AnimatedLogo';
import './LandingPage.css';

/* ── Data ─────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 10000, suffix: '+', label: 'Events Planned',  icon: <CalendarCheck size={18} /> },
  { value: 500,   suffix: '+', label: 'Expert Vendors',  icon: <Users size={18} /> },
  { value: 4.9,   suffix: '★', label: 'Average Rating',  icon: <Star size={18} /> },
  { value: 25,    suffix: '+', label: 'Cities Covered',  icon: <Award size={18} /> },
];

const TESTIMONIALS = [
  { name: 'Priya Sharma',  event: 'Wedding',        rating: 5, text: 'EventAura turned our dream wedding into reality. Every detail was perfect!' },
  { name: 'Rohan Das',     event: 'Birthday Party', rating: 5, text: 'Found the perfect DJ and photographer in one place. Absolutely magical experience!' },
  { name: 'Ananya Sen',    event: 'Corporate Event',rating: 5, text: 'The platform is incredibly intuitive. Booked everything in under 30 minutes.' },
  { name: 'Arjun Mehta',   event: 'Anniversary',    rating: 5, text: 'Beautiful decor, amazing vendor support. Would highly recommend EventAura!' },
  { name: 'Kavita Rao',    event: 'Graduation Party',rating: 5, text: 'Exceptional service from start to finish. The team went above and beyond!' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Browse Services',   desc: 'Explore curated vendors across birthday, wedding, DJ, and photography categories.', icon: '🔍' },
  { step: '02', title: 'Add to Cart',       desc: 'Pick your favourite packages and add them to your event cart effortlessly.', icon: '🛒' },
  { step: '03', title: 'Confirm & Celebrate', desc: 'Fill in event details, confirm your booking, and pay on the event day.', icon: '✅' },
];

const TRUST_BADGES = [
  { icon: <Shield size={16} />, label: 'Secure Payments' },
  { icon: <Award size={16} />,  label: 'Verified Vendors' },
  { icon: <Star size={16} />,   label: '4.9★ Rated' },
  { icon: <Users size={16} />,  label: '10K+ Happy Clients' },
];

/* ── Hooks ──────────────────────────────────────────────────────────────── */

/** Returns true once the element enters the viewport */
function useInView(ref, { threshold = 0.15, once = true } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold, once]);
  return inView;
}

/** Animated number counter */
function Counter({ target, suffix, duration = 1800 }) {
  const [count, setCount] = useState(0);
  const isFloat = !Number.isInteger(target);

  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(isFloat ? parseFloat(start.toFixed(1)) : Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, isFloat]);

  return <>{count}{suffix}</>;
}

/* ── Scroll-reveal wrapper ─────────────────────────────────────────────── */
function Reveal({ children, className = '', delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'revealed' : ''} reveal-${direction} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ── Testimonial Carousel ──────────────────────────────────────────────── */
function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  const go = (i) => {
    setActive(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((c) => (c + 1) % TESTIMONIALS.length), 5000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => setActive((c) => (c + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <div className="testimonials-carousel">
      <div className="tcarousel-card card" key={active}>
        <div className="stars">
          {Array(t.rating).fill(0).map((_, j) => <span key={j} className="star">★</span>)}
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

      {/* Static side cards — desktop only */}
      <div className="tcarousel-sides">
        {TESTIMONIALS.filter((_, i) => i !== active).slice(0, 2).map((tc, i) => (
          <div
            key={tc.name}
            className="tcarousel-side-card card"
            onClick={() => go(TESTIMONIALS.indexOf(tc))}
          >
            <div className="stars">{Array(tc.rating).fill(0).map((_, j) => <span key={j} className="star">★</span>)}</div>
            <p className="testimonial-text">"{tc.text}"</p>
            <div className="testimonial-name">{tc.name}</div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="tcarousel-dots">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`tcarousel-dot ${i === active ? 'active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Review ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { threshold: 0.3 });

  return (
    <div className="landing">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero animated-gradient">
        {/* Orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Floating emoji decorations */}
        <span className="hero-float-emoji" style={{ top:'18%', left:'7%',  animationDelay:'0s'   }}>🎂</span>
        <span className="hero-float-emoji" style={{ top:'25%', right:'8%', animationDelay:'1.2s' }}>💍</span>
        <span className="hero-float-emoji" style={{ bottom:'22%', left:'5%',  animationDelay:'2.1s' }}>🎧</span>
        <span className="hero-float-emoji" style={{ bottom:'18%', right:'6%', animationDelay:'0.7s' }}>📷</span>

        <div className="container hero-content">
          <div className="hero-badge animate-fadeInDown">
            <Sparkles size={14} /> India's #1 Event Planning Platform
          </div>

          <h1 className="hero-title animate-fadeInUp display">
            Plan Events That <span className="text-gradient">Leave Memories</span> Forever
          </h1>

          <p className="hero-subtitle animate-fadeInUp delay-2">
            From intimate birthdays to grand weddings — discover, book, and manage
            top-tier vendors all in one beautiful place.
          </p>

          {/* Trust badges row */}
          <div className="hero-trust animate-fadeInUp delay-2">
            {TRUST_BADGES.map((b) => (
              <span key={b.label} className="trust-badge">
                {b.icon} {b.label}
              </span>
            ))}
          </div>

          <div className="hero-actions animate-fadeInUp delay-3">
            <Link to="/services" className="btn btn-primary btn-lg hero-cta-main">
              Explore Services <ArrowRight size={18} />
            </Link>
            <Link to="/signup" className="btn btn-secondary btn-lg">
              Get Started Free
            </Link>
          </div>

          {/* Stats counter strip */}
          <div className="hero-stats animate-fadeInUp delay-4" ref={statsRef}>
            {STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-icon">{s.icon}</div>
                <span className="hero-stat-value">
                  {statsInView ? <Counter target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
                </span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="section-header">
            <div className="section-pill">Our Services</div>
            <h2>Everything for Your <span className="text-gradient">Perfect Event</span></h2>
            <p>Handpicked vendors, transparent pricing, and seamless booking for every occasion.</p>
          </Reveal>

          <div className="categories-grid">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.id} delay={i * 80}>
                <Link
                  to={`/services/${cat.id}`}
                  className="category-card"
                  style={{ '--cat-color': cat.color, background: cat.gradient }}
                >
                  <div className="category-card-icon">{cat.icon}</div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <div className="category-card-arrow">
                    <ChevronRight size={20} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="section how-it-works">
        <div className="container">
          <Reveal className="section-header">
            <div className="section-pill">Process</div>
            <h2>Book in <span className="text-gradient">3 Simple Steps</span></h2>
            <p>We've made event planning effortless so you can focus on the celebration.</p>
          </Reveal>

          <div className="steps-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.step} delay={i * 120} direction="up">
                <div className="step-card card">
                  <div className="step-number">{step.step}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  {i < HOW_IT_WORKS.length - 1 && <div className="step-connector" />}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <Reveal className="section-header">
            <div className="section-pill">Reviews</div>
            <h2>What Our <span className="text-gradient">Customers Say</span></h2>
            <p>Real stories from real people who made their events unforgettable.</p>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <TestimonialCarousel />
          </Reveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="section cta-section">
        <div className="container">
          <Reveal direction="up">
            <div className="cta-card glass">
              <div className="cta-orb cta-orb-1" />
              <div className="cta-orb cta-orb-2" />
              <AnimatedLogo size="lg" as="div" />
              <div className="section-pill">Start Today</div>
              <h2 className="display">Ready to Plan Something <span className="text-gradient">Amazing?</span></h2>
              <p>Join thousands of happy customers who trusted EventAura for their special moments.</p>
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary btn-lg">
                  Start Planning Now <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn btn-secondary btn-lg">
                  Browse Vendors
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
