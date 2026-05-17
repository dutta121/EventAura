// src/pages/admin/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../../firebase/firestore';
import { formatDate } from '../../utils/formatCurrency';
import { toast } from 'react-toastify';
import '../admin/AdminDashboard.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (uid, newRole) => {
    try {
      await updateUserRole(uid, newRole);
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      <div className="admin-page-header">
        <h1>Users</h1>
        <p>Manage registered users and their roles</p>
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Update Role</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--primary),var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'white', flexShrink: 0 }}>
                          {u.displayName?.[0] || u.email?.[0] || '?'}
                        </div>
                        <strong>{u.displayName || '—'}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'admin' ? 'admin' : 'user'}`}>{u.role || 'user'}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <select
                        style={{ background: 'var(--bg-card-hover)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}
                        value={u.role || 'user'}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>No users yet</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
