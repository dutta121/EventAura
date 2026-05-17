// src/pages/BookingConfirmation.jsx
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatCurrency';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="page-loader">
        <h2>No booking data</h2>
        <Link to="/services" className="btn btn-primary" style={{ marginTop: '1rem' }}>Browse Services</Link>
      </div>
    );
  }

  const { bookingId, totalAmount, items, eventDate } = state;

  return (
    <div className="confirmation-page animated-gradient">
      <div className="confirmation-card glass animate-scaleIn">
        <div className="confirmation-icon">
          <CheckCircle size={56} />
        </div>
        <h1>Booking Confirmed!</h1>
        <p className="confirmation-sub">Your event is all set. Our vendors will reach out to you shortly.</p>

        <div className="confirmation-id">
          Booking ID: <strong>{bookingId?.slice(-8).toUpperCase()}</strong>
        </div>

        <div className="confirmation-details">
          <div className="confirmation-detail-row">
            <Calendar size={16} />
            <span>Event Date:</span>
            <strong>{formatDate(eventDate)}</strong>
          </div>
          <div className="confirmation-detail-row">
            <Package size={16} />
            <span>Services Booked:</span>
            <strong>{items?.length}</strong>
          </div>
          <div className="confirmation-detail-row">
            <span>💰 Total Amount:</span>
            <strong className="confirmation-total">{formatCurrency(totalAmount)}</strong>
          </div>
        </div>

        <div className="confirmation-items">
          {items?.map((item) => (
            <div key={`${item.vendorId}-${item.packageName}`} className="confirmation-item">
              <span>{item.vendorName}</span>
              <span>{item.packageName}</span>
              <span>{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>

        <div className="confirmation-note">
          💡 Payment is due on the day of your event. No advance required.
        </div>

        <div className="confirmation-actions">
          <Link to="/my-bookings" className="btn btn-primary">
            View My Bookings <ArrowRight size={16} />
          </Link>
          <Link to="/services" className="btn btn-secondary">
            Book More Services
          </Link>
        </div>
      </div>
    </div>
  );
}
