import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import Shimmer, { StatsShimmer, CardShimmer } from '../components/common/Shimmer';

const ResultsPage = () => {
  const [results, setResults] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsData = await api.results.getStats();
      setStats(statsData);
      if (statsData.attemptedTests) {
        setResults(statsData.attemptedTests);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '4rem' }}>
        <Shimmer width="400px" height="3.5rem" style={{ marginBottom: '1rem' }} />
        <Shimmer width="600px" height="1.2rem" />
      </header>

      <section style={{ marginBottom: '6rem' }}>
        <Shimmer width="250px" height="1rem" style={{ marginBottom: '2.5rem' }} />
        <StatsShimmer />
      </section>

      <section>
        <Shimmer width="200px" height="1rem" style={{ marginBottom: '2.5rem' }} />
        <CardShimmer cards={3} />
      </section>
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Performance <span className="text-gradient">Dashboard</span></h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>
          Aggregate metrics and historical assessment data for your learning journey.
        </p>
      </header>

      {/* Lifetime Performance Overview */}
      {stats && (
        <section style={{ marginBottom: '6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Lifetime Performance Overview
            </h2>
            <div style={{ height: '1px', flex: 1, background: 'var(--outline-variant)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--primary-container)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>TOTAL TESTS</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalTests}</div>
            </div>
            <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--primary-container)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>AVG MASTERY</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.masteryScore}</div>
            </div>
            <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--primary-container)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>GLOBAL ACCURACY</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.accuracyRate}%</div>
            </div>
            <div className="card-tonal" style={{ padding: '2rem', textAlign: 'center', border: '1px solid var(--primary-container)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>CONFIDENCE INDEX</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.confidenceIndex}</div>
            </div>
          </div>
        </section>
      )}

      {/* Assessment History Grid */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Assessment History
          </h2>
          <div style={{ height: '1px', flex: 1, background: 'var(--outline-variant)' }}></div>
        </div>

        {results.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {results.map((res) => (
              <Link
                key={res.resultId}
                to={`/analysis/${res.resultId}`}
                className="card-tonal"
                style={{
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid transparent',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ 
                    padding: '0.4rem 0.8rem', 
                    background: res.status === 'malpractice' ? 'var(--error-container)' : 'var(--primary-container)', 
                    color: res.status === 'malpractice' ? 'var(--error)' : 'var(--primary)', 
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {res.category}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                    {new Date(res.date).toLocaleDateString()}
                  </div>
                </div>
                {res.status === 'malpractice' && res.malpracticeReason && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--error)', 
                    fontWeight: 600,
                    background: 'var(--error-container)',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    borderLeft: '3px solid var(--error)'
                  }}>
                    Violation: {res.malpracticeReason}
                  </div>
                )}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 700 }}>{res.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: res.status === 'malpractice' ? 'var(--error)' : 'var(--primary)' }}>
                    <Zap size={16} fill={res.status === 'malpractice' ? 'var(--error)' : 'var(--primary)'} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>{res.score}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 900, 
                      padding: '0.1rem 0.6rem', 
                      borderRadius: '8px', 
                      background: res.status === 'malpractice' ? 'var(--error-container)' : 'var(--success-container)',
                      color: res.status === 'malpractice' ? 'var(--error)' : 'var(--success)',
                      textTransform: 'uppercase',
                      marginLeft: '0.5rem'
                    }}>
                      {res.status || 'completed'}
                    </span>
                  </div>
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  fontSize: '0.85rem', 
                  fontWeight: 700, 
                  color: 'var(--primary)' 
                }}>
                  Review Full Analysis <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-tonal padding-responsive" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>No assessments completed yet.</p>
            <Link to="/test" className="primary-gradient" style={{ display: 'inline-block', padding: '0.8rem 2rem', borderRadius: '8px', color: 'white', fontWeight: 700, textDecoration: 'none' }}>
              Launch Your First Module
            </Link>
          </div>
        )}
      </section>

      <div style={{ marginTop: '5rem', textAlign: 'center' }}>
        <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 600 }}>
          <ChevronLeft size={18} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ResultsPage;
