import React, { useEffect, useState } from 'react';
import { 
  Users,
  Search,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvingId, setApprovingId] = useState(null);

  const loadPending = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await api.admin.getPendingApprovals();
      setUsers(Array.isArray(data) ? data : data?.users || []);
    } catch (e) {
      setError(e.message || 'Failed to load pending approvals');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u?.name || '').toLowerCase().includes(q) ||
      (u?.email || '').toLowerCase().includes(q) ||
      String(u?._id || u?.id || '').toLowerCase().includes(q)
    );
  });

  const resolveUserId = (u) => u?._id || u?.id || u?.userId;

  const handleApprove = async (u) => {
    const userId = resolveUserId(u);
    if (!userId) {
      alert('Cannot approve: missing user id');
      return;
    }

    try {
      setApprovingId(userId);
      setError('');
      await api.admin.approveUser(userId);
      await loadPending();
    } catch (e) {
      setError(e.message || 'Approval failed');
      console.error(e);
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
      <header style={{ marginBottom: '3.5rem', marginTop: '1rem' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 800,
          color: 'var(--primary)',
          marginBottom: '0.6rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <ShieldCheck size={18} /> Admin Approvals
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}>Pending Student Registrations</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', maxWidth: '800px' }}>
          Review each new registration and approve students before they can start taking assessments.
        </p>
      </header>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="card-tonal" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '0.8rem 1.5rem' }}>
          <Search size={20} color="var(--primary)" />
          <input
            type="text"
            placeholder="Search by name, email, or id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', width: '100%', fontSize: '1rem', color: 'var(--on-surface)', outline: 'none' }}
          />
        </div>

        <div className="card-tonal" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Clock size={18} color="var(--tertiary)" />
          <div style={{ fontWeight: 900, color: 'var(--on-surface)' }}>Pending: {users.length}</div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 0, 0, 0.05)',
          border: '1px solid rgba(255, 0, 0, 0.25)',
          color: 'var(--error)',
          padding: '0.9rem 1.2rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{
          background: 'var(--surface-high)',
          border: '1px solid var(--outline-variant)',
          borderRadius: '16px',
          padding: '2rem',
          opacity: 0.75
        }}>
          Loading pending approvals...
        </div>
      ) : (
        <div className="section-tonal" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-high)', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '1.5rem 2rem' }}>Student</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Status</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Registered On</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const id = resolveUserId(u);
                  return (
                    <tr key={id} style={{ borderBottom: '1px solid var(--outline-variant)' }} className="table-row-hover">
                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '12px',
                              background: 'var(--primary-container)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--primary)'
                            }}
                          >
                            <Users size={18} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 900, fontSize: '1rem' }}>{u?.name || 'Unnamed student'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600, marginTop: '0.2rem' }}>
                              {u?.email || '—'}
                            </div>
                            {id && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700, marginTop: '0.2rem', opacity: 0.8 }}>
                                ID: {id}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div className="badge-tonal" style={{ background: 'rgba(255, 195, 0, 0.15)', color: 'var(--tertiary)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                          Pending Approval
                        </div>
                      </td>

                      <td style={{ padding: '1.5rem 2rem' }}>
                        <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>
                          {u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </div>
                      </td>

                      <td style={{ padding: '1.5rem 2rem' }}>
                        <button
                          disabled={approvingId === id}
                          onClick={() => handleApprove(u)}
                          style={{
                            padding: '0.75rem 1.1rem',
                            borderRadius: '10px',
                            background: approvingId === id ? 'rgba(0,0,0,0.06)' : 'var(--success)',
                            color: 'white',
                            border: 'none',
                            cursor: approvingId === id ? 'not-allowed' : 'pointer',
                            fontWeight: 900,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: approvingId === id ? 0.75 : 1
                          }}
                        >
                          <CheckCircle size={16} /> {approvingId === id ? 'Approving...' : 'Approve'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.6 }}>
              No pending users found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;

