// src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { signOutUser } from '../../firebase/auth';
import { toast } from 'react-toastify';
import AnimatedLogo from '../common/AnimatedLogo';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    toast.success('Signed out successfully');
    navigate('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className={`navbar glass ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Logo */}
        <AnimatedLogo size="md" to="/" />

        {/* Desktop Nav Links */}
        <div className="navbar-links hide-mobile">
          <NavLink to="/services" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Services</NavLink>
          <NavLink to="/services/birthday" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Birthday</NavLink>
          <NavLink to="/services/wedding" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Wedding</NavLink>
          <NavLink to="/services/dj" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>DJ</NavLink>
          <NavLink to="/services/photography" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Photography</NavLink>
        </div>

        {/* Right section */}
        <div className="navbar-actions">
          {currentUser ? (
            <>
              <Link to="/cart" className="cart-btn">
                <ShoppingCart size={20} />
                {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
              </Link>
              <div className="user-menu-wrapper">
                <button className="user-avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                  <div className="avatar">
                    {currentUser.photoURL
                      ? <img src={currentUser.photoURL} alt="avatar" />
                      : <span>{(currentUser.displayName || currentUser.email)?.[0]?.toUpperCase()}</span>}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown animate-scaleIn">
                    <div className="user-dropdown-header">
                      <span className="user-name">{currentUser.displayName || 'User'}</span>
                      <span className="user-email">{currentUser.email}</span>
                    </div>
                    <div className="user-dropdown-divider" />
                    <Link to="/dashboard" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    <Link to="/my-bookings" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                      <User size={15} /> My Bookings
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="user-dropdown-item admin-item" onClick={() => setUserMenuOpen(false)}>
                        <Shield size={15} /> Admin Panel
                      </Link>
                    )}
                    <div className="user-dropdown-divider" />
                    <button className="user-dropdown-item danger" onClick={handleSignOut}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-buttons hide-mobile">
              <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}

          {/* Mobile toggle */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu animate-fadeInDown">
          <NavLink to="/services" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Services</NavLink>
          <NavLink to="/services/birthday" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Birthday Planning</NavLink>
          <NavLink to="/services/wedding" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Wedding Decoration</NavLink>
          <NavLink to="/services/dj" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>DJ Booking</NavLink>
          <NavLink to="/services/photography" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Photography</NavLink>
          {!currentUser && (
            <div className="mobile-auth-btns">
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
