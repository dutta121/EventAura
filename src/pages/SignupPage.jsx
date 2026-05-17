// src/pages/SignupPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Zap, Eye, EyeOff } from 'lucide-react';
import { signUpWithEmail, signInWithGoogle } from '../firebase/auth';
import { toast } from 'react-toastify';
import './AuthPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signUpWithEmail(data.email, data.password, data.displayName);
      toast.success('Account created! Welcome to EventAura 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email already in use' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to EventAura! 🎉');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.code === 'auth/account-exists-with-different-credential'
        ? err.message
        : 'Google sign-in failed.';
      toast.error(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page animated-gradient">
      <div className="auth-card glass animate-scaleIn">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Zap size={24} fill="currentColor" /></div>
          <span>EventAura</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start planning extraordinary events today</p>

        <button className="google-btn" onClick={handleGoogleSignIn} disabled={googleLoading}>
          {googleLoading ? <span className="spinner spinner-sm" /> : (
            <><GoogleIcon /> Continue with Google</>
          )}
        </button>

        <div className="divider-with-text">or sign up with email</div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                id="signup-name"
                className={`form-input with-icon ${errors.displayName ? 'input-error' : ''}`}
                type="text"
                placeholder="John Doe"
                {...register('displayName', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })}
              />
            </div>
            {errors.displayName && <span className="form-error">{errors.displayName.message}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Email</label>
            <div className="input-icon-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="signup-email"
                className={`form-input with-icon ${errors.email ? 'input-error' : ''}`}
                type="email"
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="signup-password"
                className={`form-input with-icon with-icon-right ${errors.password ? 'input-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 6 characters"
                {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
              />
              <button type="button" className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button id="signup-submit" type="submit" className="btn btn-primary w-full" style={{ marginTop: '1.5rem' }} disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>

      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}
