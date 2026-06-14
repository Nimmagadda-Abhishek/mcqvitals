import React from 'react';

const TermsOfService = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Terms of Service</h1>
      <div style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
          <p>By accessing and using Mcqvitals, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
        </section>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>2. User Accounts</h2>
          <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
        </section>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>3. Subscriptions and Payments</h2>
          <p>Certain parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring basis as per your selected plan.</p>
        </section>
        <section>
          <h2 style={{ color: 'var(--on-surface)', fontSize: '1.5rem', marginBottom: '1rem' }}>4. Modifications</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
