import React from 'react';

const COLOR_MAP = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-amber-100 text-amber-700',
  interview: 'bg-purple-100 text-purple-700',
  selected: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
};

export default function Badge({ status }) {
  const cls = COLOR_MAP[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`badge ${cls} capitalize`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
