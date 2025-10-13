import React from 'react';

export default function Button({ children, variant = 'primary', onClick, className = '', ...rest }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
  return (
    <button onClick={onClick} className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}
