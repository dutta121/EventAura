// src/pages/MyBookings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeUserBookings } from '../firebase/firestore';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { BOOKING_STATUSES } from '../utils/constants';
import { CalendarDays, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import './MyBookings.css';

export default function MyBookings() {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    // Subscribe to real-time updates — unsubscribe on unmount
    const unsubscribe = subscribeUserBookings(
      currentUser.uid,
      (data) => {
        setBookings(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Could not load bookings. Please refresh the page.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  if (error) return (
    <div className="page-loader">
      <p style={{ color: 'var(--error, #f87171)', marginBottom: '1rem' }}>{error}</p>
      <Link to="/services" className="btn btn-primary">Browse Services</Link>
    </div>
  );

  return (
    <div className="my-bookings-page">
      <div className="container">
        <h1 className="page-heading">My Bookings</h1>
        <p className="page-sub">All your event bookings in one place</p>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No bookings yet</h3>
            <p>Start planning your first event today</p>
            <Link to="/services" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Browse Services</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const status = BOOKING_STATUSES[booking.status] || BOOKING_STATUSES.pending;
              return (
                <div key={booking.id} className="booking-row card">
                  <div className="booking-row-left">
                    <div className="booking-row-id">#{booking.id.slice(-8).toUpperCase()}</div>
                    <div className="booking-row-date">
                      <CalendarDays size={14} />
                      <span>Event: <strong>{formatDate(booking.eventDate)}</strong></span>
                    </div>
                    <div className="booking-row-items">
                      <Package size={14} />
                      <span>{booking.items?.length} service{booking.items?.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="booking-item-names">
                      {booking.items?.map((item) => (
                        <span key={`${item.vendorId}-${item.packageName}`} className="booking-item-chip">
                          {item.vendorName} — {item.packageName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="booking-row-right">
                    <span className={`badge badge-${booking.status}`}>{status.label}</span>
                    <div className="booking-total">{formatCurrency(booking.totalAmount)}</div>
                    <div className="booking-created">Booked {formatDate(booking.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
