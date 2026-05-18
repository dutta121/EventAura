// src/pages/ServiceDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Phone, Check, ShoppingCart, ArrowLeft } from 'lucide-react';
import { getVendorById } from '../firebase/firestore';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-toastify';
import './ServiceDetail.css';

export default function ServiceDetail() {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getVendorById(id);
      setVendor(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /><span>Loading vendor...</span></div>;
  if (!vendor) return <div className="page-loader"><h2>Vendor not found</h2></div>;

  const pkg = vendor.packages?.[selectedPkg];
  const inCart = cartItems.some((i) => i.vendorId === vendor.id && i.packageName === pkg?.name);

  const handleAddToCart = () => {
    if (!currentUser) { toast.error('Please log in to book'); navigate('/login'); return; }
    if (!pkg) return;
    addToCart({ vendorId: vendor.id, vendorName: vendor.name, category: vendor.category, packageName: pkg.name, price: pkg.price });
    toast.success(`${pkg.name} added to cart! 🎉`);
  };

  return (
    <div className="service-detail">
      <div className="container">
        <button className="btn btn-secondary btn-sm back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="detail-grid">
          {/* Left: Info */}
          <div className="detail-main">
            {/* Header */}
            <div className="detail-header card">
            <div className="detail-hero-img" style={{
                background: vendor.heroGradient || 'linear-gradient(135deg,var(--primary),var(--primary-dark))',
              }}>
              {vendor.imageUrl ? (
                <img src={vendor.imageUrl} alt={vendor.name} className="detail-hero-real-img" />
              ) : (
                <span className="detail-hero-emoji">{vendor.emoji || '🎉'}</span>
              )}
            </div>
              <div className="detail-header-body">
                <div className="detail-badge">{vendor.category}</div>
                <h1>{vendor.name}</h1>
                <div className="detail-meta">
                  <div className="detail-rating">
                    <Star size={15} fill="var(--accent)" color="var(--accent)" />
                    <strong>{vendor.rating?.toFixed(1)}</strong>
                    <span>({vendor.reviewCount} reviews)</span>
                  </div>
                  <div className="detail-location"><MapPin size={14} />{vendor.city}</div>
                </div>
                <p className="detail-description">{vendor.description}</p>
                {vendor.tags?.length > 0 && (
                  <div className="detail-tags">
                    {vendor.tags.map((t) => <span key={t} className="vendor-tag">{t}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Packages */}
            <div className="detail-packages card">
              <h2>Available Packages</h2>
              <div className="packages-grid">
                {vendor.packages?.map((p, i) => (
                  <div
                    key={p.name}
                    className={`package-card ${selectedPkg === i ? 'selected' : ''}`}
                    onClick={() => setSelectedPkg(i)}
                  >
                    {p.popular && <div className="package-popular">Most Popular</div>}
                    <h3>{p.name}</h3>
                    <div className="package-price">{formatCurrency(p.price)}</div>
                    <ul className="package-features">
                      {p.features?.map((f) => (
                        <li key={f}><Check size={13} className="feature-check" />{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery */}
            {(vendor.galleryUrls?.length > 0 || vendor.portfolioEmojis) && (
              <div className="detail-gallery card">
                <h2>Portfolio</h2>
                <div className="gallery-grid">
                  {vendor.galleryUrls?.length > 0
                    ? vendor.galleryUrls.map((url, i) => (
                        <div key={i} className="gallery-item gallery-item-photo">
                          <img src={url} alt={`Portfolio ${i + 1}`} />
                        </div>
                      ))
                    : vendor.portfolioEmojis?.map((em, i) => (
                        <div key={i} className="gallery-item" style={{ background: vendor.heroGradient || 'var(--bg-card-hover)' }}>
                          <span>{em}</span>
                        </div>
                      ))
                  }
                </div>
              </div>
            )}
          </div>

          {/* Right: Booking Card */}
          <div className="detail-sidebar">
            <div className="booking-card card">
              <h3>Book This Vendor</h3>
              <div className="booking-selected-pkg">
                <span>Selected Package:</span>
                <strong>{pkg?.name}</strong>
              </div>
              <div className="booking-price">{formatCurrency(pkg?.price || 0)}</div>
              <ul className="booking-pkg-features">
                {pkg?.features?.slice(0, 3).map((f) => (
                  <li key={f}><Check size={13} className="feature-check" />{f}</li>
                ))}
              </ul>
              <button
                className={`btn w-full ${inCart ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleAddToCart}
                disabled={inCart}
              >
                {inCart ? <><Check size={16} /> Added to Cart</> : <><ShoppingCart size={16} /> Add to Cart</>}
              </button>
              <button className="btn btn-accent w-full" onClick={() => { handleAddToCart(); navigate('/cart'); }}>
                Book Now
              </button>
              <div className="booking-note">
                <Check size={13} className="feature-check" /> Pay on event day
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
