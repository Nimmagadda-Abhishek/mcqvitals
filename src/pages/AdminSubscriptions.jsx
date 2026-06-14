import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  User as UserIcon,
  Filter
} from 'lucide-react';
import api from '../services/api';
import { TableShimmer } from '../components/common/Shimmer';

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const data = await api.admin.getAllSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to load subscriptions', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.userId?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sub.orderId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Revenue Management
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Platform Subscriptions</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>
          Monitor active premium memberships, recent payments, and failed transactions.
        </p>
      </header>

      {/* Control Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="card-tonal" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '0.8rem 1.5rem' }}>
          <Search size={20} color="var(--primary)" />
          <input 
            type="text" 
            placeholder="Search by student name, email, or order ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', width: '100%', fontSize: '1rem', color: 'var(--on-surface)', outline: 'none' }}
          />
        </div>
        <button className="card-tonal" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem', fontWeight: 700 }}>
          <Filter size={18} /> Filter Status
        </button>
      </div>

      {loading ? (
        <TableShimmer rows={8} />
      ) : (
        <div className="section-tonal" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-high)', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '1.5rem 2rem' }}>Student Identity</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Plan Details</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Amount</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Date</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: '1px solid var(--outline-variant)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '12px', 
                          background: 'var(--primary-container)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          {sub.userId?.profileImage ? (
                            <img src={sub.userId.profileImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} alt="" />
                          ) : (
                            <UserIcon size={20} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{sub.userId?.name || 'Unknown User'}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>
                            {sub.userId?.email || 'No email provided'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontWeight: 700, textTransform: 'capitalize' }}>{sub.plan} Plan</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>{sub.orderId}</div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>₹{sub.amount?.toFixed(2)}</div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.6rem', 
                        color: sub.status === 'paid' ? 'var(--success)' : sub.status === 'created' ? 'var(--tertiary)' : 'var(--error)', 
                        fontWeight: 800, 
                        fontSize: '0.9rem',
                        textTransform: 'capitalize'
                      }}>
                        {sub.status === 'paid' ? <CheckCircle2 size={16} /> : sub.status === 'created' ? <Clock size={16} /> : <AlertCircle size={16} />} 
                        {sub.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSubscriptions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.6 }}>
              No subscriptions found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
