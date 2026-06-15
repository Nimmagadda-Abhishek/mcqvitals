import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Zap, Shield, BookOpen, BarChart3, Star, ArrowUpRight } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Promotional Banner */}
      <div style={{
        background: 'var(--accent)',
        color: '#0d2c4b',
        padding: '12px 20px',
        textAlign: 'center',
        fontWeight: '700',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <span>🎉 Special Offer: Register now for one month free subscription!</span>
        <Link to="/register" style={{
          background: '#0d2c4b',
          color: 'var(--accent)',
          padding: '4px 12px',
          borderRadius: '20px',
          textDecoration: 'none',
          fontSize: '0.85rem',
          fontWeight: 'bold'
        }}>
          Claim Now
        </Link>
      </div>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 5% 6rem',
        background: 'linear-gradient(135deg, var(--primary) 0%, #0d2c4b 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="hero-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 1.2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '30px',
              color: 'var(--accent)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '2.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={14} fill="var(--accent)" />
              McqVitals • Elevate Your Medical Learning.
            </div>
            <h1 style={{
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              color: 'white'
            }}>
              Unlock Your <br />
              <span style={{ color: 'var(--accent)' }}>Medical Potential</span>
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '3.5rem',
              maxWidth: '550px',
              lineHeight: 1.6
            }}>
              Elevate your medical test preparation with our comprehensive assessment platform. Experience timed modules and unlock premium practice tests today.
            </p>
            <div className="flex-wrap-responsive" style={{ justifyContent: 'inherit' }}>
              <Link to="/register" style={{
                padding: '1.2rem 2.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                color: 'var(--primary)',
                fontWeight: 800,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                boxShadow: '0 10px 30px -10px rgba(64, 224, 208, 0.5)',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}>
                Start Learning Now <ArrowRight size={22} />
              </Link>
            </div>
          </div>

          <div className="hero-image-wrapper">
            <div className="hero-image-backdrop"></div>
            <img 
              src="/medical_hero.png" 
              alt="Medical Student studying" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Features Section - Editorial Grid */}
      <section style={{ padding: '8rem 5%', background: 'var(--surface-lowest)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>A Comprehensive Assessment Ecosystem</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
              Designed for focused test preparation, providing detailed analytics and realistic proctored environments to help you succeed.
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
                title: 'Extensive Question Bank',
                desc: 'Access hundreds of practice tests and premium modules across various subjects instantly.',
                icon: <BookOpen size={32} />
              },
              {
                title: 'Proctored Environment',
                desc: 'A distraction-free, timed test interface that simulates real exam conditions.',
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem', flexWrap: 'wrap', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Invest in Your Intellect.</h2>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>Choose the tier that aligns with your academic goals.</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div className="card-tonal" style={{ padding: '4rem' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Free Tier</h3>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem' }}>Get started with basic features.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '4rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>₹0</span>
                <span style={{ color: 'var(--on-surface-variant)', marginBottom: '0.8rem' }}>/forever</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
                {['Access to basic tests', 'Limited performance tracking', 'Standard question bank'].map(item => (
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
                Get Started
              </Link>
            </div>

            <div className="card-tonal" style={{ padding: '4rem' }}>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Monthly Pro</h3>
              <p style={{ color: 'var(--on-surface-variant)', marginBottom: '3rem' }}>Perfect for standard test prep.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '4rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>₹299</span>
                <span style={{ color: 'var(--on-surface-variant)', marginBottom: '0.8rem' }}>/mo</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
                {['Access to all intermediate tests', 'Detailed performance analytics', 'Cancel anytime'].map(item => (
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
                Get Started
              </Link>
            </div>

            <div className="card-tonal" style={{ padding: '4rem', background: 'var(--on-surface)', color: 'white', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>MOST POPULAR</div>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Yearly Pro</h3>
              <p style={{ opacity: 0.7, marginBottom: '3rem' }}>Designed for serious candidates aiming for top percentiles.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginBottom: '4rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>₹1200</span>
                <span style={{ opacity: 0.7, marginBottom: '0.8rem' }}>/yr</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '4rem' }}>
                {['Unlimited Test Attempts', 'Advanced Analytics', 'Premium Assessments Access', 'Priority Support'].map(item => (
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
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
