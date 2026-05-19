// src/components/cards/VendorCard.jsx
import { Link } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const [imgIndex, setImgIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [fading, setFading]     = useState(false);
  const [hovered, setHovered]   = useState(false);
  const [isTouch, setIsTouch]   = useState(false);
  const intervalRef = useRef(null);

  // Detect touch-only devices once on mount
  useEffect(() => {
    const touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    setIsTouch(touch);
  }, []);

  const goTo = useCallback((next) => {
    if (allImages.length < 2) return;
    setImgIndex((cur) => {
      setPrevIndex(cur);
      setFading(true);
      return (next + allImages.length) % allImages.length;
    });
  }, [allImages.length]);

  const advanceImage = useCallback(() => {
    setImgIndex((cur) => {
      const next = (cur + 1) % allImages.length;
      setPrevIndex(cur);
      setFading(true);
      return next;
    });
  }, [allImages.length]);

  // Auto-play:
  //   • touch devices  → always running (no hover needed)
  //   • pointer devices → only while hovered
  useEffect(() => {
    const shouldPlay = allImages.length > 1 && (isTouch || hovered);
    if (shouldPlay) {
      intervalRef.current = setInterval(advanceImage, isTouch ? 2200 : 1800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [hovered, isTouch, advanceImage, allImages.length]);

  // Reset to first image when mouse leaves
  const handleMouseLeave = () => {
    setHovered(false);
    clearInterval(intervalRef.current);
    setFading(false);
    setPrevIndex(null);
    setImgIndex(0);
  };

  // Clear fading state after animation
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

  const handleNav = (e, dir) => {
    e.preventDefault();
    e.stopPropagation();
    clearInterval(intervalRef.current);
    goTo(imgIndex + dir);
    // Restart auto-play after manual nav
    if (hovered) {
      intervalRef.current = setInterval(advanceImage, 1800);
    }
  };

  const handleDotClick = (e, i) => {
    e.preventDefault();
    e.stopPropagation();
    clearInterval(intervalRef.current);
    goTo(i);
    if (hovered) {
      intervalRef.current = setInterval(advanceImage, 1800);
    }
  };

  const hasImage = allImages.length > 0;

  return (
    <Link
      to={`/services/${vendor.category}/${vendor.id}`}
      className="vendor-card card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image / Emoji area */}
      <div className="vendor-card-image">
        {hasImage ? (
          <>
            {/* Outgoing image fades out */}
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

            {/* ── Nav arrows (visible on hover when >1 image) ── */}
            {allImages.length > 1 && (
              <>
                <button
                  className="vc-nav-btn vc-nav-prev"
                  onClick={(e) => handleNav(e, -1)}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  className="vc-nav-btn vc-nav-next"
                  onClick={(e) => handleNav(e, 1)}
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* ── Dot indicators (clickable) ── */}
            {allImages.length > 1 && (
              <div className="vendor-img-dots">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    className={`vendor-img-dot ${i === imgIndex ? 'active' : ''}`}
                    onClick={(e) => handleDotClick(e, i)}
                    aria-label={`Go to image ${i + 1}`}
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
