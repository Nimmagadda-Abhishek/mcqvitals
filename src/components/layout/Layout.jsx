import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Internal pages that show the Sidebar
  const isInternalPage = isLoggedIn && location.pathname !== '/';

  if (isInternalPage) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="main-workspace" style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ marginTop: '72px', flex: 1 }}>
        {children}
      </main>
      <footer style={{
        padding: '5rem 5% 3rem',
        background: 'var(--surface-low)',
        marginTop: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '4rem',
          maxWidth: '1400px',
          margin: '0 auto',
          paddingBottom: '4rem'
        }}>
          <div>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.03em' }}>MCQVITALS</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', maxWidth: '300px' }}>
              Elevate your test preparation with our comprehensive assessment platform designed for serious candidates.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--on-surface)' }}>Assessments</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <li>Mock Tests</li>
              <li>Subject Wise Tests</li>
              <li>Previous Year Papers</li>
              <li>Advanced Modules</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--on-surface)' }}>Resources</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <li>Question Bank</li>
              <li>Performance Analytics</li>
              <li>Detailed Solutions</li>
              <li>Study Materials</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--on-surface)' }}>Plans</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <li>Free Tier</li>
              <li>Monthly Pro</li>
              <li>Yearly Pro</li>
            </ul>
          </div>
        </div>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          paddingTop: '2.5rem',
          borderTop: '1px solid var(--outline-variant)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          color: 'var(--on-surface-variant)'
        }}>
          <span>© 2026 Mcqvitals. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <Link to="/privacy-policy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/terms-of-service" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
            <Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
