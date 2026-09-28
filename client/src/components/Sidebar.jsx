import React, { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM9 12h6M9 16h4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M16 8.5a5 5 0 0 1 0 7" />
    </>
  ),
  building: <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h2a2 2 0 0 1 2 2v10M2 21h20M8 7h4M8 11h4M8 15h4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  graduation: (
    <>
      <path d="m2 9 10-5 10 5-10 5Z" />
      <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </>
  ),
  landmark: <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6Z" />,
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M8 17v-6M13 17V7M18 17v-3" />
    </>
  ),
};

function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const NAV_ITEMS = {
  student: [
    { to: '/student', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/student/profile', label: 'My Profile', short: 'Profile', icon: 'user' },
    { to: '/student/jobs', label: 'Browse Jobs', short: 'Jobs', icon: 'briefcase' },
    { to: '/student/applications', label: 'My Applications', short: 'Applied', icon: 'clipboard' },
    { to: '/student/announcements', label: 'Announcements', short: 'Updates', icon: 'megaphone' },
  ],
  recruiter: [
    { to: '/recruiter', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/recruiter/profile', label: 'Company Profile', short: 'Company', icon: 'building' },
    { to: '/recruiter/jobs', label: 'My Job Posts', short: 'Jobs', icon: 'briefcase' },
    { to: '/recruiter/post-job', label: 'Post a Job', short: 'Post', icon: 'plus' },
    { to: '/recruiter/announcements', label: 'Announcements', short: 'Updates', icon: 'megaphone' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
    { to: '/admin/students', label: 'Students', icon: 'graduation' },
    { to: '/admin/recruiters', label: 'Recruiters', icon: 'building' },
    { to: '/admin/departments', label: 'Departments', short: 'Depts', icon: 'landmark' },
    { to: '/admin/jobs', label: 'Jobs', icon: 'briefcase' },
    { to: '/admin/announcements', label: 'Announcements', short: 'Updates', icon: 'megaphone' },
    { to: '/admin/analytics', label: 'Analytics', icon: 'chart' },
  ],
};

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';

export default function Sidebar({ role }) {
  const items = NAV_ITEMS[role] || [];
  const location = useLocation();
  const mobileNavRef = useRef(null);

  // Keep the active tab visible when the mobile bar scrolls horizontally.
  useEffect(() => {
    const active = mobileNavRef.current?.querySelector('[aria-current="page"]');
    active?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [location.pathname]);

  return (
    <>
      {/* Tablet: icon rail. Desktop: full sidebar. */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 self-start overflow-y-auto border-r border-slate-200 bg-white px-2 py-4 md:flex md:w-16 md:flex-col lg:w-60 lg:px-3">
        <nav aria-label="Main" className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={item.label}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors lg:justify-start ${focusRing} ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
              <span className="hidden truncate lg:inline">{item.label}</span>
              <span className="sr-only lg:hidden">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile: fixed, horizontally scrollable bottom bar */}
      <nav
        ref={mobileNavRef}
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-slate-200 bg-white/95 px-1 pt-1 backdrop-blur md:hidden"
        style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))', scrollbarWidth: 'none' }}
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-w-[4.5rem] flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${focusRing} ${
                isActive ? 'text-indigo-700' : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-indigo-100' : ''
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                </span>
                <span className="whitespace-nowrap">{item.short || item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}