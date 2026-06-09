import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardList, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import api from '../services/api';
import { StatsShimmer, TableShimmer } from '../components/common/Shimmer';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const data = await api.admin.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <Users size={24} />, color: 'var(--primary)', trend: '+12% this month' },
    { label: 'Assessments', value: stats?.totalTests || 0, icon: <ClipboardList size={24} />, color: 'var(--success)', trend: '4 Active modules' },
    { label: 'Total Attempts', value: stats?.totalResults || 0, icon: <TrendingUp size={24} />, color: 'var(--tertiary)', trend: '85% completion rate' },
    { label: 'Malpractice Cases', value: stats?.malpracticeCount || 0, icon: <ShieldAlert size={24} />, color: 'var(--error)', trend: 'Action required' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
      <header style={{ marginBottom: '3.5rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Strategic Command Center
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}>Platform Intelligence</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', maxWidth: '700px' }}>
          Overview of institutional performance, integrity metrics, and module engagement.
        </p>
      </header>

      {loading ? (
        <>
          <StatsShimmer />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))', gap: '3rem' }}>
            <TableShimmer rows={5} />
            <TableShimmer rows={5} />
          </div>
        </>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            {dashboardCards.map((card, i) => (
              <div key={i} className="card-tonal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '12px', 
                    background: `${card.color}15`, 
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {card.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: card.color }}>{card.trend}</span>
                </div>
                <div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--on-surface)' }}>{card.value}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))', gap: '3rem' }}>
            {/* Recent Integrity Alerts */}
            <section className="section-tonal" style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <ShieldAlert size={24} color="var(--error)" /> Recent Integrity Violations
                </h2>
                <button style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>Audit All</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {stats?.recentResults?.filter(r => r.status === 'malpractice').length > 0 ? (
                  stats.recentResults.filter(r => r.status === 'malpractice').map((result, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem', 
                      padding: '1.2rem', 
                      background: 'rgba(255, 0, 0, 0.03)', 
                      borderRadius: '12px',
                      borderLeft: '4px solid var(--error)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{result.userId?.name || 'Anonymous Student'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--error)', fontWeight: 600, marginTop: '0.2rem' }}>
                          {result.malpracticeReason || 'Integrity violation detected'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{result.testId?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{new Date(result.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                    <CheckCircle size={40} color="var(--success)" style={{ marginBottom: '1rem' }} />
                    <p>No critical violations reported in the last 24 hours.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Category Distribution */}
            <section className="card-tonal" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <TrendingUp size={24} color="var(--primary)" /> Module Engagement
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {stats?.categoryStats?.map((cat, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 700 }}>
                      <span>{cat.category}</span>
                      <span>{cat.count} Attempts</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--surface-high)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${(cat.count / stats.totalResults) * 100}%`, 
                        height: '100%', 
                        background: 'var(--primary)', 
                        borderRadius: '4px' 
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
