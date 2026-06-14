import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const location = useLocation();
  const { approvalStatus, logout } = useAuth();

  const statusFromState = location?.state?.approvalStatus;
  const effectiveStatus = statusFromState || approvalStatus;

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #eff4ff 0%, #f8f9ff 100%)',
      padding: '2rem'
    }}>
      <div className="premium-card" style={{ maxWidth: '560px', width: '100%', padding: '3rem', textAlign: 'center' }}>
        <div className="primary-gradient" style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}>
          <Clock size={24} color="white" />
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Approval Pending</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Your registration has been submitted and is awaiting admin approval.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1.75rem',
          padding: '0.9rem 1.1rem',
          background: 'var(--surface-high)',
          border: '1px solid var(--outline-variant)',
          borderRadius: '14px'
        }}>
          <ShieldCheck size={18} color="var(--primary)" />
          <div style={{ fontWeight: 900, color: 'var(--on-surface)' }}>
            Status: {effectiveStatus || 'pending'}
          </div>
        </div>

        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          You will gain access once an admin approves your account.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={logout} className="primary-gradient" style={{
            padding: '0.95rem 1.5rem',
            borderRadius: '12px',
            color: 'white',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 10px 25px -5px rgba(0, 55, 176, 0.3)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontFamily: 'inherit'
          }}>
            Log Out & Go to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;

