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
// Used to fill the Department dropdown in the Add Student form.
// Response shape: { data: [{ id, name, code }] }, same as the Manage Departments page.
const DEPARTMENTS_ENDPOINT = endpoints.departments.base;

const EMPTY_FORM = {
  full_name: '',
  email: '',
  phone: '',
  roll_number: '',
  department_id: '',
  cgpa: '',
  password: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Each validator returns an error message, or '' when the value is valid.
const VALIDATORS = {
  full_name: (v) => (v.trim() ? '' : 'Enter the student’s full name.'),
  email: (v) => (!v.trim() ? 'Enter an email address.' : EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address.'),
  phone: (v) => (!v.trim() || /^\+?[0-9\s-]{7,15}$/.test(v.trim()) ? '' : 'Enter a valid phone number.'),
  roll_number: (v) => (v.trim() ? '' : 'Enter the roll number.'),
  cgpa: (v) => {
    if (v === '') return '';
    const n = Number(v);
    return Number.isNaN(n) || n < 0 || n > 10 ? 'CGPA must be between 0 and 10.' : '';
  },
  password: (v) => (v.length >= 8 ? '' : 'Use at least 8 characters.'),
};
const FIELD_ORDER = Object.keys(EMPTY_FORM);

const validateAll = (form) =>
  Object.fromEntries(Object.entries(VALIDATORS).map(([name, check]) => [name, check(form[name])]));

const buildPayload = (f) => {
  const payload = {
    full_name: f.full_name.trim(),
    email: f.email.trim(),
    roll_number: f.roll_number.trim(),
    password: f.password,
  };
  if (f.department_id) payload.department_id = f.department_id;
  if (f.cgpa !== '') payload.cgpa = Number(f.cgpa);
  if (f.phone.trim()) payload.phone = f.phone.trim();
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

// Loads departments once, the first time `enabled` becomes true.
function useDepartments(enabled) {
  const [state, setState] = useState({ items: [], status: 'idle' });

  const fetchDepartments = useCallback(async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const res = await api.get(DEPARTMENTS_ENDPOINT);
      const data = res.data?.data;
      setState({ items: Array.isArray(data) ? data : data?.departments ?? [], status: 'ready' });
    } catch {
      setState((s) => ({ ...s, status: 'error' }));
    }
  }, []);

  useEffect(() => {
    if (enabled && state.status === 'idle') fetchDepartments();
  }, [enabled, state.status, fetchDepartments]);

  return { ...state, retry: fetchDepartments };
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

const dash = (v) => (v === null || v === undefined || v === '' ? '—' : v);

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
const AlertIcon = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>);
const UsersIcon = makeIcon(
  <>
    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="10" cy="7" r="4" />
    <path d="M21 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
    <div className="animate-pulse divide-y divide-gray-100" role="status" aria-label="Loading students">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-10 w-10 rounded-full bg-gray-100" />
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
  const id = `student-${name}`;
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
   Add student
   ====================================================================== */

function AddStudentModal({ departments, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dirty = FIELD_ORDER.some((k) => form[k] !== EMPTY_FORM[k]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    // Re-check live only once a field has shown an error, so typing isn't nagged early.
    setErrors((er) => (er[name] ? { ...er, [name]: VALIDATORS[name]?.(value) ?? '' } : er));
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
    document.getElementById('student-full_name')?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const next = validateAll(form);
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((k) => next[k]);
    if (firstInvalid) {
      document.getElementById(`student-${firstInvalid}`)?.focus();
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

  const deptId = 'student-department_id';
  const deptHint =
    departments.status === 'error' ? (
      <>
        Couldn’t load departments.{' '}
        <button type="button" onClick={departments.retry} className="font-medium text-indigo-600 hover:underline focus:outline-none focus-visible:underline">
          Retry
        </button>
      </>
    ) : null;

  return (
    <Modal
      wide
      title="Add student"
      titleId="add-student-title"
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
            <TextInput {...bind('full_name')} label="Full name" required autoFocus autoComplete="off" placeholder="e.g. Riya Sharma" className="sm:col-span-2" />
            <TextInput {...bind('email')} label="Email" type="email" required autoComplete="off" placeholder="name@college.edu" />
            <TextInput {...bind('phone')} label="Phone" type="tel" inputMode="tel" autoComplete="off" placeholder="Optional" />
            <TextInput {...bind('roll_number')} label="Roll number" required autoComplete="off" placeholder="e.g. 21CS1042" />

            <Field id={deptId} label="Department" hint={deptHint}>
              <select
                id={deptId}
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                disabled={departments.status === 'loading'}
                aria-describedby={describedBy(deptId, '', deptHint)}
                className={inputCls(false)}
              >
                <option value="">{departments.status === 'loading' ? 'Loading…' : 'Select department'}</option>
                {departments.items.map((d) => (
                  <option key={d.id} value={d.id}>{d.name ?? d.department_name}</option>
                ))}
              </select>
            </Field>

            <TextInput
              {...bind('cgpa')}
              label="CGPA"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              max="10"
              placeholder="0 to 10"
            />

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
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="subtle" onClick={reset} disabled={saving || (!dirty && !formError && !Object.values(errors).some(Boolean))}>
            Reset form
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add student'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function RemoveDialog({ student, busy, onCancel, onConfirm }) {
  return (
    <Modal title="Remove this student?" titleId="remove-student-title" onClose={onCancel} busy={busy} dismissOnBackdrop>
      <p className="px-5 py-5 text-sm text-gray-500 sm:px-6">
        <span className="font-medium text-gray-800">{student.full_name}</span>’s account will be removed
        permanently. This can’t be undone.
      </p>
      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="secondary" autoFocus onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Removing…' : 'Remove student'}</Button>
      </div>
    </Modal>
  );
}

/* ======================================================================
   Student list pieces (memoised so unrelated state changes don't re-render rows)
   ====================================================================== */

const StudentIdentity = ({ student }) => (
  <div className="flex min-w-0 items-center gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600" aria-hidden="true">
      {initials(student.full_name)}
    </span>
    <div className="min-w-0">
      <p className="truncate font-medium text-gray-900">{student.full_name}</p>
      <p className="truncate text-sm text-gray-500">{student.email}</p>
    </div>
  </div>
);

const PlacedBadge = ({ placed }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${placed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
    {placed ? 'Placed' : 'Not placed'}
  </span>
);

function StudentActions({ student, busy, onToggle, onRemove }) {
  const active = student.account_status === 'active';
  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="subtle"
        disabled={busy}
        onClick={() => onToggle(student)}
        aria-label={`${active ? 'Deactivate' : 'Activate'} ${student.full_name}`}
      >
        {busy ? 'Saving…' : active ? 'Deactivate' : 'Activate'}
      </Button>
      <Button size="sm" variant="subtleDanger" disabled={busy} onClick={() => onRemove(student)} aria-label={`Remove ${student.full_name}`}>
        Remove
      </Button>
    </div>
  );
}

const COLUMNS = ['Student', 'Roll no.', 'Department', 'CGPA', 'Placement', 'Status', 'Actions'];
const CELL = 'px-6 py-4';

const StudentRow = memo(function StudentRow({ student, busy, onToggle, onRemove }) {
  return (
    <tr className="transition-colors hover:bg-gray-50/60">
      <td className={`${CELL} max-w-xs`}><StudentIdentity student={student} /></td>
      <td className={`${CELL} text-gray-600`}>{dash(student.roll_number)}</td>
      <td className={`${CELL} text-gray-600`}>{dash(student.department_name)}</td>
      <td className={`${CELL} tabular-nums text-gray-600`}>{dash(student.cgpa)}</td>
      <td className={CELL}><PlacedBadge placed={student.is_placed} /></td>
      <td className={CELL}><Badge status={student.account_status} /></td>
      <td className={CELL}>
        <div className="flex justify-end">
          <StudentActions student={student} busy={busy} onToggle={onToggle} onRemove={onRemove} />
        </div>
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

const StudentCard = memo(function StudentCard({ student, busy, onToggle, onRemove }) {
  return (
    <li className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <StudentIdentity student={student} />
        <Badge status={student.account_status} />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Meta label="Roll no.">{dash(student.roll_number)}</Meta>
        <Meta label="CGPA"><span className="tabular-nums">{dash(student.cgpa)}</span></Meta>
        <Meta label="Department">{dash(student.department_name)}</Meta>
        <Meta label="Placement"><PlacedBadge placed={student.is_placed} /></Meta>
      </dl>
      <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
        <StudentActions student={student} busy={busy} onToggle={onToggle} onRemove={onRemove} />
      </div>
    </li>
  );
});

/* ======================================================================
   Page
   ====================================================================== */

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
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
  const departments = useDepartments(showForm);
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
        const res = await api.get(endpoints.admin.students, {
          params: { page, limit: PAGE_SIZE, search: debouncedSearch.trim() || undefined },
        });
        if (id !== requestId.current) return;
        setStudents(res.data.data.students);
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

  const toggleStatus = useCallback(
    async (student) => {
      const status = student.account_status === 'active' ? 'inactive' : 'active';
      setBusyId(student.user_id);
      try {
        await api.put(`${endpoints.admin.students}/${student.user_id}`, { status });
        setStudents((list) =>
          list.map((s) => (s.user_id === student.user_id ? { ...s, account_status: status } : s))
        );
        notify(`${student.full_name} is now ${status}`);
      } catch (err) {
        notify(parseApiError(err).message, 'error');
      } finally {
        setBusyId(null);
      }
    },
    [notify]
  );

  const confirmRemove = async () => {
    setRemoving(true);
    try {
      await api.delete(`${endpoints.admin.students}/${removeTarget.user_id}`);
      setRemoveTarget(null);
      notify('Student removed');
      // If that was the last row on this page, step back one page.
      load(students.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page);
    } catch (err) {
      notify(parseApiError(err).message, 'error');
    } finally {
      setRemoving(false);
    }
  };

  // Throws on failure so the form can show the errors; the form stays open.
  const addStudent = async (payload) => {
    await api.post(endpoints.admin.students, payload);
    setShowForm(false);
    notify('Student added');
    if (search) setSearch(''); // clearing search reloads the list
    else load(1);
  };

  const hasTotal = typeof pagination.total === 'number';

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage students</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Add, review and manage registered students.
              {hasTotal && !loading && <span className="text-gray-400"> {pagination.total} in total.</span>}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full shadow-sm sm:w-auto">
            <PlusIcon width={16} height={16} />
            Add student
          </Button>
        </header>

        <div className="relative mb-5 w-full lg:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll number or email"
            aria-label="Search students"
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
              title="Couldn’t load students"
              message="Check your connection and try again."
              action={<Button variant="dark" onClick={() => load(1)}>Try again</Button>}
            />
          ) : students.length === 0 ? (
            <StateMessage
              icon={UsersIcon}
              title={search ? 'No students match your search' : 'No students yet'}
              message={search ? 'Try a different name, roll number or email.' : 'Students you add will appear here.'}
              action={
                search ? (
                  <Button variant="dark" onClick={() => setSearch('')}>Clear search</Button>
                ) : (
                  <Button onClick={() => setShowForm(true)}>
                    <PlusIcon width={16} height={16} />
                    Add student
                  </Button>
                )
              }
            />
          ) : (
            <>
              <p className="sr-only" role="status">{students.length} students shown</p>

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
                    {students.map((s) => (
                      <StudentRow key={s.id} student={s} busy={busyId === s.user_id} onToggle={toggleStatus} onRemove={setRemoveTarget} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile and tablet: cards (two columns on tablet) */}
              <ul className="grid gap-3 p-3 sm:p-4 md:grid-cols-2 lg:hidden">
                {students.map((s) => (
                  <StudentCard key={s.id} student={s} busy={busyId === s.user_id} onToggle={toggleStatus} onRemove={setRemoveTarget} />
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

      {showForm && <AddStudentModal departments={departments} onClose={closeForm} onSubmit={addStudent} />}
      {removeTarget && (
        <RemoveDialog student={removeTarget} busy={removing} onCancel={closeRemove} onConfirm={confirmRemove} />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}