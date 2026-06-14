import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Info, 
  Clock, 
  Target,
  ArrowLeft,
  Search,
  BookOpen,
  ArrowRight,
  Zap
} from 'lucide-react';
import api from '../services/api';
import Shimmer, { StatsShimmer, CardShimmer } from '../components/common/Shimmer';

const SolutionsReview = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (resultId && resultId !== 'undefined') {
          const data = await api.results.getById(resultId);
          setResult(data);
        } else {
          const statsData = await api.results.getStats();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [resultId]);

  if (loading) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Shimmer width="44px" height="44px" borderRadius="12px" />
        <div style={{ flex: 1 }}>
          <Shimmer width="300px" height="2.5rem" style={{ marginBottom: '0.5rem' }} />
          <Shimmer width="200px" height="1rem" />
        </div>
      </header>
      {resultId ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '3rem' }}>
          <div className="premium-card" style={{ height: '600px' }}>
            <Shimmer width="100px" height="1.5rem" style={{ marginBottom: '2rem' }} />
            <Shimmer width="100%" height="200px" borderRadius="16px" style={{ marginBottom: '2rem' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[...Array(3)].map((_, i) => <Shimmer key={i} width="100%" height="60px" borderRadius="16px" />)}
            </div>
          </div>
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card-tonal" style={{ height: '300px' }}>
              <Shimmer width="150px" height="1.5rem" style={{ marginBottom: '1.5rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem' }}>
                {[...Array(15)].map((_, i) => <Shimmer key={i} width="100%" height="40px" borderRadius="10px" />)}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          <CardShimmer cards={6} />
        </div>
      )}
    </div>
  );

  // LIST VIEW: Show all attempted tests
  if (!resultId) {
    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
        <header style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="primary-gradient" style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <BookOpen size={24} />
            </div>
            <h1 style={{ fontSize: '3rem' }}>Solutions <span className="text-gradient">Archive</span></h1>
          </div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem', maxWidth: '700px' }}>
            Access detailed academic breakdowns and conceptual rationales for all your previous assessment attempts.
          </p>
        </header>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Completed Assessments
            </h2>
            <div style={{ height: '1px', flex: 1, background: 'var(--outline-variant)' }}></div>
          </div>

          {stats?.attemptedTests?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '2rem' }}>
              {stats.attemptedTests.map((test) => (
                <Link 
                  key={test.resultId} 
                  to={`/solutions-review/${test.resultId}`}
                  className="card-tonal hover-up"
                  style={{ 
                    padding: '2rem', 
                    textDecoration: 'none', 
                    color: 'inherit',
                    border: '1px solid var(--outline-variant)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '0.4rem 0.8rem', 
                      background: test.status === 'malpractice' ? 'var(--error-container)' : 'var(--primary-container)', 
                      color: test.status === 'malpractice' ? 'var(--error)' : 'var(--primary)', 
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {test.category || 'General'}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                      {new Date(test.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>{test.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Zap size={18} fill="var(--primary)" color="var(--primary)" />
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>{test.score}</span>
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', marginLeft: '0.5rem' }}>Marks</span>

                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                    Access Solution Review <ArrowRight size={18} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="section-tonal padding-responsive" style={{ textAlign: 'center', borderRadius: '32px' }}>
              <div style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem' }}>No session data found.</div>
              <Link to="/test" className="primary-gradient" style={{ display: 'inline-block', padding: '1rem 2.5rem', borderRadius: '12px', color: 'white', fontWeight: 800, textDecoration: 'none' }}>
                Take Your First Test
              </Link>
            </div>
          )}
        </section>
      </div>
    );
  }

  // DETAIL VIEW: Show specific result analysis
  if (!result) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '10rem 2rem', textAlign: 'center' }}>
      <div className="card-tonal" style={{ padding: '4rem', borderRadius: '24px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Analysis Not Found</h2>
        <p style={{ color: 'var(--on-surface-variant)', marginBottom: '2rem' }}>We couldn't retrieve the session data for this review.</p>
        <button onClick={() => navigate('/solutions-review')} className="primary-gradient" style={{ padding: '1rem 2.5rem', borderRadius: '12px', color: 'white', fontWeight: 800 }}>
          Back to Archives
        </button>
      </div>
    </div>
  );

  const currentAnswer = result?.answers?.[currentIdx];
  const question = currentAnswer?.questionId;
  const userChoice = currentAnswer?.selectedOption;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button onClick={() => navigate('/solutions-review')} className="card-tonal" style={{ padding: '0.8rem', borderRadius: '12px', cursor: 'pointer' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>Solutions Review</h1>
          <p style={{ color: 'var(--on-surface-variant)' }}>{result?.testId?.title} • Detailed Academic Breakdown</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: '3rem' }}>
        <main>
          {question ? (
            <div className="premium-card">
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div className="badge-tonal" style={{ background: 'var(--primary-container)', color: 'var(--primary)', fontWeight: 800 }}>
                  Question {currentIdx + 1}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--on-surface-variant)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} /> {currentAnswer?.timeSpent}s
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: currentAnswer?.isCorrect ? 'var(--success)' : 'var(--error)' }}>
                    <Target size={16} /> {currentAnswer?.isCorrect ? 'Mastered' : 'Needs Review'}
                  </div>
                </div>
              </header>

              <div style={{ marginBottom: '3rem' }}>
                <div style={{ padding: '2rem', background: 'var(--surface-low)', borderRadius: '16px', marginBottom: '2.5rem' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.6, color: 'var(--on-surface)' }}>{question.text}</p>
                  
                  {question.images && question.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
                      {question.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Question" style={{ maxWidth: '100%', borderRadius: '12px', border: '1px solid var(--outline-variant)' }} />
                      ))}
                    </div>
                  )}

                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {question.options.map((option, idx) => {
                    const isCorrect = idx === question.correctAnswer;
                    const isUserChoice = idx === userChoice;
                    
                    let borderColor = 'var(--outline-variant)';
                    let background = 'var(--surface)';
                    
                    if (isCorrect) {
                      borderColor = 'var(--success)';
                      background = 'var(--success-container)';
                    } else if (isUserChoice && !isCorrect) {
                      borderColor = 'var(--error)';
                      background = 'rgba(186, 26, 26, 0.05)';
                    }

                    return (
                      <div 
                        key={idx}
                        className="card-tonal"
                        style={{
                          padding: '1.5rem 2rem',
                          display: 'flex',
                          gap: '1.5rem',
                          alignItems: 'center',
                          border: `2px solid ${borderColor}`,
                          background: background,
                          borderRadius: '16px',
                          position: 'relative',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isCorrect ? 'var(--success)' : (isUserChoice ? 'var(--error)' : 'var(--surface-high)'),
                          color: isCorrect || isUserChoice ? 'white' : 'var(--on-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          flexShrink: 0
                        }}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--on-surface)', marginBottom: (option.images && option.images.length > 0) ? '1rem' : 0 }}>
                            {option.text}
                          </div>
                          
                          {option.images && option.images.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                              {option.images.map((img, i) => (
                                <img key={i} src={img} alt="Option" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', background: 'white', padding: '4px' }} />
                              ))}
                            </div>
                          )}

                        </div>
                        {isCorrect && <CheckCircle2 size={22} color="var(--success)" />}
                        {isUserChoice && !isCorrect && <X size={22} color="var(--error)" />}
                      </div>
                    );
                  })}
                </div>

                {/* Academic Rationale */}
                <div style={{ marginTop: '3.5rem', padding: '2.5rem', background: 'var(--surface-low)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', marginBottom: '1.2rem' }}>
                    <Info size={20} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Academic Rationale</span>
                  </div>
                  <p style={{ color: 'var(--on-surface-variant)', fontSize: '1rem', lineHeight: '1.8', marginBottom: (question.explanation?.images?.length > 0 ? '2rem' : 0) }}>
                    {question.explanation?.text || ''}
                  </p>
                  
                  {question.explanation?.images && question.explanation.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                      {question.explanation.images.map((img, idx) => (
                        <img key={idx} src={img} alt="Explanation" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--outline-variant)' }} />
                      ))}
                    </div>
                  )}

                </div>
              </div>

              <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2rem', borderTop: '1px solid var(--outline-variant)', flexWrap: 'wrap', gap: '1rem' }}>
                <button 
                  onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 700, opacity: currentIdx === 0 ? 0.3 : 1, cursor: 'pointer' }}
                >
                  <ChevronLeft size={24} /> Previous Concept
                </button>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--on-surface-variant)' }}>{currentIdx + 1} / {result?.answers?.length || 0}</div>
                <button 
                  onClick={() => setCurrentIdx(prev => Math.min((result?.answers?.length || 1) - 1, prev + 1))}
                  disabled={currentIdx === (result?.answers?.length || 1) - 1}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 700, color: 'var(--primary)', opacity: currentIdx === (result?.answers?.length || 1) - 1 ? 0.3 : 1, cursor: 'pointer' }}
                >
                  Next Insight <ChevronRight size={24} />
                </button>
              </footer>
            </div>
          ) : (
            <div className="card-tonal" style={{ padding: '5rem', textAlign: 'center' }}>No concept analysis available.</div>
          )}
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card-tonal" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', fontWeight: 800 }}>Review Navigator</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.8rem' }}>
              {result?.answers?.map((ans, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentIdx(idx)}
                  style={{ 
                    aspectRatio: '1', 
                    borderRadius: '10px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 900,
                    background: currentIdx === idx ? 'var(--primary)' : (ans.isCorrect ? 'var(--success-container)' : 'rgba(186, 26, 26, 0.1)'),
                    color: currentIdx === idx ? 'white' : (ans.isCorrect ? 'var(--success)' : 'var(--error)'),
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
          
          <div className="premium-card" style={{ background: 'var(--primary)', color: 'white' }}>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Concept Mastery</h4>
            <p style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '1.5rem' }}>Your performance indicates strong foundations in this module.</p>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{result?.score || 0} / {(result?.answers?.length || 1) * 4}</div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SolutionsReview;
