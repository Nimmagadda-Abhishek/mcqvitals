import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  BookOpen, 
  ArrowRight, 
  Search, 
  Filter,
  Star,
  Lock,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import { CardShimmer } from '../components/common/Shimmer';
import { useAuth } from '../context/AuthContext';

const MAX_ATTEMPTS = 2;

const TestSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptMap, setAttemptMap] = useState({}); // testId -> count

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsData, myResults] = await Promise.all([
        api.tests.getAll(),
        api.results.getMyResults().catch(() => [])
      ]);
      setTests(testsData);

      // Build attempt count map: testId -> number of attempts
      const map = {};
      myResults.forEach(r => {
        const tid = r.testId?._id || r.testId;
        if (tid) map[tid] = (map[tid] || 0) + 1;
      });
      setAttemptMap(map);
    } catch (error) {
      console.error('Failed to fetch tests', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(tests.map(t => t.category))];

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || test.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: '4rem' }}>
        <div style={{ 
          fontSize: '0.85rem', 
          fontWeight: 700, 
          color: 'var(--primary)', 
          marginBottom: '0.5rem', 
          textTransform: 'uppercase' 
        }}>
          Assessment Catalogue
        </div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Available Test Modules</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.2rem', maxWidth: '750px', lineHeight: 1.5 }}>
          Select a proctored assessment module to begin your session. Each test allows a maximum of <strong>{MAX_ATTEMPTS} attempts</strong>.
        </p>
      </header>

      {/* Search and Filters */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '3.5rem',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
          <Search style={{ 
            position: 'absolute', 
            left: '1.2rem', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: 'var(--on-surface-variant)'
          }} size={20} />
          <input 
            type="text" 
            placeholder="Search assessments..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '1.2rem 1.2rem 1.2rem 3.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--outline-variant)',
              background: 'var(--surface-lowest)',
              fontSize: '1.1rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={18} style={{ color: 'var(--on-surface-variant)', marginRight: '0.5rem' }} />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: 700,
                background: activeCategory === cat ? 'var(--primary)' : 'var(--surface-low)',
                color: activeCategory === cat ? 'white' : 'var(--on-surface-variant)',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))', 
        gap: '2.5rem' 
      }}>
        {loading ? (
          <CardShimmer cards={6} />
        ) : filteredTests.map(test => {
          const attempts = attemptMap[test._id] || 0;
          const exhausted = attempts >= MAX_ATTEMPTS;

          const now = new Date();
          const expiryDate = user?.subscription?.expiryDate ? new Date(user.subscription.expiryDate) : null;
          const isExpired = expiryDate ? expiryDate < now : false;
          const hasActiveSub = user?.subscription?.status === 'active' && !isExpired;

          const isLocked = !test.isFree && !hasActiveSub;

          return (
                      <div
                        key={test._id}
                        className="premium-card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          opacity: exhausted || isLocked ? 0.78 : 1,
                          transition: 'opacity 0.2s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Exhausted overlay stripe */}
                        {exhausted && (
                          <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '4px',
                            background: 'var(--error)'
                          }} />
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                          <div style={{ 
                            width: '56px', 
                            height: '56px', 
                            borderRadius: '14px', 
                            background: exhausted || isLocked ? 'var(--error-container)' : 'var(--primary-container)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: exhausted || isLocked ? 'var(--error)' : 'var(--primary)'
                          }}>
                            {exhausted || isLocked ? <Lock size={26} /> : <ClipboardList size={28} />}
                          </div>

                          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                            {/* Attempt badge */}
                            <div style={{ 
                              background: exhausted ? 'var(--error-container)' : attempts === 1 ? 'rgba(234, 179, 8, 0.15)' : 'var(--surface-low)', 
                              color: exhausted ? 'var(--error)' : attempts === 1 ? '#b45309' : 'var(--on-surface-variant)',
                              padding: '0.4rem 0.9rem', 
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem'
                            }}>
                              <RotateCcw size={12} />
                              {attempts}/{MAX_ATTEMPTS} Attempts
                            </div>
                            {!test.isFree && (
                              <div style={{ 
                                background: 'var(--primary)', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: 'white',
                                textTransform: 'uppercase'
                              }}>
                                Premium
                              </div>
                            )}
                            <div style={{ 
                              background: 'var(--surface-low)', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '20px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: 'var(--primary)',
                              textTransform: 'uppercase'
                            }}>
                              {test.difficulty}
                            </div>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>{test.title}</h3>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--primary)', 
                          fontWeight: 700, 
                          marginBottom: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <BookOpen size={16} /> {test.category}
                        </div>

                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(3, 1fr)', 
                          gap: '1rem',
                          marginBottom: '2.5rem',
                          background: 'var(--surface-low)',
                          padding: '1.2rem',
                          borderRadius: 'var(--radius-md)'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.3rem' }}>Duration</div>
                            <div style={{ fontWeight: 800 }}>{test.duration}m</div>
                          </div>
                          <div style={{ textAlign: 'center', borderLeft: '1px solid var(--outline-variant)', borderRight: '1px solid var(--outline-variant)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.3rem' }}>Questions</div>
                            <div style={{ fontWeight: 800 }}>{test.questions?.length || 0}</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.3rem' }}>Max Marks</div>
                            <div style={{ fontWeight: 800 }}>{(test.questions?.length || 0) * 4}</div>
                          </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Star size={16} color="#eeb100" fill="#eeb100" /> {test.rating || 4.8} Rating
                          </div>

                          {isLocked ? (
                            <button 
                              onClick={() => navigate(`/pricing`)}
                              className="primary-gradient" 
                              style={{ 
                                padding: '1rem 2rem', 
                                borderRadius: 'var(--radius-md)', 
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8rem',
                                fontWeight: 800,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <Lock size={18} /> Unlock Premium
                            </button>
                          ) : exhausted ? (
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '1rem 1.5rem',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--error-container)',
                              color: 'var(--error)',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              cursor: 'not-allowed'
                            }}>
                              <Lock size={16} /> Limit Reached
                            </div>
                          ) : (
                            <button 
                              onClick={() => navigate(`/test/${test._id}`)}
                              className="primary-gradient" 
                              style={{ 
                                padding: '1rem 2rem', 
                                borderRadius: 'var(--radius-md)', 
                                color: 'white', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.8rem',
                                fontWeight: 800,
                                background: attempts === 1 ? 'linear-gradient(135deg, #d97706, #b45309)' : undefined,
                                border: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              {attempts === 1 ? 'Final Attempt' : 'Start Assessment'} <ArrowRight size={18} />
                            </button>
                          )}
                        </div>
                      </div>
          );
        })}
      </div>

      {filteredTests.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '6rem', background: 'var(--surface-low)', borderRadius: 'var(--radius-xl)' }}>
          <h2 style={{ marginBottom: '1rem' }}>No assessments found</h2>
          <p style={{ color: 'var(--on-surface-variant)' }}>Try a different category or search term.</p>
        </div>
      )}
    </div>
  );
};

export default TestSelection;
