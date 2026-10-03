import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  FileText,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { StatsShimmer, TableShimmer } from '../components/common/Shimmer';

const getRequestsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== 'object') return [];

  for (const key of ['users', 'pendingUsers', 'students', 'approvals']) {
    if (Array.isArray(response[key])) return response[key];
  }

  return response.data && response.data !== response
    ? getRequestsFromResponse(response.data)
    : [];
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [deviceRequests, setDeviceRequests] = useState([]);
  const [approvalsLoading, setApprovalsLoading] = useState(true);
  const [approvalError, setApprovalError] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  const loadDashboardStats = useCallback(async () => {
    try {
      const data = await api.admin.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load admin stats', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApprovals = useCallback(async () => {
    setApprovalsLoading(true);
    setApprovalError('');
    try {
      const [students, devices] = await Promise.all([
        api.admin.getPendingApprovals(),
        api.admin.getDeviceChangeRequests()
      ]);
      setPendingStudents(getRequestsFromResponse(students));
      setDeviceRequests(getRequestsFromResponse(devices));
    } catch (error) {
      setApprovalError(error.message || 'Could not load approval requests.');
    } finally {
      setApprovalsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
    loadApprovals();
  }, [loadDashboardStats, loadApprovals]);

  const resolveUserId = (user) => user?._id || user?.id || user?.userId;

  const handleApproval = async (user, type) => {
    const userId = resolveUserId(user);
    if (!userId) {
      setApprovalError('This request is missing a student ID and cannot be approved.');
      return;
    }

    const requestId = type === 'device' ? `device-${userId}` : userId;
    try {
      setApprovingId(requestId);
      setApprovalError('');
      if (type === 'device') {
        await api.admin.approveDeviceChange(userId);
      } else {
        await api.admin.approveUser(userId);
      }
      await loadApprovals();
    } catch (error) {
      setApprovalError(error.message || 'Could not approve this request.');
    } finally {
      setApprovingId(null);
    }
  };

  const renderApprovalList = (requests, type) => {
    if (approvalsLoading) {
      return <p style={{ color: 'var(--on-surface-variant)', padding: '1rem 0' }}>Loading requests...</p>;
    }

    if (requests.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '1rem 0', color: 'var(--on-surface-variant)' }}>
          <CheckCircle size={18} color="var(--success)" /> No pending requests.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {requests.slice(0, 4).map((user, index) => {
          const id = resolveUserId(user);
          const requestId = type === 'device' ? `device-${id}` : id;
          const isApproving = approvingId === requestId;
          return (
            <div key={id || `${type}-${index}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.9rem', background: 'var(--surface-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <div style={{ width: '38px', height: '38px', flexShrink: 0, borderRadius: '8px', background: type === 'device' ? 'rgba(212, 136, 6, 0.12)' : 'var(--primary-container)', color: type === 'device' ? '#a86800' : 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                  {type === 'device' ? <Smartphone size={18} /> : <Users size={18} />}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, overflowWrap: 'anywhere' }}>{user?.name || 'Unnamed student'}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', overflowWrap: 'anywhere' }}>{user?.email || 'No email provided'}</div>
                </div>
              </div>
              <button
                disabled={isApproving || !id}
                onClick={() => handleApproval(user, type)}
                style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', background: isApproving ? 'var(--surface-high)' : type === 'device' ? '#a86800' : 'var(--success)', color: isApproving ? 'var(--on-surface-variant)' : 'white', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap', opacity: !id ? 0.6 : 1 }}
              >
                <CheckCircle size={16} /> {isApproving ? 'Approving...' : type === 'device' ? 'Approve change' : 'Approve student'}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const dashboardCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: <Users size={24} />, color: 'var(--primary)', trend: '+12% this month' },
    { label: 'Assessments', value: stats?.totalTests || 0, icon: <ClipboardList size={24} />, color: 'var(--success)', trend: '4 Active modules' },
    { label: 'Total Attempts', value: stats?.totalResults || 0, icon: <TrendingUp size={24} />, color: 'var(--tertiary)', trend: '85% completion rate' },
    { label: 'Malpractice Cases', value: stats?.malpracticeCount || 0, icon: <ShieldAlert size={24} />, color: 'var(--error)', trend: 'Action required' },
    { label: 'Active Subscribers', value: stats?.activeSubscribers || 0, icon: <CheckCircle size={24} />, color: '#10b981', trend: 'Premium Users' },
    { label: 'Total Earnings', value: `₹${(stats?.totalSubscriptionEarnings || 0).toLocaleString()}`, icon: <TrendingUp size={24} />, color: '#f59e0b', trend: 'Revenue' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
      <header style={{ marginBottom: '3.5rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Admin Dashboard
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}>Dashboard overview</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', maxWidth: '700px' }}>
          Review requests that need your attention and monitor platform activity.
        </p>
      </header>

      <section aria-labelledby="approval-requests-title" className="section-tonal" style={{ padding: 'clamp(1rem, 3vw, 2rem)', marginBottom: '2.5rem', border: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <div>
            <h2 id="approval-requests-title" style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <AlertCircle size={22} color="var(--tertiary)" /> Needs your attention
            </h2>
            <p style={{ color: 'var(--on-surface-variant)' }}>Pending student registrations and device change requests.</p>
          </div>
          <Link to="/admin/approvals/pending" style={{ color: 'var(--primary)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0' }}>
            View all requests <ChevronRight size={18} />
          </Link>
        </div>

        {approvalError && (
          <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--error)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', padding: '0.8rem 1rem', marginBottom: '1rem' }}>
            <AlertCircle size={18} /> {approvalError}
            <button onClick={loadApprovals} aria-label="Retry loading requests" title="Retry" style={{ marginLeft: 'auto', color: 'var(--error)', display: 'inline-flex', padding: '0.25rem' }}><RefreshCw size={17} /></button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '1rem' }}>
          <section style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="var(--primary)" /> Student approvals</h3>
              <span aria-label={`${pendingStudents.length} pending student approvals`} style={{ minWidth: '28px', height: '28px', display: 'grid', placeItems: 'center', borderRadius: '14px', background: 'var(--primary-container)', color: 'var(--primary)', fontWeight: 900 }}>{approvalsLoading ? '...' : pendingStudents.length}</span>
            </div>
            {renderApprovalList(pendingStudents, 'student')}
            {!approvalsLoading && pendingStudents.length > 4 && <p style={{ marginTop: '0.75rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>And {pendingStudents.length - 4} more pending.</p>}
          </section>

          <section style={{ padding: '1rem', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Smartphone size={18} color="#a86800" /> Device change approvals</h3>
              <span aria-label={`${deviceRequests.length} pending device change approvals`} style={{ minWidth: '28px', height: '28px', display: 'grid', placeItems: 'center', borderRadius: '14px', background: 'rgba(212, 136, 6, 0.12)', color: '#8a5700', fontWeight: 900 }}>{approvalsLoading ? '...' : deviceRequests.length}</span>
            </div>
            {renderApprovalList(deviceRequests, 'device')}
            {!approvalsLoading && deviceRequests.length > 4 && <p style={{ marginTop: '0.75rem', color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>And {deviceRequests.length - 4} more pending.</p>}
          </section>
        </div>
      </section>

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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '2rem', marginBottom: '4rem' }}>
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
