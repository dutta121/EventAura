// src/pages/admin/AdminVendors.jsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { getVendors, addVendor, updateVendor, deleteVendor } from '../../firebase/firestore';
import { CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from 'react-toastify';
import '../admin/AdminDashboard.css';
import './AdminVendors.css';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchVendors = async () => {
    const data = await getVendors();
    setVendors(data);
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, []);

  const openAddModal = () => { setEditingVendor(null); reset(); setShowModal(true); };
  const openEditModal = (vendor) => {
    setEditingVendor(vendor);
    Object.entries(vendor).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') setValue(k, v);
    });
    setValue('tags', vendor.tags?.join(', ') || '');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingVendor(null); reset(); };

  const onSubmit = async (data) => {
    setSaving(true);
    const vendorData = {
      name: data.name,
      category: data.category,
      city: data.city,
      rating: parseFloat(data.rating) || 4.5,
      reviewCount: parseInt(data.reviewCount) || 0,
      basePrice: parseInt(data.basePrice) || 0,
      description: data.description || '',
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      emoji: data.emoji || '🎉',
      featured: data.featured === 'true' || data.featured === true,
      packages: [
        { name: data.pkg1Name, price: parseInt(data.pkg1Price) || 0, features: (data.pkg1Features || '').split(',').map((f) => f.trim()).filter(Boolean) },
        ...(data.pkg2Name ? [{ name: data.pkg2Name, price: parseInt(data.pkg2Price) || 0, features: (data.pkg2Features || '').split(',').map((f) => f.trim()).filter(Boolean), popular: true }] : []),
        ...(data.pkg3Name ? [{ name: data.pkg3Name, price: parseInt(data.pkg3Price) || 0, features: (data.pkg3Features || '').split(',').map((f) => f.trim()).filter(Boolean) }] : []),
      ],
    };
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, vendorData);
        toast.success('Vendor updated');
      } else {
        await addVendor(vendorData);
        toast.success('Vendor added');
      }
      closeModal();
      fetchVendors();
    } catch (err) {
      toast.error('Failed to save vendor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    await deleteVendor(id);
    toast.success('Vendor deleted');
    fetchVendors();
  };

  return (
    <div className="admin-vendors">
      <div className="admin-page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Vendors</h1>
          <p>Manage your event service vendors</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}><Plus size={16} /> Add Vendor</button>
      </div>

      {loading ? (
        <div className="page-loader" style={{ minHeight: '40vh' }}><div className="spinner" /></div>
      ) : (
        <div className="card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Category</th><th>City</th><th>Rating</th><th>Base Price</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {vendors.map((v) => (
                  <tr key={v.id}>
                    <td><strong>{v.emoji} {v.name}</strong></td>
                    <td><span className={`badge badge-user`}>{v.category}</span></td>
                    <td>{v.city}</td>
                    <td>⭐ {v.rating?.toFixed(1)}</td>
                    <td className="amount-cell">{formatCurrency(v.basePrice)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(v)}><Edit size={13} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {vendors.length === 0 && <div className="empty-state" style={{ padding: '2rem' }}><p>No vendors yet. Add one!</p></div>}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h3>
              <button className="modal-close-btn" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="vendor-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" {...register('name', { required: true })} placeholder="Vendor name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" {...register('category', { required: true })}>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" {...register('city')} placeholder="Kolkata" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji</label>
                  <input className="form-input" {...register('emoji')} placeholder="🎉" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <input className="form-input" type="number" step="0.1" min="1" max="5" {...register('rating')} placeholder="4.5" />
                </div>
                <div className="form-group">
                  <label className="form-label">Review Count</label>
                  <input className="form-input" type="number" {...register('reviewCount')} placeholder="120" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Base Price (₹)</label>
                  <input className="form-input" type="number" {...register('basePrice')} placeholder="10000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input className="form-input" {...register('tags')} placeholder="Candid, Outdoor, Luxury" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} {...register('description')} placeholder="About this vendor..." />
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Packages (at least 1 required)</h4>
              {[1, 2, 3].map((n) => (
                <div key={n} className="package-form-row">
                  <span className="pkg-label">Pkg {n}</span>
                  <input className="form-input" {...register(`pkg${n}Name`)} placeholder={`Package ${n} name`} />
                  <input className="form-input" type="number" {...register(`pkg${n}Price`)} placeholder="Price ₹" />
                  <input className="form-input" {...register(`pkg${n}Features`)} placeholder="Features (comma sep)" />
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-full" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : <><Save size={16} /> {editingVendor ? 'Update Vendor' : 'Add Vendor'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
