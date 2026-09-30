import React, { useEffect, useState, useCallback, useRef } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
];

/* ---------- small helpers ---------- */

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || '?';

/* ---------- icons (inline, no extra dependency) ---------- */

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const SearchIcon = (p) => (
  <svg {...iconProps} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
const TrashIcon = (p) => (
  <svg {...iconProps} {...p}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </svg>
);
const UsersIcon = (p) => (
  <svg {...iconProps} {...p}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const BriefcaseIcon = (p) => (
  <svg {...iconProps} {...p}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" />
  </svg>
);
const AlertIcon = (p) => (
  <svg {...iconProps} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);
const PlusIcon = (p) => (
  <svg {...iconProps} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
const CloseIcon = (p) => (
  <svg {...iconProps} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);

/* ---------- presentational pieces ---------- */

function CompanyAvatar({ name }) {
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600"
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

function Applicants({ count }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-gray-600">
      <UsersIcon width={16} height={16} className="text-gray-400" />
      <span className="tabular-nums">{count ?? 0}</span>
    </span>
  );
}

function DeleteButton({ onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Delete ${title}`}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
    >
      <TrashIcon width={16} height={16} />
      Delete
    </button>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100" role="status" aria-label="Loading jobs">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-gray-100" />
            <div className="h-3 w-1/4 rounded bg-gray-100" />
          </div>
          <div className="hidden h-6 w-16 rounded-full bg-gray-100 sm:block" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ filtered, onClear, onCreate }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <BriefcaseIcon width={26} height={26} />
      </span>
      <h2 className="text-base font-semibold text-gray-900">
        {filtered ? 'No jobs match your filters' : 'No jobs posted yet'}
      </h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        {filtered
          ? 'Try a different search term or status.'
          : 'Jobs posted by recruiters will appear here.'}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
        >
          Clear filters
        </button>
      )}
      {!filtered && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <PlusIcon width={16} height={16} />
          Create job
        </button>
      )}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
        <AlertIcon width={26} height={26} />
      </span>
      <h2 className="text-base font-semibold text-gray-900">Couldn’t load jobs</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}

function DeleteDialog({ job, deleting, error, onCancel, onConfirm }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !deleting && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-4 sm:items-center"
      onClick={() => !deleting && onCancel()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-job-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <TrashIcon width={20} height={20} />
          </span>
          <div className="min-w-0">
            <h2 id="delete-job-title" className="text-lg font-semibold text-gray-900">
              Delete this job?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium text-gray-700">{job.title}</span> at {job.company_name} will
              be removed permanently. This can’t be undone.
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            autoFocus
            disabled={deleting}
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {deleting ? 'Deleting…' : 'Delete job'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- create job form ---------- */

const EMPTY_FORM = {
  title: '',
  company_name: '',
  location: '',
  job_type: 'full-time',
  status: 'open',
  description: '',
};

const JOB_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'internship', label: 'Internship' },
  { value: 'contract', label: 'Contract' },
];

const fieldCls = (invalid) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
  }`;

function Field({ id, label, required, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function JobFormModal({ saving, formError, serverErrors, onCancel, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [clientErrors, setClientErrors] = useState({});
  const errors = { ...serverErrors, ...clientErrors };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onCancel();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [saving, onCancel]);

  const set = (name) => (e) => {
    setForm((f) => ({ ...f, [name]: e.target.value }));
    setClientErrors((c) => ({ ...c, [name]: undefined })); // clears client and server error for this field
  };

  const submit = (e) => {
    e.preventDefault();
    if (saving) return;

    const next = {};
    if (!form.title.trim()) next.title = 'Enter a job title.';
    if (!form.company_name.trim()) next.company_name = 'Enter the company name.';
    if (!form.description.trim()) next.description = 'Add a short description of the role.';
    setClientErrors(next);
    if (Object.keys(next).length) return;

    const payload = {
      title: form.title.trim(),
      company_name: form.company_name.trim(),
      job_type: form.job_type,
      status: form.status,
      description: form.description.trim(),
    };
    if (form.location.trim()) payload.location = form.location.trim();
    onSubmit(payload);
  };

  const aria = (name) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `job-${name}-error` : undefined,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-job-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id="create-job-title" className="text-lg font-semibold text-gray-900">
              Create job
            </h2>
            <p className="text-sm text-gray-500">Fields marked * are required.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
            {formError && (
              <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <Field id="job-title" label="Job title" required error={errors.title}>
              <input
                id="job-title"
                type="text"
                autoFocus
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Frontend Developer"
                className={fieldCls(errors.title)}
                aria-required="true"
                {...aria('title')}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="job-company_name" label="Company" required error={errors.company_name}>
                <input
                  id="job-company_name"
                  type="text"
                  value={form.company_name}
                  onChange={set('company_name')}
                  placeholder="e.g. Acme Technologies"
                  className={fieldCls(errors.company_name)}
                  aria-required="true"
                  {...aria('company_name')}
                />
              </Field>
              <Field id="job-location" label="Location" error={errors.location}>
                <input
                  id="job-location"
                  type="text"
                  value={form.location}
                  onChange={set('location')}
                  placeholder="e.g. Bengaluru or Remote"
                  className={fieldCls(errors.location)}
                  {...aria('location')}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="job-job_type" label="Job type" error={errors.job_type}>
                <select
                  id="job-job_type"
                  value={form.job_type}
                  onChange={set('job_type')}
                  className={fieldCls(errors.job_type)}
                  {...aria('job_type')}
                >
                  {JOB_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </Field>
              <Field id="job-status" label="Status" error={errors.status}>
                <select
                  id="job-status"
                  value={form.status}
                  onChange={set('status')}
                  className={fieldCls(errors.status)}
                  {...aria('status')}
                >
                  <option value="open">Open</option>
                  <option value="draft">Draft</option>
                </select>
              </Field>
            </div>

            <Field id="job-description" label="Description" required error={errors.description}>
              <textarea
                id="job-description"
                rows={6}
                value={form.description}
                onChange={set('description')}
                placeholder="What will the person do, and what skills or qualifications are needed?"
                className={`${fieldCls(errors.description)} resize-y`}
                aria-required="true"
                {...aria('description')}
              />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState('');

  const debouncedSearch = useDebounce(search);
  const requestId = useRef(0);

  const load = useCallback(
    async (page = 1) => {
      const id = ++requestId.current; // ignore out-of-order responses
      setLoading(true);
      setError('');
      try {
        const res = await api.get(endpoints.jobs.base, {
          params: {
            page,
            limit: 10,
            search: debouncedSearch.trim() || undefined,
            status: status || undefined,
          },
        });
        if (id !== requestId.current) return;
        setJobs(res.data.data.jobs);
        setPagination(res.data.data.pagination);
      } catch {
        if (id !== requestId.current) return;
        setError('Check your connection and try again.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [debouncedSearch, status]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const hasFilters = Boolean(search || status);
  const clearFilters = () => {
    setSearch('');
    setStatus('');
  };

  const closeDialog = useCallback(() => {
    setTarget(null);
    setDeleteError('');
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete(`${endpoints.jobs.base}/${target.id}`);
      closeDialog();
      // if that was the last row on this page, step back one page
      const page = jobs.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      load(page);
    } catch {
      setDeleteError('Something went wrong and the job wasn’t deleted. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const openForm = () => {
    setFormError('');
    setFieldErrors({});
    setShowForm(true);
  };

  const closeForm = useCallback(() => {
    setShowForm(false);
    setFormError('');
    setFieldErrors({});
  }, []);

  const createJob = async (payload) => {
    setSaving(true);
    setFormError('');
    setFieldErrors({});
    try {
      await api.post(endpoints.jobs.base, payload);
      setShowForm(false);
      setToast('Job created');
      // Clearing filters reloads the list; otherwise reload page 1 directly.
      if (search || status) clearFilters();
      else load(1);
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && typeof data.errors === 'object') {
        const flat = {};
        Object.entries(data.errors).forEach(([key, val]) => {
          flat[key] = Array.isArray(val) ? val[0] : String(val);
        });
        setFieldErrors(flat);
      }
      setFormError(data?.message || 'Something went wrong and the job wasn’t created. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const hasTotal = typeof pagination.total === 'number';

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage jobs</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Create, review and remove job postings from every recruiter.
              {hasTotal && !loading && (
                <span className="text-gray-400"> {pagination.total} in total.</span>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={openForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            <PlusIcon width={16} height={16} />
            Create job
          </button>
        </header>

        {/* Filters */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or company"
              aria-label="Search jobs"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by status"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0"
          >
            {STATUS_FILTERS.map((f) => {
              const active = status === f.value;
              return (
                <button
                  key={f.value || 'all'}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(f.value)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
                    active
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results */}
        <section
          aria-busy={loading}
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          {loading ? (
            <Skeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={() => load(1)} />
          ) : jobs.length === 0 ? (
            <EmptyState filtered={hasFilters} onClear={clearFilters} onCreate={openForm} />
          ) : (
            <>
              {/* Tablet & desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/70 text-left text-xs font-medium text-gray-500">
                    <tr>
                      <th scope="col" className="px-6 py-3">Job</th>
                      <th scope="col" className="px-6 py-3">Applicants</th>
                      <th scope="col" className="px-6 py-3">Status</th>
                      <th scope="col" className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {jobs.map((j) => (
                      <tr key={j.id} className="transition-colors hover:bg-gray-50/60">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <CompanyAvatar name={j.company_name} />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900">{j.title}</p>
                              <p className="truncate text-gray-500">{j.company_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><Applicants count={j.applicant_count} /></td>
                        <td className="px-6 py-4"><Badge status={j.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <DeleteButton title={j.title} onClick={() => setTarget(j)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: stacked cards */}
              <ul className="divide-y divide-gray-100 md:hidden">
                {jobs.map((j) => (
                  <li key={j.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <CompanyAvatar name={j.company_name} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug text-gray-900">{j.title}</p>
                        <p className="truncate text-sm text-gray-500">{j.company_name}</p>
                      </div>
                      <Badge status={j.status} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                      <Applicants count={j.applicant_count} />
                      <DeleteButton title={j.title} onClick={() => setTarget(j)} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {!loading && !error && pagination.total_pages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
          </div>
        )}
      </div>

      {showForm && (
        <JobFormModal
          saving={saving}
          formError={formError}
          serverErrors={fieldErrors}
          onCancel={closeForm}
          onSubmit={createJob}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}

      {target && (
        <DeleteDialog
          job={target}
          deleting={deleting}
          error={deleteError}
          onCancel={closeDialog}
          onConfirm={confirmDelete}
        />
      )}
    </DashboardLayout>
  );
}