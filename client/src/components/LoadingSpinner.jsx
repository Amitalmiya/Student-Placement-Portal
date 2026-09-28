import React from 'react';

export default function LoadingSpinner({ size = 'md', label = 'Loading...' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-gray-500">
      <div className={`${sizes[size]} animate-spin rounded-full border-2 border-primary-200 border-t-primary-600`} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
