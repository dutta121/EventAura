// src/components/cards/VendorCard.jsx
import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import './VendorCard.css';

export default function VendorCard({ vendor }) {
  const { addToCart, cartItems } = useCart();

  const basePackage = vendor.packages?.[0];
  const inCart = cartItems.some(
    (i) => i.vendorId === vendor.id && i.packageName === basePackage?.name
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!basePackage) return;
    addToCart({
      vendorId: vendor.id,
      vendorName: vendor.name,
      category: vendor.category,
      packageName: basePackage.name,
      price: basePackage.price,
    });
  };

  return (
    <Link to={`/services/${vendor.category}/${vendor.id}`} className="vendor-card card">
      {/* Image */}
      <div className="vendor-card-image">
        <div className="vendor-card-img-placeholder" style={{ background: vendor.color || 'var(--bg-card-hover)' }}>
          <span className="vendor-emoji">{vendor.emoji || '🎉'}</span>
        </div>
        <div className="vendor-card-category">{vendor.category}</div>
        {vendor.featured && <div className="vendor-card-featured">⭐ Featured</div>}
      </div>

      {/* Content */}
      <div className="vendor-card-body">
        <h3 className="vendor-card-name">{vendor.name}</h3>

        <div className="vendor-card-meta">
          <div className="vendor-card-rating">
            <Star size={13} fill="var(--accent)" color="var(--accent)" />
            <span>{vendor.rating?.toFixed(1)}</span>
            <span className="review-count">({vendor.reviewCount} reviews)</span>
          </div>
          <div className="vendor-card-location">
            <MapPin size={13} />
            <span>{vendor.city}</span>
          </div>
        </div>

        {vendor.tags?.length > 0 && (
          <div className="vendor-card-tags">
            {vendor.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="vendor-tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="vendor-card-footer">
          <div className="vendor-price">
            <span className="price-label">Starting from</span>
            <span className="price-value">{formatCurrency(vendor.basePrice)}</span>
          </div>
          <button
            className={`btn btn-sm ${inCart ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleAddToCart}
          >
            {inCart ? <><Check size={14} /> Added</> : <><ShoppingCart size={14} /> Book</>}
          </button>
        </div>
      </div>
    </Link>
  );
}
