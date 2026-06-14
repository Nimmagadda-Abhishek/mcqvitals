import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, ArrowRight, BookOpen, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();

  React.useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
  }, [isLoggedIn, navigate]);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [deviceMismatch, setDeviceMismatch] = React.useState(false);
  const [requestStatus, setRequestStatus] = React.useState('');
  const [isRequesting, setIsRequesting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setDeviceMismatch(false);
    setRequestStatus('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      if (result.errorData && result.errorData.deviceMismatch) {
        setDeviceMismatch(true);
      }
    }
  };

  const handleDeviceChangeRequest = async () => {
    try {
      setIsRequesting(true);
      const res = await api.auth.requestDeviceChange({ email });
      setRequestStatus(res.message || 'Request submitted successfully.');
      setError('');
      setDeviceMismatch(false);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setIsRequesting(false);
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
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
            Enter your credentials to access your workspace.
          </p>
        </div>

        <div style={{
          backgroundColor: '#fffbe6',
          border: '1px solid #ffe58f',
          padding: '0.8rem',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#d48806',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-start'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span><strong>Note:</strong> You are allowed to use only ONE device for this platform. Once you log in, this device will be permanently bound to your account.</span>
        </div>

        {requestStatus && <div style={{ color: '#389e0d', backgroundColor: '#f6ffed', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #b7eb8f' }}>{requestStatus}</div>}
        
        {error && (
          <div style={{ color: 'var(--error)', backgroundColor: '#fff1f0', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #ffa39e' }}>
            {error}
            {deviceMismatch && (
              <div style={{ marginTop: '0.8rem' }}>
                <button 
                  onClick={handleDeviceChangeRequest}
                  disabled={isRequesting}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #ffa39e',
                    background: 'white',
                    color: 'var(--error)',
                    fontWeight: 600,
                    cursor: isRequesting ? 'not-allowed' : 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {isRequesting ? 'Requesting...' : 'Request Device Change from Admin'}
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
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
                outline: 'none'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem 3rem 1rem 3rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'var(--surface-low)',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-variant)', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</Link>
          </div>


          <button className="primary-gradient" type="submit" style={{
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
            boxShadow: '0 10px 25px -5px rgba(0, 55, 176, 0.3)'
          }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--outline-variant)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>Join McqVitals</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
