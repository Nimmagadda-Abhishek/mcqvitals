import React from 'react';
import { useLocation } from 'react-router-dom';
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
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', letterSpacing: '-0.03em' }}>THE SCHOLARLY ATHENEUM</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', maxWidth: '300px' }}>
              We moved beyond the transactional to create a premium library-grade digital experience for focused intellect.
            </p>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--on-surface)' }}>Academic Module</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <li>Quantum Foundations</li>
              <li>Advanced Logic</li>
              <li>Calculus III Archive</li>
              <li>Thesis Methodology</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--on-surface)' }}>Research</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <li>Global Library</li>
              <li>Peer Review Network</li>
              <li>Publication Support</li>
              <li>Resource Sourcing</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--on-surface)' }}>The Collective</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>
              <li>Scholar Tier</li>
              <li>Fellow Membership</li>
              <li>Research Institutional</li>
              <li>Alumni Circle</li>
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
          <span>© 2026 The Scholarly Atheneum. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '2.5rem' }}>
            <a href="/">Privacy Policy</a>
            <a href="/">Terms of Service</a>
            <a href="/">Contact Us</a>
            <a href="/">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
