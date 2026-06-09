import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield, BookOpen, BarChart3, Star, ArrowUpRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section style={{
        padding: '8rem 5% 6rem',
        background: 'radial-gradient(circle at 100% 0%, var(--primary-container) 0%, var(--surface) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 1.2rem',
              background: 'white',
              borderRadius: '30px',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '2.5rem',
              boxShadow: '0 4px 12px rgba(0, 55, 176, 0.05)'
            }}>
              <Zap size={14} fill="var(--primary)" />
              Mcqvitals • THE SCHOLARLY ATHENEUM
            </div>
            <h1 style={{
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              lineHeight: 1.05,
              marginBottom: '2rem',
              color: 'var(--on-surface)'
            }}>
              Practice Smarter. <span className="text-gradient">Score Higher.</span>
            </h1>
            <p style={{
              fontSize: '1.4rem',
              color: 'var(--on-surface-variant)',
              marginBottom: '3.5rem',
              maxWidth: '600px',
              lineHeight: 1.5
            }}>
              We moved beyond the transactional to create a premium library-grade digital experience for focused intellect. Experience adaptive learning modules that predict your performance.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/register" className="primary-gradient" style={{
                padding: '1.4rem 3rem',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontWeight: 750,
                fontSize: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                boxShadow: '0 20px 40px -10px rgba(0, 55, 176, 0.3)',
                textDecoration: 'none'
              }}>
                Start Your Journey <ArrowRight size={22} />
              </Link>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <div className="section-tonal" style={{
              padding: '2.5rem',
              aspectRatio: '1',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Current Velocity</div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800 }}>84.2 <span style={{ fontSize: '1.5rem', color: 'var(--on-surface-variant)' }}>XP/day</span></div>
              </div>
              <p style={{ fontSize: '1.1rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                You're 12% closer to your Goal Score today. Peak performance detected in Quantitative Reasoning.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '3rem' }}>
                <div className="card-tonal" style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.3rem' }}>92%</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Accuracy</div>
                </div>
                <div className="card-tonal" style={{ padding: '1.2rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.3rem' }}>+128</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Rank Shift</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Editorial Grid */}
      <section style={{ padding: '8rem 5%', background: 'var(--surface-lowest)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>A Premium Academic Ecosystem</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
              Designed for the rigors of graduate-level study, focusing on the cognitive patterns that lead to mastery.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem' }}>
            {[
              {
                title: 'Advanced Analytics Engine',
                desc: 'Our proprietary algorithm tracks your cognitive patterns to predict areas of struggle before they happen.',
                icon: <BarChart3 size={32} />
              },
              {
                title: 'Global Library',
                desc: 'Access all peer-reviewed papers and resources instantly through our integrated research portal.',
                icon: <BookOpen size={32} />
              },
              {
                title: 'Focused Workspace',
                desc: 'A distraction-free environment that maximizes flow-state and cognitive retention during high-stakes prep.',
                icon: <Shield size={32} />
              }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ color: 'var(--primary)' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>{f.desc}</p>
                <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  Learn More <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - The Tiers */}
      <section style={{ padding: '8rem 5%', background: 'var(--surface-low)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem' }}>
            <div>
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Invest in Your Intellect.</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Choose the tier that aligns with your academic goals.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
            <div className="card-tonal" style={{ padding: '4rem' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Scholar</h3>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem' }}>Perfect for undergraduates and exam prep.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '4rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>₹299</span>
                <span style={{ color: 'var(--on-surface-variant)', marginBottom: '0.8rem' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
                {['Unlimited Practice Tests', 'Basic Performance Tracking', 'Standard Library Access'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 500 }}>
                    <CheckCircle size={20} color="var(--success)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{
                display: 'block',
                textAlign: 'center',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--outline-variant)',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'var(--on-surface)'
              }}>
                Choose Scholar
              </Link>
            </div>

            <div className="card-tonal" style={{ padding: '4rem', background: 'var(--on-surface)', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Fellow</h3>
              <p style={{ opacity: 0.7, marginBottom: '3rem' }}>Designed for PhD candidates and Professional Educators.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '4rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>₹1299</span>
                <span style={{ opacity: 0.7, marginBottom: '0.8rem' }}>/yr</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
                {['AI-Driven Essay Analysis', 'Predictive Performance HUD', 'Priority Resource Sourcing', 'Offline Workspace Mode'].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 500 }}>
                    <CheckCircle size={20} color="var(--primary)" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="primary-gradient" style={{
                display: 'block',
                textAlign: 'center',
                padding: '1.2rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                color: 'white',
                textDecoration: 'none'
              }}>
                Become a Fellow
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
