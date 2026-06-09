import React from 'react';

const Shimmer = ({ width, height, borderRadius, className = '', style = {} }) => {
  return (
    <div 
      className={`shimmer ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '1rem', 
        borderRadius: borderRadius || '4px',
        ...style 
      }} 
    />
  );
};

export const TableShimmer = ({ rows = 5 }) => (
  <div className="section-tonal" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ padding: '1.5rem 2rem', background: 'var(--surface-high)' }}>
      <Shimmer width="150px" height="1rem" />
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <Shimmer width="44px" height="44px" borderRadius="12px" />
        <div style={{ flex: 1 }}>
          <Shimmer width="30%" height="1.2rem" style={{ marginBottom: '0.5rem' }} />
          <Shimmer width="20%" height="0.8rem" />
        </div>
        <Shimmer width="15%" height="1rem" />
        <Shimmer width="10%" height="1rem" />
      </div>
    ))}
  </div>
);

export const CardShimmer = ({ cards = 3 }) => (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
    gap: '2.5rem' 
  }}>
    {[...Array(cards)].map((_, i) => (
      <div key={i} className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Shimmer width="56px" height="56px" borderRadius="14px" />
          <Shimmer width="80px" height="24px" borderRadius="20px" />
        </div>
        <Shimmer width="80%" height="2rem" />
        <Shimmer width="40%" height="1rem" />
        <Shimmer width="100%" height="100px" borderRadius="var(--radius-md)" />
        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Shimmer width="100px" height="1rem" />
          <Shimmer width="140px" height="48px" borderRadius="var(--radius-md)" />
        </div>
      </div>
    ))}
  </div>
);

export const StatsShimmer = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
    {[...Array(4)].map((_, i) => (
      <div key={i} className="card-tonal" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Shimmer width="48px" height="48px" borderRadius="12px" />
          <Shimmer width="60px" height="12px" />
        </div>
        <div>
          <Shimmer width="100px" height="2.5rem" style={{ marginBottom: '0.5rem' }} />
          <Shimmer width="120px" height="1rem" />
        </div>
      </div>
    ))}
  </div>
);

export default Shimmer;
