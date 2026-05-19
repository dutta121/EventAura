// src/pages/ServiceDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Check, ShoppingCart, ArrowLeft, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { getVendorById } from '../firebase/firestore';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-toastify';
import './ServiceDetail.css';

/* ── Lightbox Component ─────────────────────────────────────────────────────── */
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [prev, next, onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      {/* Close */}
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={22} />
      </button>

      {/* Counter */}
      <div className="lightbox-counter">{current + 1} / {images.length}</div>

      {/* Prev */}
      {images.length > 1 && (
        <button className="lightbox-nav lightbox-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image */}
      <div className="lightbox-img-wrap" onClick={(e) => e.stopPropagation()}>
        <img
          key={current}
          src={images[current]}
          alt={`Portfolio ${current + 1}`}
          className="lightbox-img"
        />
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button className="lightbox-nav lightbox-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">
          <ChevronRight size={28} />
        </button>
      )}

      {/* Dot strip */}
      {images.length > 1 && (
        <div className="lightbox-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`lightbox-dot ${i === current ? 'active' : ''}`}
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */
export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [vendor, setVendor]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedPkg, setSelectedPkg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

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
  if (!vendor)  return <div className="page-loader"><h2>Vendor not found</h2></div>;

  const pkg    = vendor.packages?.[selectedPkg];
  const inCart = cartItems.some((i) => i.vendorId === vendor.id && i.packageName === pkg?.name);

  const handleAddToCart = () => {
    if (!currentUser) { toast.error('Please log in to book'); navigate('/login'); return; }
    if (!pkg) return;
    addToCart({ vendorId: vendor.id, vendorName: vendor.name, category: vendor.category, packageName: pkg.name, price: pkg.price });
    toast.success(`${pkg.name} added to cart! 🎉`);
  };

  // Build gallery image list
  const galleryImages = vendor.galleryUrls?.length > 0
    ? vendor.galleryUrls
    : [];

  const openLightbox = (i) => { setLightboxStart(i); setLightboxOpen(true); };

  return (
    <div className="service-detail">
      {lightboxOpen && galleryImages.length > 0 && (
        <Lightbox
          images={galleryImages}
          startIndex={lightboxStart}
          onClose={() => setLightboxOpen(false)}
        />
      )}

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
            {(galleryImages.length > 0 || vendor.portfolioEmojis) && (
              <div className="detail-gallery card">
                <h2>Portfolio</h2>
                <div className="gallery-grid">
                  {galleryImages.length > 0
                    ? galleryImages.map((url, i) => (
                        <div
                          key={i}
                          className="gallery-item gallery-item-photo"
                          onClick={() => openLightbox(i)}
                          title="Click to view full screen"
                        >
                          <img src={url} alt={`Portfolio ${i + 1}`} />
                          <div className="gallery-item-overlay">
                            <ZoomIn size={20} />
                          </div>
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
