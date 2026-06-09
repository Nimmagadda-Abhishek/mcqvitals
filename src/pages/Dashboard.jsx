import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  Award, 
  ArrowRight, 
  BookOpen, 
  Calendar, 
  Star,
  CheckCircle,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Shimmer, { StatsShimmer, CardShimmer } from '../components/common/Shimmer';

const Dashboard = () => {
  const { user, getProfile } = useAuth();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 992);
  const [recentResults, setRecentResults] = React.useState([]);
  const [statsData, setStatsData] = React.useState(null);
  const [recommendedTests, setRecommendedTests] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    loadDashboardData();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [results, stats, allTests] = await Promise.all([
        api.results.getMyResults(),
        api.results.getStats(),
        api.tests.getAll()
      ]);
      
      setRecentResults(results.slice(0, 3));
      setStatsData(stats);
      setRecommendedTests(allTests.slice(0, 3));
    } catch (error) {
      console.error('Dashboard data sync failed', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    { label: 'Total Attempts', value: statsData?.totalTests || 0, icon: <TrendingUp size={20} />, trend: 'Lifetime volume' },
    { label: 'Avg. Mastery', value: `${statsData?.masteryScore || 0}`, icon: <Award size={20} />, trend: 'Proficiency level' },
    { label: 'Learning Time', value: `${Math.round((statsData?.totalTime || 0) / 60)}m`, icon: <Clock size={20} />, trend: 'Total engagement' }
  ];

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (loading) return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '1rem' : '0 0 5rem 0' }}>
      <header style={{ marginBottom: isMobile ? '2rem' : '3.5rem' }}>
        <Shimmer width="150px" height="1rem" style={{ marginBottom: '1rem' }} />
        <Shimmer width="400px" height="3.5rem" style={{ marginBottom: '1rem' }} />
        <Shimmer width="600px" height="1.2rem" />
      </header>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', 
        gap: isMobile ? '2.5rem' : '3.5rem' 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
          <StatsShimmer />
          <section>
            <Shimmer width="200px" height="2rem" style={{ marginBottom: '2rem' }} />
            <CardShimmer cards={3} />
          </section>
        </div>
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <Shimmer width="100%" height="250px" borderRadius="var(--radius-xl)" />
          <Shimmer width="100%" height="150px" borderRadius="var(--radius-md)" />
        </aside>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '1rem' : '0 0 5rem 0' }}>
      {/* Dashboard Header */}
      <header style={{ 
        marginBottom: isMobile ? '2rem' : '3.5rem', 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        gap: isMobile ? '1rem' : '2rem'
      }}>
        <div style={{ flex: '1', minWidth: isMobile ? '100%' : '300px' }}>
          <div style={{ 
            fontSize: '0.85rem', 
            fontWeight: 800, 
            color: 'var(--primary)', 
            marginBottom: '0.6rem', 
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Scholar Workspace
          </div>
          <h1 style={{ fontSize: isMobile ? '2.2rem' : '3rem', marginBottom: '0.5rem' }}>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: isMobile ? '1rem' : '1.1rem' }}>
            {recentResults.length > 0 
              ? `You've completed ${statsData?.totalTests} assessments. Keep pushing your boundaries.` 
              : "Welcome to the platform! Launch your first module to begin your performance journey."}
          </p>
        </div>
        <div className="card-tonal" style={{ 
          padding: '0.8rem 1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.8rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          border: '1px solid var(--primary-container)',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start'
        }}>
          <Calendar size={18} color="var(--primary)" /> {today}
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', 
        gap: isMobile ? '2.5rem' : '3.5rem' 
      }}>
        {/* Main Workspace Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '2.5rem' : '4rem' }}>
          
          {/* Stats Overview */}
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            {dashboardStats.map((stat, i) => (
              <div key={i} className="card-tonal" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', border: '1px solid transparent' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'var(--surface-high)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)' 
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 800, color: 'var(--on-surface)' }}>{stat.value}</div>
                  <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem', fontWeight: 600 }}>{stat.label}</div>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', opacity: 0.8 }}>
                  {stat.trend}
                </div>
              </div>
            ))}
          </section>

          {/* Recommended Modules */}
          <section>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '1rem' }}>
              <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem' }}>Recommended Modules</h2>
              <Link to="/test" style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', textDecoration: 'none' }}>View Full Catalog</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
              {recommendedTests.map((test) => (
                <div key={test._id} className="card-tonal" style={{ position: 'relative', border: '1px solid var(--outline-variant)' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '10px', 
                    background: 'var(--primary-container)', 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{test.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase' }}>
                    {test.category} • {test.duration} MINS
                  </div>
                  <Link to={`/test/${test._id}`} style={{ 
                    marginTop: '2rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    color: 'var(--primary)', 
                    fontWeight: 800, 
                    fontSize: '0.9rem',
                    textDecoration: 'none'
                  }}>
                    Launch Assessment <ArrowRight size={18} />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section>
            <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', marginBottom: '2rem' }}>Recent Performance</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {recentResults.length > 0 ? recentResults.map((result, i) => (
                <div key={i} className="card-tonal" style={{ 
                  display: 'flex', 
                  gap: isMobile ? '1rem' : '1.5rem', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  border: '1px solid transparent',
                  padding: isMobile ? '1rem' : '1.5rem'
                }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    background: 'var(--success-container)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--success)'
                  }}>
                    <CheckCircle size={22} />
                  </div>
                  <div style={{ flex: 1, minWidth: isMobile ? '100%' : '250px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{result.testId?.title}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 800, color: result.status === 'malpractice' ? 'var(--error)' : 'var(--primary)', fontSize: '1.1rem' }}>
                          {result.score}
                        </span>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 900, 
                          padding: '0.2rem 0.6rem', 
                          borderRadius: '10px', 
                          background: result.status === 'malpractice' ? 'var(--error-container)' : 'var(--success-container)',
                          color: result.status === 'malpractice' ? 'var(--error)' : 'var(--success)',
                          textTransform: 'uppercase'
                        }}>
                          {result.status}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                      Attempted on {new Date(result.createdAt).toLocaleDateString()} • {result.testId?.category}
                    </div>
                    {result.status === 'malpractice' && result.malpracticeReason && (
                      <div style={{ 
                        marginTop: '0.4rem', 
                        fontSize: '0.75rem', 
                        color: 'var(--error)', 
                        fontStyle: 'italic',
                        fontWeight: 600 
                      }}>
                        Reason: {result.malpracticeReason}
                      </div>
                    )}
                  </div>
                  <Link to={`/analysis/${result._id}`} style={{ 
                    color: 'var(--primary)', 
                    background: 'var(--primary-container)', 
                    padding: '0.6rem 1rem', 
                    borderRadius: '8px', 
                    textDecoration: 'none', 
                    fontSize: '0.8rem', 
                    fontWeight: 800,
                    width: isMobile ? '100%' : 'auto',
                    textAlign: 'center'
                  }}>
                    View Analysis
                  </Link>
                </div>
              )) : (
                <div className="section-tonal" style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--outline-variant)' }}>
                  <p style={{ color: 'var(--on-surface-variant)', fontWeight: 600 }}>No assessment history discovered yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Profile & Secondary Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Profile Card */}
          <div className="section-tonal" style={{ padding: '2.5rem', textAlign: 'center', border: '1px solid var(--primary-container)' }}>
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: 'var(--primary-container)', 
              color: 'var(--primary)',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              boxShadow: '0 12px 24px rgba(0, 55, 176, 0.1)',
              overflow: 'hidden'
            }}>
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.name?.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>{user?.name}</h3>
            <div style={{ 
              display: 'inline-flex', 
              padding: '0.5rem 1.2rem', 
              borderRadius: '24px', 
              background: 'var(--on-surface)', 
              color: 'white', 
              fontSize: '0.75rem', 
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              {user?.role === 'admin' ? 'Strategic Admin' : 'Verified Student'}
            </div>
          </div>

          {/* Productivity Tip */}
          <div className="card-tonal" style={{ background: 'var(--primary-container)', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', color: 'var(--primary)' }}>
              <Star size={24} fill="var(--primary)" />
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>STUDY INSIGHT</h4>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 500 }}>
                  Active recall is 300% more effective than passive reading. Try reviewing your recent "Incorrect" methodologies in the Review tab.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Help */}
          <div className="card-tonal">
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Support & Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <Link to="/resources" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ color: 'var(--primary)' }}><MessageSquare size={18} /></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Theoretical Archive</span>
              </Link>
              <Link to="/settings" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ color: 'var(--primary)' }}><Award size={18} /></div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Certification Settings</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
