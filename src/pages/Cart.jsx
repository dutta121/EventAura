// src/pages/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingCart, ArrowRight, ArrowLeft, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import './Cart.css';

export default function Cart() {
  const { cartItems, removeFromCart, totalAmount, itemCount } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-state" style={{ paddingTop: '6rem' }}>
            <div className="empty-state-icon"><ShoppingCart size={60} strokeWidth={1} /></div>
            <h3>Your cart is empty</h3>
            <p>Browse our services and add vendors to your cart</p>
            <Link to="/services" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Explore Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Continue Shopping
          </button>
          <h1>Your Cart <span className="cart-count-label">({itemCount} items)</span></h1>
        </div>

        <div className="cart-grid">
          {/* Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={`${item.vendorId}-${item.packageName}`} className="cart-item card">
                <div className="cart-item-icon">
                  <Package size={24} />
                </div>
                <div className="cart-item-info">
                  <div className="cart-item-vendor">{item.vendorName}</div>
                  <div className="cart-item-package">{item.packageName}</div>
                  <div className="cart-item-category">{item.category}</div>
                </div>
                <div className="cart-item-price">{formatCurrency(item.price)}</div>
                <button
                  className="cart-remove-btn"
                  onClick={() => removeFromCart(item.vendorId, item.packageName)}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              {cartItems.map((item) => (
                <div key={`${item.vendorId}-${item.packageName}`} className="summary-row">
                  <span>{item.vendorName} — {item.packageName}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider" />
            <div className="summary-total">
              <span>Total</span>
              <span className="total-amount">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="summary-note">Pay on event day · No advance required</div>
            <button className="btn btn-primary w-full btn-lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
