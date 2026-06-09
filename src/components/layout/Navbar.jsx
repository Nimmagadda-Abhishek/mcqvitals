import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Search, User, Menu, LogOut } from 'lucide-react';

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 5%',
      height: '72px',
      borderBottom: '1px solid var(--outline-variant)'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="primary-gradient" style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <BookOpen size={18} color="white" />
        </div>
        <span style={{ 
          fontFamily: 'var(--font-display)', 
          fontWeight: 800, 
          fontSize: '1rem',
          color: 'var(--primary)',
          letterSpacing: '-0.03em',
          textTransform: 'uppercase'
        }}>
          Mcqvitals
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="nav-links mobile-hide">
        {isLoggedIn && (
          <>
            <Link to="/dashboard" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Dashboard</Link>
            <a href="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Solutions</a>
          </>
        )}
        <a href="/" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--on-surface-variant)' }}>Pricing</a>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {!isLoggedIn ? (
          <>
            <Link to="/login" style={{ 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              color: 'var(--primary)',
              padding: '0.5rem 1rem' 
            }}>
              Log In
            </Link>
            <Link to="/register" className="primary-gradient" style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '30px',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0, 55, 176, 0.2)'
            }}>
              Get Started
            </Link>
          </>
        ) : (
          <button 
            onClick={logout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              fontSize: '0.95rem', 
              fontWeight: 600, 
              color: 'var(--error)',
              padding: '0.5rem 1rem' 
            }}
          >
            <LogOut size={18} /> Log Out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
