// src/pages/admin/AdminBookings.jsx
import { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus } from '../../firebase/firestore';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { BOOKING_STATUSES } from '../../utils/constants';
import { toast } from 'react-toastify';
import '../admin/AdminDashboard.css';
import './AdminBookings.css';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    const data = await getAllBookings();
    setBookings(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    setFiltered(statusFilter === 'all' ? bookings : bookings.filter((b) => b.status === statusFilter));
  }, [statusFilter, bookings]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBookingStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchBookings();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="admin-bookings" style={{ maxWidth: 1100 }}>
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Bookings</h1>
          <p>Manage and update booking statuses</p>
        </div>
        <div className="status-filter-tabs">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              className={`status-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>User</th><th>Services</th><th>Event Date</th><th>Amount</th><th>Status</th><th>Update</th></tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id}>
                    <td className="mono">#{b.id.slice(-6).toUpperCase()}</td>
                    <td>
                      <div>{b.userName || '—'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.userEmail}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {b.items?.map((item) => (
                          <span key={`${item.vendorId}-${item.packageName}`} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {item.vendorName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>{formatDate(b.eventDate)}</td>
                    <td className="amount-cell">{formatCurrency(b.totalAmount)}</td>
                    <td><span className={`badge badge-${b.status}`}>{BOOKING_STATUSES[b.status]?.label || b.status}</span></td>
                    <td>
                      <select
                        className="status-select"
                        value={b.status}
                        onChange={(e) => handleStatusChange(b.id, e.target.value)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{BOOKING_STATUSES[s]?.label || s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>No bookings for this filter</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
