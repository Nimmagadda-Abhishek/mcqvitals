import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Lock, ArrowRight, Mail, BookOpen } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = localStorage.getItem('reset_password_email');
    if (storedEmail) setEmail(storedEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.auth.resetPassword({ email, otp, newPassword });
      setSuccess('Password updated successfully. Redirecting to login...');
      localStorage.removeItem('reset_password_email');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="padding-responsive" style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #eff4ff 0%, #f8f9ff 100%)'
    }}>
      <div className="premium-card" style={{ maxWidth: '440px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img src="/logo.png" alt="Mcqvitals Logo" style={{ height: '72px', borderRadius: '12px', marginBottom: '1.5rem', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Update Password</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
            Enter the OTP and your new password.
          </p>
        </div>

        {error && (
          <div
            style={{
              color: 'var(--error)',
              backgroundColor: '#fff1f0',
              padding: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              textAlign: 'center',
              border: '1px solid #ffa39e',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              color: 'var(--success)',
              backgroundColor: '#f6ffed',
              padding: '0.8rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              textAlign: 'center',
              border: '1px solid #b7eb8f',
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--on-surface-variant)',
              }}
            />
            <input
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-low)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              placeholder="OTP"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-low)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock
              size={18}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--on-surface-variant)',
              }}
            />
            <input
              type="password"
              placeholder="New password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 1rem 1rem 3rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-low)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
          </div>

          <button
            className="primary-gradient"
            type="submit"
            disabled={loading}
            style={{
              padding: '1.1rem',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              marginTop: '0.5rem',
              boxShadow: '0 10px 25px -5px rgba(0, 55, 176, 0.3)',
              opacity: loading ? 0.75 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Updating...' : 'Reset Password'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--outline-variant)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
            Back to <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

