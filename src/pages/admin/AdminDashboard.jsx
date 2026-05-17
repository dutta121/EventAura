// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { getAllBookings, getAllUsers, getVendors } from '../../firebase/firestore';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';
import { BOOKING_STATUSES } from '../../utils/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import './AdminDashboard.css';

const COLORS = ['#fbbf24', '#60a5fa', '#34d399', '#f87171'];

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [b, u, v] = await Promise.all([getAllBookings(), getAllUsers(), getVendors()]);
      setBookings(b);
      setUsers(u);
      setVendors(v);
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;
  const confirmed = bookings.filter((b) => b.status === 'confirmed').length;
  const completed = bookings.filter((b) => b.status === 'completed').length;

  // Category distribution
  const catCounts = {};
  bookings.forEach((b) => {
    b.items?.forEach((item) => {
      catCounts[item.category] = (catCounts[item.category] || 0) + 1;
    });
  });
  const pieData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));

  // Monthly chart (last 6 months)
  const monthlyData = getLast6MonthsData(bookings);

  const stats = [
    { label: 'Total Bookings', value: bookings.length, icon: ShoppingBag, color: 'var(--primary)' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'var(--accent)' },
    { label: 'Total Users', value: users.length, icon: Users, color: 'var(--info)' },
    { label: 'Total Vendors', value: vendors.length, icon: TrendingUp, color: 'var(--success)' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of your EventAura platform</p>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="admin-stat-card card">
            <div className="admin-stat-icon" style={{ background: `${s.color}20`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div>
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid">
        <div className="card">
          <h3 className="admin-chart-title">Bookings (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="admin-chart-title">Category Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}><p>No booking data yet</p></div>
          )}
        </div>
      </div>

      {/* Status Summary */}
      <div className="admin-status-row">
        {[['Pending', pending, 'pending'], ['Confirmed', confirmed, 'confirmed'], ['Completed', completed, 'completed']].map(([label, count, key]) => (
          <div key={key} className="card admin-status-card">
            <span className={`badge badge-${key}`}>{label}</span>
            <div className="admin-status-count">{count}</div>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 className="admin-chart-title">Recent Bookings</h3>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr><th>ID</th><th>User</th><th>Items</th><th>Amount</th><th>Event Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bookings.slice(0, 8).map((b) => (
                <tr key={b.id}>
                  <td className="mono">#{b.id.slice(-6).toUpperCase()}</td>
                  <td>{b.userEmail}</td>
                  <td>{b.items?.length} service(s)</td>
                  <td className="amount-cell">{formatCurrency(b.totalAmount)}</td>
                  <td>{formatDate(b.eventDate)}</td>
                  <td><span className={`badge badge-${b.status}`}>{BOOKING_STATUSES[b.status]?.label || b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>No bookings yet</p></div>}
        </div>
      </div>
    </div>
  );
}

function getLast6MonthsData(bookings) {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: d.toLocaleString('default', { month: 'short' }),
      year: d.getFullYear(),
      monthNum: d.getMonth(),
      bookings: 0,
    });
  }
  bookings.forEach((b) => {
    const date = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
    months.forEach((m) => {
      if (date.getMonth() === m.monthNum && date.getFullYear() === m.year) {
        m.bookings++;
      }
    });
  });
  return months;
}
