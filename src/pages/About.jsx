import React from 'react';
import { Target, Users, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>About Mcqvitals</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--on-surface-variant)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          We are on a mission to empower students and professionals to achieve academic and career excellence through intelligent assessment and analytics.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'var(--surface-low)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Target size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>Our Vision</h3>
          <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>To be the global leader in adaptive learning and assessment, creating a level playing field for candidates preparing for high-stakes exams.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'var(--surface-low)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>Who We Are</h3>
          <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>A dedicated team of educators, technologists, and researchers committed to bridging the gap between preparation and success.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: 'var(--surface-low)', padding: '1.5rem', borderRadius: '50%', color: 'var(--primary)' }}>
            <BookOpen size={32} />
          </div>
          <h3 style={{ fontSize: '1.5rem' }}>What We Do</h3>
          <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>We provide comprehensive proctored environments, premium practice tests, and detailed cognitive analytics to ensure optimal readiness.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
