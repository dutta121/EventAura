// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, CalendarCheck, Users, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { signOutUser } from '../../firebase/auth';
import { toast } from 'react-toastify';
import AnimatedLogo from '../../components/common/AnimatedLogo';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/vendors', label: 'Vendors', icon: Store },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { to: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <AnimatedLogo size="sm" as="div" />
          <span className="admin-tag"><Shield size={11} /> Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user">
            <div className="admin-user-avatar">
              {currentUser?.displayName?.[0] || 'A'}
            </div>
            <div className="admin-user-info">
              <span>{currentUser?.displayName || 'Admin'}</span>
              <span className="admin-user-email">{currentUser?.email}</span>
            </div>
          </div>
          <button className="admin-signout-btn" onClick={handleSignOut}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
