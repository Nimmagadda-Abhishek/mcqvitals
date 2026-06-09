import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Brain, Target, Zap, ChevronLeft, Clock } from 'lucide-react';
import api from '../services/api';
import Shimmer from '../components/common/Shimmer';

const SessionAnalysis = () => {
  const { resultId } = useParams();
  const [selectedResult, setSelectedResult] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchResultDetails();
  }, [resultId]);

  const fetchResultDetails = async () => {
    try {
      setLoading(true);
      const details = await api.results.getById(resultId);
      setSelectedResult(details);
    } catch (error) {
      console.error('Failed to fetch details', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}' ${secs}"`;
  };

  if (loading) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <Shimmer width="150px" height="1.5rem" borderRadius="20px" />
          <Shimmer width="200px" height="1.5rem" borderRadius="20px" />
        </div>
        <Shimmer width="600px" height="3rem" style={{ marginBottom: '1rem' }} />
        <Shimmer width="400px" height="1.2rem" />
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <Shimmer width="100%" height="250px" borderRadius="16px" />
        <Shimmer width="100%" height="200px" borderRadius="16px" />
        <Shimmer width="100%" height="200px" borderRadius="16px" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2.5rem' }}>
        <Shimmer width="100%" height="300px" borderRadius="16px" />
        <Shimmer width="100%" height="300px" borderRadius="50%" style={{ maxWidth: '300px', margin: '0 auto' }} />
      </div>
    </div>
  );
  if (!selectedResult) return <div style={{ textAlign: 'center', padding: '10rem' }}>Session data not found.</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* HUD Header */}
      <header style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ 
            background: selectedResult.status === 'malpractice' ? 'var(--error-container)' : 'var(--primary-container)', 
            color: selectedResult.status === 'malpractice' ? 'var(--error)' : 'var(--primary)', 
            padding: '0.4rem 1rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: 700 
          }}>
            PERFORMANCE ID: {selectedResult._id?.slice(-8).toUpperCase()}
          </span>
          <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>
            {selectedResult.testId?.title} • {new Date(selectedResult.createdAt).toLocaleString()}
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '1rem' }}>Session Analysis: <span className="text-gradient">Performance Summary</span></h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', maxWidth: '700px' }}>
          Detailed breakdown of your methodology and competency for the {selectedResult.testId?.category} module.
        </p>

        {selectedResult.status === 'malpractice' && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '1.5rem 2rem', 
            background: 'var(--error-container)', 
            border: '1px solid var(--error)',
            borderRadius: '12px',
            color: 'var(--error)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.6rem' }}>
              <Zap size={24} fill="var(--error)" />
              <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '0.05em' }}>SECURITY VIOLATION DETECTED</span>
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
              Terminated for: {selectedResult.malpracticeReason || 'Proctoring breach detected.'}
            </p>
          </div>
        )}
      </header>

      {/* Primary Metrics Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="section-tonal" style={{ 
          padding: '3rem', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          position: 'relative',
          border: selectedResult.status === 'malpractice' ? '1px solid var(--error)' : 'none'
        }}>
          <div style={{ fontSize: '0.9rem', color: selectedResult.status === 'malpractice' ? 'var(--error)' : 'var(--primary)', fontWeight: 800, marginBottom: '0.5rem' }}>MASTERY SCORE</div>
          <div style={{ fontSize: '5rem', fontWeight: 800, lineHeight: 1, color: selectedResult.status === 'malpractice' ? 'var(--error)' : 'inherit' }}>
            {selectedResult.score} <span style={{ fontSize: '2rem', color: 'var(--on-surface-variant)' }}>/ {selectedResult.totalQuestions * 4}</span>
          </div>
          <div style={{ marginTop: '2rem', fontSize: '1rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>
            {selectedResult.status === 'malpractice' ? (
              <span style={{ color: 'var(--error)', fontWeight: 800 }}>Session Nullified due to malpractice.</span>
            ) : (
              <>You answered <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{selectedResult.sessionSummary?.correctAnswers || 0}</span> questions correctly.</>
            )}
          </div>
          <Zap size={100} style={{ position: 'absolute', right: '2rem', bottom: '2rem', color: selectedResult.status === 'malpractice' ? 'var(--error)' : 'var(--primary)', opacity: 0.05 }} />
        </div>

        <div className="card-tonal" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--surface-high)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Target size={22} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{selectedResult.sessionSummary?.accuracyRate || 0}%</div>
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 600 }}>ACCURACY RATE</div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>Total warnings: {selectedResult.warnings || 0}</div>
        </div>

        <div className="card-tonal" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--surface-high)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Brain size={22} />
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{selectedResult.sessionSummary?.confidenceIndex || 0}</div>
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 600 }}>CONFIDENCE INDEX</div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Stable across session duration</div>
        </div>
      </section>

      {/* Breakout Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
        <div className="card-tonal">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>Session Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { label: 'Correct Answers', count: selectedResult.sessionSummary?.correctAnswers || 0, color: 'var(--success)' },
              { label: 'Incorrect Answers', count: selectedResult.sessionSummary?.incorrectAnswers || 0, color: 'var(--error)' },
              { label: 'Skipped', count: selectedResult.sessionSummary?.skippedAnswers || 0, color: 'var(--on-surface-variant)' }
            ].map(item => {
              const total = (selectedResult.sessionSummary?.correctAnswers || 0) + 
                            (selectedResult.sessionSummary?.incorrectAnswers || 0) + 
                            (selectedResult.sessionSummary?.skippedAnswers || 0);
              return (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-high)', borderRadius: '3px' }}>
                    <div style={{ 
                      width: `${total > 0 ? (item.count / total) * 100 : 0}%`, 
                      height: '100%', 
                      background: item.color, 
                      borderRadius: '3px' 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-tonal" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            border: '8px solid var(--primary-container)', 
            borderTopColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 800,
            marginBottom: '2rem'
          }}>
            {formatSeconds(selectedResult.sessionSummary?.timeOnTask || 0)}
          </div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Time on Task</h3>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', maxWidth: '280px' }}>
            Total session duration recorded for this assessment attempt.
          </p>
        </div>
      </div>

      {/* Recommendations & Action */}
      <div className="section-tonal" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--primary-container)', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Ready for a Deep-Dive?</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Review the detailed methodologies and instructor feedback for this attempt.</p>
        </div>
        {selectedResult?._id && (
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link to={`/solutions-review/${selectedResult._id}`} className="primary-gradient" style={{ 
              padding: '1rem 2rem', 
              borderRadius: 'var(--radius-md)', 
              color: 'white', 
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              boxShadow: '0 12px 24px rgba(0, 55, 176, 0.2)',
              textDecoration: 'none'
            }}>
              View Methodology Review <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid var(--outline-variant)', paddingTop: '2rem' }}>
        <Link to="/results" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--on-surface-variant)', textDecoration: 'none', fontWeight: 600 }}>
          <ChevronLeft size={18} /> Back to Performance Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SessionAnalysis;
