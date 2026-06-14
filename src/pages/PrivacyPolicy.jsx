import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Privacy Policy</h1>
      <div style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Introduction</h2>
          <p>Welcome to Mcqvitals. We respect your privacy and are committed to protecting your personal data.</p>
        </section>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>2. Data We Collect</h2>
          <p>We may collect personal identification information, including but not limited to your name, email address, and academic details when you register on our platform.</p>
        </section>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>3. How We Use Your Data</h2>
          <p>We use the collected data to provide, maintain, and improve our assessment platform, to process transactions, and to send periodic emails regarding your account or other products and services.</p>
        </section>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at support@mcqvitals.com.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
