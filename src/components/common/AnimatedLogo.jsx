// src/components/common/AnimatedLogo.jsx
import { Link } from 'react-router-dom';
import './AnimatedLogo.css';

/**
 * AnimatedLogo
 * Props:
 *   size   – 'sm' | 'md' (default) | 'lg'
 *   to     – route path (default '/')
 *   as     – 'link' (default) | 'div'  (use 'div' in places where Link is wrong context)
 */
export default function AnimatedLogo({ size = 'md', to = '/', as = 'link' }) {
  const inner = (
    <>
      {/* Animated icon */}
      <span className="alogo-icon">
        <svg
          className="alogo-zap"
          xmlns="http://www.w3.org/2000/svg"
          width={size === 'lg' ? 22 : size === 'sm' ? 14 : 18}
          height={size === 'lg' ? 22 : size === 'sm' ? 14 : 18}
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          style={{ color: 'var(--accent)' }}
        >
          {/* Zap bolt */}
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>

      {/* Animated text */}
      <span className="alogo-text">
        <span className="alogo-event">Event</span>
        <span className="alogo-aura">Aura</span>
      </span>
    </>
  );

  if (as === 'div') {
    return <div className={`alogo-root size-${size}`}>{inner}</div>;
  }

  return (
    <Link to={to} className={`alogo-root size-${size}`}>
      {inner}
    </Link>
  );
}
