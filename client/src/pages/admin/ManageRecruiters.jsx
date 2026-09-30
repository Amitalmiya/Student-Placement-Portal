import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

/* ======================================================================
   Config: adjust these if your API differs
   ====================================================================== */

const PAGE_SIZE = 10;
const FORM_ID = 'recruiter'; // prefix for form field ids

const EMPTY_FORM = {
  company_name: '',
  email: '',
  phone: '',
  website: '',
  location: '',
  password: '',
  is_verified: false,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

// Each validator returns an error message, or '' when the value is valid.
const VALIDATORS = {
  company_name: (v) => (v.trim() ? '' : 'Enter the company name.'),
  email: (v) => (!v.trim() ? 'Enter an email address.' : EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address.'),
  phone: (v) => (!v.trim() || /^\+?[0-9\s-]{7,15}$/.test(v.trim()) ? '' : 'Enter a valid phone number.'),
  website: (v) => (!v.trim() || WEBSITE_RE.test(v.trim()) ? '' : 'Enter a valid website, e.g. acme.com.'),
  password: (v) => (v.length >= 8 ? '' : 'Use at least 8 characters.'),
};
const FIELD_ORDER = Object.keys(EMPTY_FORM);

const validateAll = (form) =>
  Object.fromEntries(Object.entries(VALIDATORS).map(([name, check]) => [name, check(form[name])]));

const buildPayload = (f) => {
  const payload = {
    company_name: f.company_name.trim(),
    email: f.email.trim(),
    password: f.password,
    is_verified: f.is_verified,
  };
  if (f.phone.trim()) payload.phone = f.phone.trim();
  if (f.location.trim()) payload.location = f.location.trim();
  if (f.website.trim()) {
    const site = f.website.trim();
    payload.website = /^https?:\/\//i.test(site) ? site : `https://${site}`;
  }
  return payload;
};

/* ======================================================================
   Helpers
   ====================================================================== */

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Normalises axios errors (including Laravel-style 422 responses).
function parseApiError(err) {
  const data = err?.response?.data;
  const fields = {};
  if (data?.errors && typeof data.errors === 'object') {
    Object.entries(data.errors).forEach(([key, val]) => {
      fields[key] = Array.isArray(val) ? val[0] : String(val);
    });
  }
  const fallback = err?.response
    ? 'Something went wrong. Please try again.'
    : 'Couldn’t reach the server. Check your connection and try again.';
  return { message: data?.message || fallback, fields };
}

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

/* ======================================================================
   Icons
   ====================================================================== */

const ICON_PROPS = {
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
const makeIcon = (children) =>
  function Icon(props) {
    return <svg {...ICON_PROPS} {...props}>{children}</svg>;
  };

const SearchIcon = makeIcon(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
const PlusIcon = makeIcon(<path d="M12 5v14M5 12h14" />);
const CloseIcon = makeIcon(<path d="M18 6 6 18M6 6l12 12" />);
const CheckIcon = makeIcon(<path d="M20 6 9 17l-5-5" />);
const AlertIcon = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>);
const BuildingIcon = makeIcon(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
  </>
);
const BriefcaseIcon = makeIcon(
  <>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" />
  </>
);
const EyeIcon = makeIcon(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>);
const EyeOffIcon = makeIcon(
  <>
    <path d="M17.94 17.94A10.1 10.1 0 0 1 12 19c-6.5 0-10-7-10-7a17.7 17.7 0 0 1 4.06-5.06M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.16 3.19M1 1l22 22" />
    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
  </>
);

/* ======================================================================
   Reusable UI primitives
   ====================================================================== */

const BUTTON_VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
  dark: 'bg-gray-900 text-white hover:bg-gray-700 focus-visible:ring-gray-900',
  secondary: 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-indigo-500',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  subtle: 'text-gray-600 hover:bg-gray-100 focus-visible:ring-indigo-500',
  accent: 'text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500',
  subtleDanger: 'text-red-600 hover:bg-red-50 focus-visible:ring-red-500',
};
const BUTTON_SIZES = { sm: 'px-3 py-1.5', md: 'px-4 py-2.5' };

function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${BUTTON_SIZES[size]} ${BUTTON_VARIANTS[variant]} ${className}`}
    />
  );
}

function Modal({ title, description, titleId, onClose, busy = false, dismissOnBackdrop = false, wide = false, children }) {
  // Lock page scroll and hand focus back to the trigger when the modal closes.
  useEffect(() => {
    const trigger = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      trigger?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 sm:items-center sm:p-4"
      onMouseDown={(e) => dismissOnBackdrop && !busy && e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50"
          >
            <CloseIcon />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isError = toast.type === 'error';
  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
        isError ? 'bg-red-600' : 'bg-gray-900'
      }`}
    >
      {toast.message}
    </div>
  );
}

function StateMessage({ icon: Icon, tone = 'neutral', title, message, action, role }) {
  const toneCls = tone === 'danger' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400';
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role={role}>
      <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${toneCls}`}>
        <Icon width={26} height={26} />
      </span>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100" role="status" aria-label="Loading recruiters">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
          </div>
          <div className="hidden h-6 w-16 rounded-full bg-gray-100 sm:block" />
        </div>
      ))}
    </div>
  );
}

/* ======================================================================
   Form primitives
   ====================================================================== */

const inputCls = (invalid, hasSuffix = false) =>
  `w-full rounded-xl border bg-white py-2.5 pl-3.5 ${hasSuffix ? 'pr-11' : 'pr-3.5'} text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
  }`;

function Field({ id, label, required, error, hint, className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500" aria-hidden="true"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

function TextInput({ name, label, error, required, hint, suffix, className, ...rest }) {
  const id = `${FORM_ID}-${name}`;
  return (
    <Field id={id} label={label} required={required} error={error} hint={hint} className={className}>
      <div className="relative">
        <input
          id={id}
          name={name}
          aria-required={required || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          className={inputCls(error, Boolean(suffix))}
          {...rest}
        />
        {suffix}
      </div>
    </Field>
  );
}

/* ======================================================================
   Add recruiter
   ====================================================================== */

function AddRecruiterModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dirty = FIELD_ORDER.some((k) => form[k] !== EMPTY_FORM[k]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const next = type === 'checkbox' ? checked : value;
    setForm((f) => ({ ...f, [name]: next }));
    // Re-check live only once a field has shown an error, so typing isn't nagged early.
    setErrors((er) => (er[name] ? { ...er, [name]: VALIDATORS[name]?.(next) ?? '' } : er));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const check = VALIDATORS[name];
    if (check) setErrors((er) => ({ ...er, [name]: check(value) }));
  };

  // Everything a text field needs, in one spread.
  const bind = (name) => ({
    name,
    value: form[name],
    error: errors[name],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError('');
    setShowPassword(false);
    document.getElementById(`${FORM_ID}-company_name`)?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const next = validateAll(form);
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((k) => next[k]);
    if (firstInvalid) {
      document.getElementById(`${FORM_ID}-${firstInvalid}`)?.focus();
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSubmit(buildPayload(form)); // parent closes the modal on success
    } catch (err) {
      const { message, fields } = parseApiError(err);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? 'Fix the highlighted fields and try again.' : message);
      setSaving(false);
    }
  };

  return (
    <Modal
      wide
      title="Add recruiter"
      titleId="add-recruiter-title"
      description="Fields marked * are required."
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {formError && (
            <div role="alert" className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <TextInput {...bind('company_name')} label="Company name" required autoFocus autoComplete="off" placeholder="e.g. Acme Technologies" className="sm:col-span-2" />
            <TextInput {...bind('email')} label="Email" type="email" required autoComplete="off" placeholder="hr@company.com" />
            <TextInput {...bind('phone')} label="Phone" type="tel" inputMode="tel" autoComplete="off" placeholder="Optional" />
            <TextInput {...bind('website')} label="Website" inputMode="url" autoComplete="off" placeholder="e.g. acme.com" />
            <TextInput {...bind('location')} label="Location" autoComplete="off" placeholder="e.g. Bengaluru" />

            <TextInput
              {...bind('password')}
              label="Temporary password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              hint="At least 8 characters."
              className="sm:col-span-2"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />

            <label
              htmlFor={`${FORM_ID}-is_verified`}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3.5 transition-colors hover:bg-gray-50 sm:col-span-2"
            >
              <input
                id={`${FORM_ID}-is_verified`}
                name="is_verified"
                type="checkbox"
                checked={form.is_verified}
                onChange={handleChange}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                <span className="block text-sm font-medium text-gray-800">Mark as verified</span>
                <span className="block text-xs text-gray-500">Use this if you’ve already checked the company.</span>
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="subtle" onClick={reset} disabled={saving || (!dirty && !formError && !Object.values(errors).some(Boolean))}>
            Reset form
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add recruiter'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function RemoveDialog({ recruiter, busy, onCancel, onConfirm }) {
  return (
    <Modal title="Remove this recruiter?" titleId="remove-recruiter-title" onClose={onCancel} busy={busy} dismissOnBackdrop>
      <p className="px-5 py-5 text-sm text-gray-500 sm:px-6">
        <span className="font-medium text-gray-800">{recruiter.company_name}</span>’s account will be removed
        permanently. This can’t be undone.
      </p>
      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="secondary" autoFocus onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Removing…' : 'Remove recruiter'}</Button>
      </div>
    </Modal>
  );
}

/* ======================================================================
   Recruiter list pieces (memoised so unrelated state changes don't re-render rows)
   ====================================================================== */

const RecruiterIdentity = ({ recruiter }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600" aria-hidden="true">
      {initials(recruiter.company_name)}
    </span>
    <div className="min-w-0">
      <p className="truncate font-medium text-gray-900">{recruiter.company_name}</p>
      <p className="truncate text-sm text-gray-500">{recruiter.email}</p>
    </div>
  </div>
);

const VerifiedBadge = ({ verified }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
    {verified && <CheckIcon width={12} height={12} strokeWidth={3} />}
    {verified ? 'Verified' : 'Unverified'}
  </span>
);

const JobCount = ({ count }) => (
  <span className="inline-flex items-center gap-1.5 text-gray-600">
    <BriefcaseIcon width={16} height={16} className="text-gray-400" />
    <span className="tabular-nums">{count ?? 0}</span>
  </span>
);

function RecruiterActions({ recruiter, busy, onVerify, onToggle, onRemove }) {
  const verified = Boolean(recruiter.is_verified);
  const active = recruiter.account_status === 'active';
  const name = recruiter.company_name;
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <Button size="sm" variant="accent" disabled={busy} onClick={() => onVerify(recruiter)} aria-label={`${verified ? 'Unverify' : 'Verify'} ${name}`}>
        {verified ? 'Unverify' : 'Verify'}
      </Button>
      <Button size="sm" variant="subtle" disabled={busy} onClick={() => onToggle(recruiter)} aria-label={`${active ? 'Deactivate' : 'Activate'} ${name}`}>
        {active ? 'Deactivate' : 'Activate'}
      </Button>
      <Button size="sm" variant="subtleDanger" disabled={busy} onClick={() => onRemove(recruiter)} aria-label={`Remove ${name}`}>
        Remove
      </Button>
    </div>
  );
}

const COLUMNS = ['Company', 'Jobs posted', 'Verification', 'Status', 'Actions'];
const CELL = 'px-6 py-4';

const RecruiterRow = memo(function RecruiterRow({ recruiter, busy, ...handlers }) {
  return (
    <tr className={`transition-colors hover:bg-gray-50/60 ${busy ? 'opacity-60' : ''}`}>
      <td className={`${CELL} max-w-xs`}><RecruiterIdentity recruiter={recruiter} /></td>
      <td className={CELL}><JobCount count={recruiter.job_count} /></td>
      <td className={CELL}><VerifiedBadge verified={Boolean(recruiter.is_verified)} /></td>
      <td className={CELL}><Badge status={recruiter.account_status} /></td>
      <td className={CELL}>
        <RecruiterActions recruiter={recruiter} busy={busy} {...handlers} />
      </td>
    </tr>
  );
});

const Meta = ({ label, children }) => (
  <div>
    <dt className="text-xs text-gray-400">{label}</dt>
    <dd className="mt-0.5 text-gray-700">{children}</dd>
  </div>
);

const RecruiterCard = memo(function RecruiterCard({ recruiter, busy, ...handlers }) {
  return (
    <li className={`rounded-xl border border-gray-100 p-4 ${busy ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <RecruiterIdentity recruiter={recruiter} />
        <Badge status={recruiter.account_status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Meta label="Jobs posted">{recruiter.job_count ?? 0}</Meta>
        <Meta label="Verification"><VerifiedBadge verified={Boolean(recruiter.is_verified)} /></Meta>
      </dl>
      <div className="mt-3 border-t border-gray-100 pt-3">
        <RecruiterActions recruiter={recruiter} busy={busy} {...handlers} />
      </div>
    </li>
  );
});

/* ======================================================================
   Page
   ====================================================================== */

export default function ManageRecruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [busyId, setBusyId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounce(search);
  const requestId = useRef(0);

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const closeForm = useCallback(() => setShowForm(false), []);
  const closeRemove = useCallback(() => setRemoveTarget(null), []);

  const load = useCallback(
    async (page = 1) => {
      const id = ++requestId.current; // ignore out-of-order responses
      setLoading(true);
      setLoadFailed(false);
      try {
        const res = await api.get(endpoints.admin.recruiters, {
          params: { page, limit: PAGE_SIZE, search: debouncedSearch.trim() || undefined },
        });
        if (id !== requestId.current) return;
        setRecruiters(res.data.data.recruiters);
        setPagination(res.data.data.pagination);
      } catch {
        if (id === requestId.current) setLoadFailed(true);
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [debouncedSearch]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  // Shared by verify and activate/deactivate: `body` goes to the API, `local` patches the row.
  const updateRecruiter = useCallback(
    async (recruiter, { body, local, message }) => {
      setBusyId(recruiter.user_id);
      try {
        await api.put(`${endpoints.admin.recruiters}/${recruiter.user_id}`, body);
        setRecruiters((list) => list.map((r) => (r.user_id === recruiter.user_id ? { ...r, ...local } : r)));
        notify(message);
      } catch (err) {
        notify(parseApiError(err).message, 'error');
      } finally {
        setBusyId(null);
      }
    },
    [notify]
  );

  const verify = useCallback(
    (r) => {
      const next = !r.is_verified;
      return updateRecruiter(r, {
        body: { is_verified: next },
        local: { is_verified: next },
        message: `${r.company_name} ${next ? 'verified' : 'marked unverified'}`,
      });
    },
    [updateRecruiter]
  );

  const toggleStatus = useCallback(
    (r) => {
      const status = r.account_status === 'active' ? 'inactive' : 'active';
      return updateRecruiter(r, {
        body: { status },
        local: { account_status: status },
        message: `${r.company_name} is now ${status}`,
      });
    },
    [updateRecruiter]
  );

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`${endpoints.admin.recruiters}/${removeTarget.user_id}`);
      setRemoveTarget(null);
      notify('Recruiter removed');
      // If that was the last row on this page, step back one page.
      load(recruiters.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page);
    } catch (err) {
      notify(parseApiError(err).message, 'error');
    } finally {
      setRemoving(false);
    }
  };

  // Throws on failure so the form can show the errors; the form stays open.
  const addRecruiter = async (payload) => {
    await api.post(endpoints.admin.recruiters, payload);
    setShowForm(false);
    notify('Recruiter added');
    if (search) setSearch(''); // clearing search reloads the list
    else load(1);
  };

  const hasTotal = typeof pagination.total === 'number';
  const rowProps = { onVerify: verify, onToggle: toggleStatus, onRemove: setRemoveTarget };

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage recruiters</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Add recruiters, verify companies and manage accounts.
              {hasTotal && !loading && <span className="text-gray-400"> {pagination.total} in total.</span>}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full shadow-sm sm:w-auto">
            <PlusIcon width={16} height={16} />
            Add recruiter
          </Button>
        </header>

        <div className="relative mb-5 w-full lg:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by company or email"
            aria-label="Search recruiters"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <section aria-busy={loading} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <ListSkeleton />
          ) : loadFailed ? (
            <StateMessage
              role="alert"
              icon={AlertIcon}
              tone="danger"
              title="Couldn’t load recruiters"
              message="Check your connection and try again."
              action={<Button variant="dark" onClick={() => load(1)}>Try again</Button>}
            />
          ) : recruiters.length === 0 ? (
            <StateMessage
              icon={BuildingIcon}
              title={search ? 'No recruiters match your search' : 'No recruiters yet'}
              message={search ? 'Try a different company name or email.' : 'Recruiters you add will appear here.'}
              action={
                search ? (
                  <Button variant="dark" onClick={() => setSearch('')}>Clear search</Button>
                ) : (
                  <Button onClick={() => setShowForm(true)}>
                    <PlusIcon width={16} height={16} />
                    Add recruiter
                  </Button>
                )
              }
            />
          ) : (
            <>
              <p className="sr-only" role="status">{recruiters.length} recruiters shown</p>

              {/* Desktop: table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/70 text-left text-xs font-medium text-gray-500">
                    <tr>
                      {COLUMNS.map((c, i) => (
                        <th key={c} scope="col" className={`px-6 py-3 ${i === COLUMNS.length - 1 ? 'text-right' : ''}`}>
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recruiters.map((r) => (
                      <RecruiterRow key={r.id} recruiter={r} busy={busyId === r.user_id} {...rowProps} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile and tablet: cards (two columns on tablet) */}
              <ul className="grid gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                {recruiters.map((r) => (
                  <RecruiterCard key={r.id} recruiter={r} busy={busyId === r.user_id} {...rowProps} />
                ))}
              </ul>
            </>
          )}
        </section>

        {!loading && !loadFailed && pagination.total_pages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
          </div>
        )}
      </div>

      {showForm && <AddRecruiterModal onClose={closeForm} onSubmit={addRecruiter} />}
      {removeTarget && (
        <RemoveDialog recruiter={removeTarget} busy={removing} onCancel={closeRemove} onConfirm={confirmRemove} />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}