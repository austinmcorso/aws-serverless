import React from 'react';

export default function Image({ children, className }) {
  return (
    <div className={`image-container ${className}`}>
      {children}
    </div>
  );
}
