import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5 text-[#8c6620]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Student Profiles',
    desc: 'Skills, education history, and resumes live in one place, with every application tracked from a single consolidated dashboard.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#12233F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Recruiter Tools',
    desc: 'Post openings, screen applicants, and move candidates through your pipeline without ever leaving the portal.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#2F6B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Eligibility Checks',
    desc: 'CGPA, backlog, department, and skill matching run automatically before an application is ever submitted.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#8c6620]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Placement Analytics',
    desc: 'Live dashboards surface placement rate, department performance, and hiring trends as they happen in real time.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#12233F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    title: 'Announcements',
    desc: 'Broadcast updates to students and recruiters instantly, with notifications delivered directly inside the app.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-[#2F6B4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Role-Based Access',
    desc: 'Separate, fortified workflows for admins, students, and recruiters — securely enforced end to end.',
  },
];

const STEPS = [
  {
    role: 'Students',
    stepNumber: '01',
    icon: '🎓',
    tint: 'bg-[#B5842A]/10 text-[#8c6620] border-[#B5842A]/20',
    points: [
      'Build your verified profile and upload resume variants',
      'Browse roles filtered by your exact academic criteria',
      'Track every application stage in real time',
    ],
  },
  {
    role: 'Recruiters',
    stepNumber: '02',
    icon: '💼',
    tint: 'bg-[#12233F]/10 text-[#12233F] border-[#12233F]/20',
    points: [
      'Create verified company profile and post listings',
      'Set automated eligibility filters and shortlisting gates',
      'Coordinate interview schedules & extend offers directly',
    ],
  },
  {
    role: 'Coordinators',
    stepNumber: '03',
    icon: '🧭',
    tint: 'bg-[#2F6B4F]/10 text-[#2F6B4F] border-[#2F6B4F]/20',
    points: [
      'Oversee institutional student batches and recruiter records',
      'Publish verified announcements to targeted audiences',
      'Generate real-time placement and accreditation reports',
    ],
  },
];

const STATS = [
  { value: '3', label: 'Role-based dashboards' },
  { value: '100%', label: 'Server-verified eligibility' },
  { value: 'Live', label: 'Application tracking' },
  { value: '24/7', label: 'Access, anywhere' },
];

const FAQS = [
  {
    q: 'How does automated eligibility verification work?',
    a: 'When an employer posts an opportunity, they define requirements such as minimum CGPA, eligible departments, maximum active backlogs, and graduation year. The portal validates your academic records against these criteria in real time before allowing you to submit an application.',
  },
  {
    q: 'Can recruiters directly schedule interviews through the portal?',
    a: 'Yes. Recruiters have full access to screen applicant pools, shortlist candidates, send interview round schedules, and issue offer letters with automated candidate notifications.',
  },
  {
    q: 'What should students do if their academic details or CGPA are incorrect?',
    a: 'Academic data is linked to university records. If you notice any discrepancy in your CGPA, batch year, or department, contact your departmental placement coordinator via the Helpdesk form below to request an official verification update.',
  },
  {
    q: 'Is there a limit on how many job drives a student can apply for?',
    a: 'University placement policies dictate application quotas and single-offer rules. The portal automatically enforces your institution’s placement policy (e.g. Dream / Super Dream policy) seamlessly.',
  },
  {
    q: 'How do companies verify their organization on the portal?',
    a: 'Recruiters register with their official corporate email and company profile. University placement coordinators review and approve company registrations before job postings go live to ensure genuine student opportunities.',
  },
];

const initialContactForm = {
  name: '',
  email: '',
  role: 'student',
  recruiterName: '',
  companyName: '',
  subject: '',
  message: '',
};

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0); // First FAQ open by default

  // Contact form state
  const [contactForm, setContactForm] = useState(initialContactForm);
  const [contactStatus, setContactStatus] = useState({ loading: false, success: false, error: '' });

  const isRecruiter = contactForm.role === 'recruiter';

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setContactForm((f) => ({
      ...f,
      role,
      // Clear recruiter-only fields when switching away from Recruiter
      ...(role !== 'recruiter' ? { recruiterName: '', companyName: '' } : {}),
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, success: false, error: '' });

    // Simulate API submission
    setTimeout(() => {
      setContactStatus({ loading: false, success: true, error: '' });
      setContactForm(initialContactForm);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen bg-[#FAFAF8] text-[#12233F] antialiased selection:bg-[#B5842A]/20 selection:text-[#12233F]"
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
    >
      {/* ---------- Navbar ---------- */}
      <header className="sticky top-0 z-50 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E4E1D8] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="h-9 w-9 rounded-lg bg-[#12233F] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                SP
              </div>
              <span className="font-semibold text-[#12233F] tracking-tight text-base sm:text-lg">
                Smart Placement Portal
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7 lg:gap-8">
              <a href="#features" className="text-sm font-medium text-[#5b6472] hover:text-[#12233F] transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-[#5b6472] hover:text-[#12233F] transition-colors">
                How it works
              </a>
              <a href="#faq" className="text-sm font-medium text-[#5b6472] hover:text-[#12233F] transition-colors">
                FAQ
              </a>
              <a href="#contact" className="text-sm font-medium text-[#5b6472] hover:text-[#12233F] transition-colors">
                Contact
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium px-4 py-2 rounded-lg border border-[#12233F]/20 text-[#12233F] hover:bg-[#12233F]/5 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-[#B5842A] text-white hover:bg-[#9c6f22] shadow-sm hover:shadow transition-all"
              >
                Get started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg text-[#12233F] hover:bg-[#12233F]/5 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 6h18M3 12h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#E4E1D8] bg-[#FAFAF8] px-4 sm:px-6 py-4 space-y-2 shadow-lg animate-fadeIn">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#12233F] py-2">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#12233F] py-2">
              How it works
            </a>
            <a href="#faq" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#12233F] py-2">
              FAQ
            </a>
            <a href="#contact" onClick={() => setMenuOpen(false)} className="block text-sm font-medium text-[#12233F] py-2">
              Contact
            </a>
            <div className="flex flex-col gap-2 pt-3 border-t border-[#E4E1D8]">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-center px-4 py-2.5 rounded-lg border border-[#12233F]/20 text-[#12233F]"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-center px-4 py-2.5 rounded-lg bg-[#B5842A] text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ---------- Hero ---------- */}
      <section
        className="relative overflow-hidden border-b border-[#E4E1D8]"
        style={{
          backgroundColor: '#F3F1EA',
          backgroundImage: 'radial-gradient(#12233F12 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-14 items-center">
            {/* Left Column Copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B5842A]/10 border border-[#B5842A]/20 text-[#8c6620] text-xs font-semibold uppercase tracking-wider mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B5842A]" />
                Institutional Placement System
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-[3.25rem] font-medium leading-[1.14] tracking-tight text-[#12233F] mb-6"
                style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
              >
                Every opportunity, application, and offer letter — in one unified portal.
              </h1>

              <p className="text-base sm:text-lg text-[#5b6472] max-w-xl mb-8 leading-relaxed">
                Centralize student credentials, recruitment drives, automated eligibility filtering, and
                analytics — designed specifically for university placement cells, employers, and candidates.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to="/register"
                  className="text-center px-7 py-3.5 rounded-lg bg-[#B5842A] text-white text-sm font-semibold hover:bg-[#9c6f22] shadow-sm hover:shadow-md transition-all"
                >
                  Create an account
                </Link>
                <Link
                  to="/login"
                  className="text-center px-7 py-3.5 rounded-lg border border-[#12233F]/20 text-[#12233F] text-sm font-semibold hover:bg-white/80 bg-white/40 transition-colors"
                >
                  Sign in to Portal
                </Link>
              </div>
            </div>

            {/* Right Column: Live Mockup Overview */}
            <div className="rounded-2xl border border-[#E4E1D8] bg-white p-6 sm:p-7 shadow-xl shadow-[#12233F]/5">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E4E1D8]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#2F6B4F] animate-pulse" />
                  <span className="text-xs font-semibold text-[#12233F] uppercase tracking-wider">
                    Placement Cell Status
                  </span>
                </div>
                <span className="text-xs font-medium text-[#2F6B4F] bg-[#2F6B4F]/10 px-2.5 py-0.5 rounded-full">
                  Live Sync
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {STATS.map((s) => (
                  <div key={s.label} className="p-3.5 rounded-xl bg-[#FAFAF8] border border-[#E4E1D8]">
                    <p
                      className="text-2xl font-bold text-[#12233F]"
                      style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs text-[#5b6472] mt-0.5 font-medium leading-snug">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Recent Activity Snapshot */}
              <div className="rounded-xl bg-[#FAFAF8] p-3.5 border border-[#E4E1D8] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#5b6472]">
                  <span>Recent Screening</span>
                  <span className="text-[#2F6B4F] font-semibold">100% Eligible</span>
                </div>
                <div className="w-full bg-[#E4E1D8] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#2F6B4F] h-full rounded-full w-4/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="features" className="scroll-mt-16 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#B5842A] uppercase tracking-wider block mb-2">
              Capabilities
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#12233F] mb-3"
              style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
            >
              Everything placements need, in one place
            </h2>
            <p className="text-[#5b6472] text-sm sm:text-base leading-relaxed">
              Purpose-built tools for every stakeholder in the process — eliminating cumbersome spreadsheets
              and scattered email chains.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-white border border-[#E4E1D8] shadow-sm hover:shadow-md hover:border-[#12233F]/20 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-[#FAFAF8] border border-[#E4E1D8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg text-[#12233F] mb-2">{f.title}</h3>
                <p className="text-sm text-[#5b6472] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="bg-[#12233F] text-white scroll-mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#B5842A] uppercase tracking-wider block mb-2">
              Workflow Architecture
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white mb-3"
              style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
            >
              Built specifically for every role
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Tailored workflows engineered around the responsibilities of students, recruiters, and placement officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div
                key={s.role}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 sm:p-7 flex flex-col justify-between hover:bg-white/[0.07] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-xs font-semibold text-white/50 tracking-wider">
                      STEP {s.stepNumber}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4">{s.role}</h3>

                  <ul className="space-y-3">
                    {s.points.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-white/80">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B5842A]" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ Section ---------- */}
      <section id="faq" className="scroll-mt-16 bg-[#FAFAF8] border-b border-[#E4E1D8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
            <span className="text-xs font-semibold text-[#B5842A] uppercase tracking-wider block mb-2">
              Frequently Asked Questions
            </span>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#12233F] mb-3"
              style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
            >
              Got questions? We have answers.
            </h2>
            <p className="text-[#5b6472] text-sm sm:text-base">
              Find answers to common questions about eligibility rules, drive participation, and recruiter verification.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 bg-white ${
                    isOpen ? 'border-[#B5842A]/40 shadow-sm' : 'border-[#E4E1D8] hover:border-[#12233F]/20'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-semibold text-[#12233F]">
                      {faq.q}
                    </span>
                    <span
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold transition-transform duration-200 ${
                        isOpen
                          ? 'bg-[#B5842A] text-white rotate-45'
                          : 'bg-[#FAFAF8] border border-[#E4E1D8] text-[#12233F]'
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-[#5b6472] leading-relaxed border-t border-[#E4E1D8]/50 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Contact Section ---------- */}
      <section id="contact" className="scroll-mt-16 bg-[#FAFAF8] border-b border-[#E4E1D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            {/* Left Contact Info */}
            <div>
              <span className="text-xs font-semibold text-[#B5842A] uppercase tracking-wider block mb-2">
                Get In Touch
              </span>
              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#12233F] mb-4"
                style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
              >
                Have questions or need assistance?
              </h2>
              <p className="text-[#5b6472] text-sm sm:text-base leading-relaxed mb-8">
                Whether you are an institution inquiring about onboarding, an employer coordinating a recruitment drive, or a student needing help, our placement support team is here to assist.
              </p>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E4E1D8] flex items-center justify-center text-[#12233F] shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#5b6472] font-medium uppercase tracking-wider">Email Us</p>
                    <p className="text-sm font-semibold text-[#12233F]">placements@university.edu</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E4E1D8] flex items-center justify-center text-[#12233F] shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#5b6472] font-medium uppercase tracking-wider">Placement Helpdesk</p>
                    <p className="text-sm font-semibold text-[#12233F]">+1 (555) 234-5678</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[#E4E1D8] flex items-center justify-center text-[#12233F] shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[#5b6472] font-medium uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-[#12233F]">Career & Placement Cell, Admin Block</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Contact Form */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E4E1D8] shadow-sm">
              <h3 className="text-xl font-semibold text-[#12233F] mb-1">Send a Message</h3>
              <p className="text-sm text-[#5b6472] mb-6">Fill in the details and our coordinator will get back to you shortly.</p>

              {contactStatus.success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2.5">
                  <span className="font-bold">✓</span> Thank you! Your message has been submitted. We will contact you soon.
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                      Your Name <span className="text-[#B5842A]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Taylor"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:bg-white focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                      Email Address <span className="text-[#B5842A]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.edu"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:bg-white focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                      I am a...
                    </label>
                    <select
                      value={contactForm.role}
                      onChange={handleRoleChange}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:bg-white focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                    >
                      <option value="student">Student</option>
                      <option value="recruiter">Recruiter / Employer</option>
                      <option value="coordinator">Faculty / Placement Coordinator</option>
                      <option value="other">Other Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Onboarding or Drive Query"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:bg-white focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                    />
                  </div>
                </div>

                {/* Recruiter-only fields: name of recruiter + company name */}
                {isRecruiter && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#B5842A]/5 border border-[#B5842A]/20">
                    <div>
                      <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                        Recruiter Name <span className="text-[#B5842A]">*</span>
                      </label>
                      <input
                        type="text"
                        required={isRecruiter}
                        placeholder="Jordan Lee"
                        value={contactForm.recruiterName}
                        onChange={(e) => setContactForm({ ...contactForm, recruiterName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                        Company Name <span className="text-[#B5842A]">*</span>
                      </label>
                      <input
                        type="text"
                        required={isRecruiter}
                        placeholder="Acme Technologies"
                        value={contactForm.companyName}
                        onChange={(e) => setContactForm({ ...contactForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#12233F] uppercase tracking-wider mb-1">
                    Message <span className="text-[#B5842A]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us how we can assist you..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E4E1D8] rounded-xl text-sm text-[#12233F] focus:bg-white focus:ring-2 focus:ring-[#B5842A]/20 focus:border-[#B5842A] outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactStatus.loading}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#12233F] text-white text-sm font-semibold hover:bg-[#1a3159] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#12233F] disabled:opacity-50 transition shadow-sm"
                >
                  {contactStatus.loading ? 'Sending message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Call to Action ---------- */}
      <section id="get-started" className="scroll-mt-16 bg-[#F3F1EA] border-b border-[#E4E1D8]">
        <div className="max-w-3xl mx-auto text-center px-4 sm:px-6 py-20 sm:py-28">
          <h2
            className="text-3xl sm:text-4xl font-medium text-[#12233F] mb-4"
            style={{ fontFamily: "'Source Serif 4', ui-serif, Georgia, serif" }}
          >
            Ready to streamline campus recruitment?
          </h2>
          <p className="text-[#5b6472] text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Students, recruiters, and coordinators can create accounts and get started in minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg bg-[#B5842A] text-white text-sm font-semibold hover:bg-[#9c6f22] shadow-sm hover:shadow-md transition-all"
            >
              Register now
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-center px-8 py-3.5 rounded-lg border border-[#12233F]/20 text-[#12233F] text-sm font-semibold bg-white hover:bg-[#FAFAF8] transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <Footer />
    </div>
  );
}