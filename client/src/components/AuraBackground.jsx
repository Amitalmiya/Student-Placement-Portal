import React from 'react';

/**
 * Midnight Horizon - Aura Gradient Background
 * Base #100e0b on wrapper, layers composite above it, content sits at z-index 1.
 */
export default function AuraBackground({ children, className = '' }) {
  return (
    <div className={`relative min-h-screen w-full bg-[#100e0b] overflow-hidden ${className}`}>
      {/* Layer 1: hard-light */}
      <div
        className="absolute inset-0 pointer-events-none transform-gpu"
        style={{
          background:
            'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 138, 255, 0.9) 40%, rgb(255, 255, 255) 70%, rgb(247, 164, 66) 80%, rgb(233, 66, 247) 100%)',
          mixBlendMode: 'hard-light',
          filter: 'blur(58px)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      {/* Layer 2: soft-light */}
      <div
        className="absolute inset-0 pointer-events-none transform-gpu"
        style={{
          background:
            'linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 138, 255, 0.9) 40%, rgb(255, 255, 255) 70%, rgb(247, 164, 66) 80%, rgb(233, 66, 247) 100%)',
          mixBlendMode: 'soft-light',
          filter: 'blur(48px)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      {/* Layer 3: normal */}
      <div
        className="absolute inset-0 pointer-events-none transform-gpu"
        style={{
          background:
            'linear-gradient(to top, rgb(0, 0, 31) 0%, rgba(0, 0, 31, 0.99) 8.1%, rgba(0, 0, 31, 0.953) 15.5%, rgba(0, 0, 31, 0.894) 22.5%, rgba(0, 0, 31, 0.824) 29%, rgba(0, 0, 31, 0.74) 35.3%, rgba(0, 0, 31, 0.647) 41.2%, rgba(0, 0, 31, 0.55) 47.1%, rgba(0, 0, 31, 0.45) 52.9%, rgba(0, 0, 31, 0.353) 58.8%, rgba(0, 0, 31, 0.26) 64.7%, rgba(0, 0, 31, 0.176) 71%, rgba(0, 0, 31, 0.106) 77.5%, rgba(0, 0, 31, 0.047) 84.5%, rgba(0, 0, 31, 0.01) 91.9%, rgba(0, 0, 31, 0) 100%)',
          mixBlendMode: 'normal',
          filter: 'blur(135px)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      />

      {/* Content wrapper sitting above the gradient stack */}
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}