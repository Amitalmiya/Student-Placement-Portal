import React from 'react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <div className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm mb-4 ${styles[type]}`}>
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
          &times;
        </button>
      )}
    </div>
  );
}
