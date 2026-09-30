import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

/* ======================================================================
   Config: adjust these if your API differs
   ====================================================================== */

const FORM_ID = 'department'; // prefix for form field ids
const EMPTY_FORM = { name: '', code: '' };
const FIELD_ORDER = Object.keys(EMPTY_FORM);
const CODE_RE = /^[A-Z0-9-]{2,10}$/;

// Each validator returns an error message, or '' when the value is valid.
// `taken` holds the lower-cased names and codes that already exist.
const VALIDATORS = {
  name: (v, taken) => {
    const s = v.trim();
    if (!s) return 'Enter the department name.';
    if (s.length < 2) return 'Use at least 2 characters.';
    if (s.length > 80) return 'Use 80 characters or fewer.';
    return taken.names.has(s.toLowerCase()) ? 'A department with this name already exists.' : '';
  },
  code: (v, taken) => {
    const s = v.trim().toUpperCase();
    if (!s) return 'Enter a department code.';
    if (!CODE_RE.test(s)) return 'Use 2 to 10 letters, numbers or hyphens.';
    return taken.codes.has(s.toLowerCase()) ? 'This code is already in use.' : '';
  },
};

const buildPayload = (f) => ({ name: f.name.trim(), code: f.code.trim().toUpperCase() });

/* ======================================================================
   Helpers
   ====================================================================== */

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
const TrashIcon = makeIcon(<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />);
const AlertIcon = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>);
const BuildingIcon = makeIcon(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01" />
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
    <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm" role={role}>
      <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${toneCls}`}>
        <Icon width={26} height={26} />
      </span>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ======================================================================
   Form primitives
   ====================================================================== */

const inputCls = (invalid) =>
  `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:outline-none focus:ring-2 ${
    invalid
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20'
  }`;

function TextInput({ name, label, error, required, hint, className = '', ...rest }) {
  const id = `${FORM_ID}-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={inputCls(error)}
        {...rest}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

/* ======================================================================
   Add department
   ====================================================================== */

function AddDepartmentModal({ taken, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const dirty = FIELD_ORDER.some((k) => form[k] !== EMPTY_FORM[k]);
  const validate = (name, value) => VALIDATORS[name]?.(value, taken) ?? '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = name === 'code' ? value.toUpperCase() : value;
    setForm((f) => ({ ...f, [name]: next }));
    // Re-check live only once a field has shown an error, so typing isn't nagged early.
    setErrors((er) => (er[name] ? { ...er, [name]: validate(name, next) } : er));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (VALIDATORS[name]) setErrors((er) => ({ ...er, [name]: validate(name, value) }));
  };

  // Everything an input needs, in one spread.
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
    document.getElementById(`${FORM_ID}-name`)?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const next = Object.fromEntries(FIELD_ORDER.map((k) => [k, validate(k, form[k])]));
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
      title="Add department"
      titleId="add-department-title"
      description="Fields marked * are required."
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
          {formError && (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <TextInput {...bind('name')} label="Department name" required autoFocus autoComplete="off" placeholder="e.g. Computer Science and Engineering" />
          <TextInput
            {...bind('code')}
            label="Code"
            required
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={10}
            placeholder="e.g. CSE"
            hint="Short and unique. Letters, numbers and hyphens only."
          />
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="subtle" onClick={reset} disabled={saving || (!dirty && !formError && !Object.values(errors).some(Boolean))}>
            Reset form
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add department'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ department, busy, onCancel, onConfirm }) {
  return (
    <Modal title="Delete this department?" titleId="delete-department-title" onClose={onCancel} busy={busy} dismissOnBackdrop>
      <p className="px-5 py-5 text-sm text-gray-500 sm:px-6">
        <span className="font-medium text-gray-800">{department.name}</span> will be deleted permanently.
        Students assigned to it will be unassigned. This can’t be undone.
      </p>
      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="secondary" autoFocus onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete department'}</Button>
      </div>
    </Modal>
  );
}

/* ======================================================================
   Department list (memoised so unrelated state changes don't re-render cards)
   ====================================================================== */

const DepartmentCard = memo(function DepartmentCard({ department, onDelete }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-semibold text-indigo-600" aria-hidden="true">
        {initials(department.name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{department.name}</p>
        <span className="mt-1 inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium tracking-wide text-gray-600">
          {department.code}
        </span>
      </div>
      <Button size="sm" variant="subtleDanger" onClick={() => onDelete(department)} aria-label={`Delete ${department.name}`}>
        <TrashIcon width={16} height={16} />
        <span className="hidden sm:inline">Delete</span>
      </Button>
    </li>
  );
});

function ListSkeleton() {
  return (
    <div className="grid animate-pulse gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading departments">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4">
          <div className="h-11 w-11 rounded-xl bg-gray-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 rounded bg-gray-100" />
            <div className="h-3 w-1/4 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======================================================================
   Page
   ====================================================================== */

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const closeForm = useCallback(() => setShowForm(false), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  // `silent` refreshes in the background without swapping the list for a skeleton.
  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
        setLoadFailed(false);
      }
      try {
        const res = await api.get(endpoints.departments.base);
        setDepartments(res.data.data);
      } catch {
        if (silent) notify('Couldn’t refresh the list. Reload the page to see the latest departments.', 'error');
        else setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    load();
  }, [load]);

  // The API returns every department, so search and sorting happen on the client.
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return departments
      .filter((d) => !q || d.name?.toLowerCase().includes(q) || d.code?.toLowerCase().includes(q))
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  }, [departments, search]);

  // Lower-cased names and codes, used by the form to catch duplicates before submitting.
  const taken = useMemo(
    () => ({
      names: new Set(departments.map((d) => d.name?.trim().toLowerCase())),
      codes: new Set(departments.map((d) => d.code?.trim().toLowerCase())),
    }),
    [departments]
  );

  // Throws on failure so the form can show the errors; the form stays open.
  const addDepartment = async (payload) => {
    await api.post(endpoints.departments.base, payload);
    setShowForm(false);
    notify('Department added');
    load({ silent: true });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${endpoints.departments.base}/${deleteTarget.id}`);
      setDepartments((list) => list.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      notify('Department deleted');
    } catch (err) {
      notify(parseApiError(err).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const addButton = (
    <Button onClick={() => setShowForm(true)}>
      <PlusIcon width={16} height={16} />
      Add department
    </Button>
  );

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Manage departments</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">
              Departments used for student profiles and job eligibility.
              {!loading && !loadFailed && (
                <span className="text-gray-400"> {departments.length} in total.</span>
              )}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="w-full shadow-sm sm:w-auto">
            <PlusIcon width={16} height={16} />
            Add department
          </Button>
        </header>

        <div className="relative mb-5 w-full lg:max-w-md">
          <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or code"
            aria-label="Search departments"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <section aria-busy={loading}>
          {loading ? (
            <ListSkeleton />
          ) : loadFailed ? (
            <StateMessage
              role="alert"
              icon={AlertIcon}
              tone="danger"
              title="Couldn’t load departments"
              message="Check your connection and try again."
              action={<Button variant="dark" onClick={() => load()}>Try again</Button>}
            />
          ) : visible.length === 0 ? (
            <StateMessage
              icon={BuildingIcon}
              title={search ? 'No departments match your search' : 'No departments yet'}
              message={search ? 'Try a different name or code.' : 'Add your first department to use it in student profiles and jobs.'}
              action={search ? <Button variant="dark" onClick={() => setSearch('')}>Clear search</Button> : addButton}
            />
          ) : (
            <>
              <p className="sr-only" role="status">{visible.length} departments shown</p>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((d) => (
                  <DepartmentCard key={d.id} department={d} onDelete={setDeleteTarget} />
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      {showForm && <AddDepartmentModal taken={taken} onClose={closeForm} onSubmit={addDepartment} />}
      {deleteTarget && (
        <DeleteDialog department={deleteTarget} busy={deleting} onCancel={closeDelete} onConfirm={confirmDelete} />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}