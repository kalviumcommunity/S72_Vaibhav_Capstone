import React from 'react';

export default function Button({ children, variant = 'primary', size = 'md', onClick, className = '', ...rest }) {
  const base = variant === 'primary' ? 'btn-primary' : 'btn-ghost';
  const sizeClass = size === 'lg' ? 'px-8 py-3.5 text-base' : size === 'sm' ? 'px-4 py-2 text-xs' : '';
  return (
    <button onClick={onClick} className={`${base} ${sizeClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}
