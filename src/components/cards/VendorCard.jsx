// src/components/cards/VendorCard.jsx
import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import { useRef, useState, useEffect, useCallback } from 'react';
import './VendorCard.css';

export default function VendorCard({ vendor }) {
  const { addToCart, cartItems } = useCart();

  const basePackage = vendor.packages?.[0];
  const inCart = cartItems.some(
    (i) => i.vendorId === vendor.id && i.packageName === basePackage?.name
  );

  // Build the full image pool: [imageUrl, ...galleryUrls] minus empties
  const allImages = [
    vendor.imageUrl,
    ...(vendor.galleryUrls || []),
  ].filter(Boolean);

  // Active displayed image index (0 = main, then gallery in order)
  const [imgIndex, setImgIndex] = useState(0);
  // For crossfade: track the "previous" image while fading in the new one
  const [prevIndex, setPrevIndex] = useState(null);
  const [fading, setFading] = useState(false);
  const intervalRef = useRef(null);
  const hoveringRef = useRef(false);

  const advanceImage = useCallback(() => {
    if (allImages.length < 2) return;
    setImgIndex((cur) => {
      const next = (cur + 1) % allImages.length;
      setPrevIndex(cur);
      setFading(true);
      return next;
    });
  }, [allImages.length]);

  const startLoop = useCallback(() => {
    if (allImages.length < 2) return;
    hoveringRef.current = true;
    // Advance immediately, then every 1.4 s
    advanceImage();
    intervalRef.current = setInterval(advanceImage, 1400);
  }, [advanceImage, allImages.length]);

  const stopLoop = useCallback(() => {
    hoveringRef.current = false;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    // Reset back to main image
    setFading(false);
    setPrevIndex(null);
    setImgIndex(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(intervalRef.current), []);

  // After fading in, clear the "previous" overlay
  useEffect(() => {
    if (!fading) return;
    const t = setTimeout(() => setFading(false), 500);
    return () => clearTimeout(t);
  }, [fading, imgIndex]);

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

  const hasImage = allImages.length > 0;

  return (
    <Link
      to={`/services/${vendor.category}/${vendor.id}`}
      className="vendor-card card"
      onMouseEnter={startLoop}
      onMouseLeave={stopLoop}
    >
      {/* Image / Emoji area */}
      <div className="vendor-card-image">
        {hasImage ? (
          <>
            {/* Previous image fades out */}
            {fading && prevIndex !== null && (
              <img
                key={`prev-${prevIndex}`}
                src={allImages[prevIndex]}
                alt=""
                className="vendor-card-img vendor-card-img-prev"
              />
            )}
            {/* Current image fades in */}
            <img
              key={`cur-${imgIndex}`}
              src={allImages[imgIndex]}
              alt={vendor.name}
              className={`vendor-card-img ${fading ? 'vendor-card-img-enter' : 'vendor-card-img-visible'}`}
            />
            {/* Image counter dot indicators */}
            {allImages.length > 1 && (
              <div className="vendor-img-dots">
                {allImages.map((_, i) => (
                  <span
                    key={i}
                    className={`vendor-img-dot ${i === imgIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="vendor-card-img-placeholder"
            style={{ background: vendor.color || 'var(--bg-card-hover)' }}
          >
            <span className="vendor-emoji">{vendor.emoji || '🎉'}</span>
          </div>
        )}

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
