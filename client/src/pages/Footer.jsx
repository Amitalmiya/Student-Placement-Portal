import React from 'react';
import { Link } from 'react-router-dom';

const SOCIALS = [
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/your-college',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/your-college',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.55.22.95.47 1.37.89.42.42.67.82.89 1.37.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.55-.47.95-.89 1.37-.42.42-.82.67-1.37.89-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.37-.89 3.72 3.72 0 0 1-.89-1.37c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.55.47-.95.89-1.37.42-.42.82-.67 1.37-.89.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.31-1.46.72-2.13 1.38A5.9 5.9 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.72 1.46 1.38 2.13a5.9 5.9 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" />
      </svg>
    ),
  },
  {
    name: 'X',
    href: 'https://x.com/your-college',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2H22l-7.6 8.68L23.3 22h-6.9l-5.4-6.6L4.7 22H1.6l8.1-9.3L1 2h7.1l4.9 6.03L18.9 2zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@your-college',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.37.56A3.02 3.02 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3.02 3.02 0 0 0 2.13 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.37-.56a3.02 3.02 0 0 0 2.13-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
];

const QUICK_LINKS = [
  { label: 'Sign in to dashboard', to: '/login' },
  { label: 'Create account', to: '/register' },
];

const PAGE_LINKS = [
  { label: 'Features & capabilities', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Contact support', href: '#contact' },
];

const ICON_PHONE = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const ICON_MAIL = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ICON_CLOCK = (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#12233F] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16 lg:pt-20 pb-8">
        {/* Main grid — 1 col mobile, 2 col tablet, 12-col precision on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-10 lg:gap-y-0 pb-12 sm:pb-14 border-b border-white/10">
          {/* Brand & institutional overview */}
          <div className="sm:col-span-2 lg:col-span-4 lg:pr-8 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-[#B5842A] text-white flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-105">
                SP
              </div>
              <span className="font-semibold text-white tracking-tight text-sm sm:text-base">
                Smart Placement Portal
              </span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              The centralized campus recruitment system connecting students, employers, and coordinators under one verified workflow.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#2F6B4F]/15 border border-[#2F6B4F]/30 text-[#5fb98a] text-[11px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5fb98a]" />
              Portal systems active
            </div>
          </div>

          {/* Helpdesk & support */}
          <div className="lg:col-span-3 lg:px-4">
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Helpdesk &amp; support
            </p>
            <ul className="space-y-3 text-sm text-white/65">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#B5842A] shrink-0">{ICON_PHONE}</span>
                <a href="tel:+911234567890" className="hover:text-white transition-colors">
                  +91 12345 67890
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#B5842A] shrink-0">{ICON_MAIL}</span>
                <a href="mailto:support@smartplacementportal.edu" className="hover:text-white transition-colors break-all">
                  support@smartplacementportal.edu
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#B5842A] shrink-0">{ICON_MAIL}</span>
                <a href="mailto:admin@smartplacementportal.edu" className="hover:text-white transition-colors break-all">
                  admin@smartplacementportal.edu
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-[#B5842A] shrink-0">{ICON_CLOCK}</span>
                <span>Mon&ndash;Fri, 9:00 AM&ndash;6:00 PM IST</span>
              </li>
            </ul>
          </div>

          {/* Placement cell location */}
          <div className="lg:col-span-3 lg:px-4">
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Placement cell
            </p>
            <address className="text-sm text-white/65 not-italic leading-relaxed space-y-1">
              <p className="font-medium text-white/90">Training &amp; Placement Cell</p>
              <p>Main Administrative Block, 2nd Floor</p>
              <p>University Campus, Academic Enclave</p>
              <p>Uttarakhand &ndash; 248007, India</p>
            </address>
          </div>

          {/* Quick navigation & social */}
          <div className="lg:col-span-2 lg:pl-4">
            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Quick navigation
            </p>
            <ul className="space-y-2.5 text-sm text-white/65 mb-7">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
              {PAGE_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Official channels
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="h-9 w-9 rounded-lg border border-white/15 text-white/65 flex items-center justify-center hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom legal / copyright bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} Smart Placement Portal. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
            <span className="text-white/20" aria-hidden="true">&bull;</span>
            <a href="#" className="hover:text-white transition-colors">Terms of service</a>
            <span className="text-white/20" aria-hidden="true">&bull;</span>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}