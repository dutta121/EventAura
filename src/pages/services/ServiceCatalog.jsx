// src/pages/services/ServiceCatalog.jsx  — shared template for all category pages
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Star, TrendingUp, DollarSign } from 'lucide-react';
import { getVendors } from '../../firebase/firestore';
import VendorCard from '../../components/cards/VendorCard';
import './ServiceCatalog.css';

export default function ServiceCatalog({ category, title, subtitle, emoji, heroGradient }) {
  const [vendors, setVendors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [maxPrice, setMaxPrice] = useState(200000);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await getVendors(category);
        setVendors(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [category]);

  useEffect(() => {
    let result = [...vendors];
    if (search) {
      result = result.filter((v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    result = result.filter((v) => v.basePrice <= maxPrice);
    result.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      return 0;
    });
    setFiltered(result);
  }, [vendors, search, sortBy, maxPrice]);

  return (
    <div className="service-catalog">
      {/* Hero Banner */}
      <div className="catalog-hero" style={{ background: heroGradient }}>
        <div className="catalog-hero-overlay" />
        <div className="container catalog-hero-content">
          <span className="catalog-hero-emoji">{emoji}</span>
          <h1 className="display">{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="container catalog-body">
        {/* Filters Bar */}
        <div className="catalog-filters glass">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              className="search-input"
              type="text"
              placeholder="Search vendors, styles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <SlidersHorizontal size={15} />
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <div className="filter-group">
            <DollarSign size={15} />
            <div className="price-filter">
              <span>Max: ₹{(maxPrice / 1000).toFixed(0)}K</span>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="price-slider"
              />
            </div>
          </div>

          <div className="catalog-count">
            {filtered.length} vendor{filtered.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="vendors-grid">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton skeleton-card" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No vendors found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="vendors-grid">
            {filtered.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
