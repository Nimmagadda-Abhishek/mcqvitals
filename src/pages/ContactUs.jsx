import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';

const ContactUs = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Contact Us</h1>
      <p style={{ color: 'var(--on-surface-variant)', textAlign: 'center', marginBottom: '3rem', fontSize: '1.1rem' }}>
        We're here to help and answer any questions you might have. We look forward to hearing from you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
        <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-container)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Mail size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Email Us</h3>
          <p style={{ color: 'var(--on-surface-variant)' }}>support@mcqvitals.com</p>
        </div>

        <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-container)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Phone size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Call Us</h3>
          <p style={{ color: 'var(--on-surface-variant)' }}>+91 98765 43210</p>
        </div>

        <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary-container)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <MapPin size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem' }}>Visit Us</h3>
          <p style={{ color: 'var(--on-surface-variant)' }}>123 Tech Park, Innovation Hub<br/>City, State 123456</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
