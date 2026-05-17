// src/pages/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, User, Phone, CreditCard, LocateFixed } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../firebase/firestore';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-toastify';
import './Checkout.css';

export default function Checkout() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const booking = await createBooking({
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: data.fullName,
        userPhone: data.phone,
        items: cartItems,
        eventDate: data.eventDate,
        eventAddress: data.address,
        eventNote: data.note || '',
        totalAmount,
        paymentMethod: 'pay_on_event',
      });
      clearCart();
      toast.success('Booking confirmed! 🎉');
      navigate('/booking-confirmation', { state: { bookingId: booking.id, totalAmount, items: cartItems, eventDate: data.eventDate } });
    } catch (err) {
      toast.error('Booking failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const address = data.display_name || `${coords.latitude}, ${coords.longitude}`;
          setValue('address', address, { shouldValidate: true });
          toast.success('📍 Location fetched!');
        } catch {
          toast.error('Could not reverse-geocode location.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        toast.error(err.code === 1 ? 'Location permission denied.' : 'Could not get location.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Complete Your Booking</h1>

        <div className="checkout-grid">
          {/* Form */}
          <form className="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="checkout-section card">
              <h3><User size={18} /> Personal Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className={`form-input ${errors.fullName ? 'input-error' : ''}`} placeholder="John Doe"
                    defaultValue={currentUser?.displayName || ''}
                    {...register('fullName', { required: 'Required' })} />
                  {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className={`form-input ${errors.phone ? 'input-error' : ''}`} placeholder="+91 98765 43210"
                    {...register('phone', { required: 'Required', pattern: { value: /^[+]?[\d\s-]{10,14}$/, message: 'Invalid phone' } })} />
                  {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                </div>
              </div>
            </div>

            <div className="checkout-section card">
              <h3><Calendar size={18} /> Event Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input
                    type="date"
                    className={`form-input ${errors.eventDate ? 'input-error' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    {...register('eventDate', { required: 'Please select a date' })}
                  />
                  {errors.eventDate && <span className="form-error">{errors.eventDate.message}</span>}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}><MapPin size={14} /> Event Address</label>
                  <button
                    type="button"
                    id="use-my-location-btn"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleUseMyLocation}
                    disabled={locating}
                  >
                    {locating
                      ? <span className="spinner spinner-sm" />
                      : <><LocateFixed size={13} /> Use My Location</>}
                  </button>
                </div>
                <textarea
                  className={`form-input ${errors.address ? 'input-error' : ''}`}
                  rows={3}
                  placeholder="Full event venue address..."
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && <span className="form-error">{errors.address.message}</span>}
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label className="form-label">Special Instructions (optional)</label>
                <textarea className="form-input" rows={2} placeholder="Any special requirements..." {...register('note')} />
              </div>
            </div>

            <div className="checkout-section card payment-card">
              <h3><CreditCard size={18} /> Payment Method</h3>
              <div className="payment-option selected">
                <div className="payment-option-dot" />
                <div>
                  <div className="payment-option-title">Pay on Event Day</div>
                  <div className="payment-option-desc">No advance payment required. Pay cash or UPI on the day of your event.</div>
                </div>
              </div>
            </div>

            <button id="place-booking-btn" type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
              {loading ? <span className="spinner spinner-sm" /> : `Confirm Booking · ${formatCurrency(totalAmount)}`}
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="checkout-summary">
            <div className="card">
              <h3>Order Summary</h3>
              <div className="co-items">
                {cartItems.map((item) => (
                  <div key={`${item.vendorId}-${item.packageName}`} className="co-item">
                    <div className="co-item-info">
                      <span className="co-item-vendor">{item.vendorName}</span>
                      <span className="co-item-pkg">{item.packageName}</span>
                    </div>
                    <span className="co-item-price">{formatCurrency(item.price)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-divider" style={{ margin: '1rem 0' }} />
              <div className="summary-total">
                <span>Total Amount</span>
                <span className="total-amount">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
