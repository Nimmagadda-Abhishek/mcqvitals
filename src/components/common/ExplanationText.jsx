import React from 'react';

const ExplanationText = ({ text, style }) => {
  const content = typeof text === 'string' ? text : '';
  const bulletPattern = /(?:^|\r?\n)\s*•\s*/;

  if (!bulletPattern.test(content)) {
    return <p style={{ ...style, whiteSpace: 'pre-line' }}>{content}</p>;
  }

  const points = content
    .split(bulletPattern)
    .map(point => point.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return (
    <ul style={{ ...style, paddingLeft: '1.5rem', marginTop: 0, listStyleType: 'disc' }}>
      {points.map((point, index) => (
        <li key={index} style={{ marginBottom: index < points.length - 1 ? '0.65rem' : 0 }}>
          {point}
        </li>
      ))}
    </ul>
  );
};

export default ExplanationText;