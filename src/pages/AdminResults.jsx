import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  User as UserIcon,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { TableShimmer } from '../components/common/Shimmer';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const data = await api.admin.getAllResults();
      setResults(data);
    } catch (error) {
      console.error('Failed to load results', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.testId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '5rem', padding: '0 clamp(1rem, 5vw, 2.5rem)' }}>
      <header style={{ marginBottom: '3.5rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Performance Monitoring
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.5rem', lineHeight: 1.1 }}>Comprehensive Results</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', maxWidth: '700px' }}>
          Full audit trail of all assessment attempts and integrity status.
        </p>
      </header>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div className="card-tonal" style={{ flex: 1, minWidth: '300px', display: 'flex', alignItems: 'center', gap: '1.2rem', padding: '0.8rem 1.5rem' }}>
          <Search size={20} color="var(--primary)" />
          <input 
            type="text" 
            placeholder="Search by student name or assessment title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'none', border: 'none', width: '100%', fontSize: '1rem', color: 'var(--on-surface)', outline: 'none' }}
          />
        </div>
        <button className="card-tonal" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem', fontWeight: 700 }}>
          <Filter size={18} /> All Disciplines
        </button>
      </div>

      {loading ? (
        <TableShimmer rows={10} />
      ) : (
        <div className="section-tonal" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-high)', color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <th style={{ padding: '1.5rem 2rem' }}>Student & Assessment</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Mastery Score</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Status & Integrity</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Date Attempted</th>
                  <th style={{ padding: '1.5rem 2rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result._id} style={{ borderBottom: '1px solid var(--outline-variant)' }} className="table-row-hover">
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: 'var(--primary-container)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'var(--primary)'
                        }}>
                          <UserIcon size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1rem' }}>{result.userId?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{result.testId?.title}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: result.status === 'malpractice' ? 'var(--error)' : 'var(--primary)' }}>
                        {result.score}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {result.status === 'malpractice' ? (
                            <ShieldAlert size={16} color="var(--error)" />
                          ) : (
                            <CheckCircle size={16} color="var(--success)" />
                          )}
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 900, 
                            textTransform: 'uppercase',
                            color: result.status === 'malpractice' ? 'var(--error)' : 'var(--success)'
                          }}>
                            {result.status}
                          </span>
                        </div>
                        {result.status === 'malpractice' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontStyle: 'italic' }}>
                            {result.malpracticeReason}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>
                        {new Date(result.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem 2rem' }}>
                      <Link to={`/analysis/${result._id}`} style={{ 
                        color: 'var(--primary)', 
                        fontWeight: 800, 
                        fontSize: '0.85rem', 
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        Audit <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.6 }}>
              No results discovered matching your query.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminResults;
