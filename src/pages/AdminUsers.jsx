import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  TrendingUp, 
  ShieldCheck,
  MoreVertical,
  Filter,
  User as UserIcon
} from 'lucide-react';
import api from '../services/api';
import { TableShimmer } from '../components/common/Shimmer';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.admin.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Student Relations
        </div>
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Institutional Registry</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.1rem' }}>
          Monitor student enrollment, identity verification, and platform engagement.
        </p>
      </header>

      {/* Control Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="card-tonal" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '0.8rem 1.5rem' }}>
          <Search size={20} color="var(--primary)" />
          <input 
            type="text" 
            placeholder="Search by name, email, or identity hash..." 
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
                  <th style={{ padding: '1.5rem 2rem' }}>Academic Status</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Enrolled On</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Engagement</th>
                  <th style={{ padding: '1.5rem 2rem' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--outline-variant)', transition: 'background 0.2s' }} className="table-row-hover">
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
                          overflow: 'hidden'
                        }}>
                          {user.profileImage ? <img src={user.profileImage} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : <UserIcon size={20} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{user.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Mail size={12} /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div className="badge-tonal" style={{ 
                        background: user.role === 'admin' ? 'var(--tertiary-container)' : 'var(--success-container)', 
                        color: user.role === 'admin' ? 'var(--tertiary)' : 'var(--success)',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        textTransform: 'uppercase'
                      }}>
                        {user.role === 'admin' ? 'System Administrator' : 'Verified Student'}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>
                        <TrendingUp size={16} /> High Active
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                      <button style={{ color: 'var(--on-surface-variant)', background: 'none' }}><MoreVertical size={20} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.6 }}>
              No students found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
