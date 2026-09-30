import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

/* ======================================================================
   Config
   ====================================================================== */

const PAGE_SIZE = 10;
const FORM_ID = 'announcement'; // prefix for form field ids
const LIMITS = { title: 150, content: 2000 }; // adjust to match your backend rules
const PREVIEW_CHARS = 280; // longer messages are collapsed behind "Show more"

const AUDIENCES = [
  { value: 'all', label: 'Everyone', hint: 'Visible to students and recruiters.' },
  { value: 'student', label: 'Students', hint: 'Only students will be notified.' },
  { value: 'recruiter', label: 'Recruiters', hint: 'Only recruiters will be notified.' },
];
const AUDIENCE_LABELS = Object.fromEntries(AUDIENCES.map((a) => [a.value, a.label]));
const AUDIENCE_STYLES = {
  all: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  student: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  recruiter: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const EMPTY_FORM = { title: '', content: '', target_role: 'all' };
const FIELD_ORDER = ['title', 'content'];

// Each validator returns an error message, or '' when the value is valid.
const VALIDATORS = {
  title: (v) => (v.trim() ? '' : 'Enter a title.'),
  content: (v) => (v.trim() ? '' : 'Write the message you want to send.'),
};

const buildPayload = (f) => ({ title: f.title.trim(), content: f.content.trim(), target_role: f.target_role });

/* ======================================================================
   Helpers
   ====================================================================== */

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const formatDate = (value) => {
  const d = new Date(value);
  return value && !Number.isNaN(d.getTime()) ? dateFormatter.format(d) : '';
};

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

const PlusIcon = makeIcon(<path d="M12 5v14M5 12h14" />);
const CloseIcon = makeIcon(<path d="M18 6 6 18M6 6l12 12" />);
const TrashIcon = makeIcon(<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />);
const AlertIcon = makeIcon(<><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></>);
const MegaphoneIcon = makeIcon(<><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" /><path d="M16 8.5a5 5 0 0 1 0 7" /></>);

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

// Renders an <input> by default, or a <textarea> with as="textarea".
function TextField({ as: Tag = 'input', name, label, error, required, counter, ...rest }) {
  const id = `${FORM_ID}-${name}`;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500" aria-hidden="true"> *</span>}
        </label>
        {counter && (
          <span className="text-xs tabular-nums text-gray-400" aria-hidden="true">
            {counter.count}/{counter.max}
          </span>
        )}
      </div>
      <Tag
        id={id}
        name={name}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputCls(error)}
        {...rest}
      />
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/* ======================================================================
   Compose announcement
   ====================================================================== */

function ComposeModal({ onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const dirty = Object.keys(EMPTY_FORM).some((k) => form[k] !== EMPTY_FORM[k]);
  const audience = AUDIENCES.find((a) => a.value === form.target_role);

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
    document.getElementById(`${FORM_ID}-title`)?.focus();
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    const next = Object.fromEntries(FIELD_ORDER.map((k) => [k, VALIDATORS[k](form[k])]));
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
      title="New announcement"
      titleId="compose-announcement-title"
      description="Everyone in the chosen audience is notified when you post."
      onClose={onClose}
      busy={saving}
    >
      <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          {formError && (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <TextField
            {...bind('title')}
            label="Title"
            required
            autoFocus
            autoComplete="off"
            maxLength={LIMITS.title}
            placeholder="e.g. Campus drive registrations are open"
          />

          <TextField
            {...bind('content')}
            as="textarea"
            rows={6}
            label="Message"
            required
            maxLength={LIMITS.content}
            counter={{ count: form.content.length, max: LIMITS.content }}
            placeholder="Write the details people need to act on."
            className={`${inputCls(errors.content)} resize-y`}
          />

          <fieldset aria-describedby={`${FORM_ID}-audience-hint`}>
            <legend className="mb-1.5 text-sm font-medium text-gray-700">Send to</legend>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
              {AUDIENCES.map((a) => (
                <label key={a.value} className="relative">
                  <input
                    type="radio"
                    name="target_role"
                    value={a.value}
                    checked={form.target_role === a.value}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <span className="block cursor-pointer rounded-lg px-2 py-2 text-center text-sm font-medium text-gray-600 transition hover:text-gray-900 peer-checked:bg-white peer-checked:text-indigo-700 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500">
                    {a.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.target_role ? (
              <p className="mt-2 text-sm text-red-600">{errors.target_role}</p>
            ) : (
              <p id={`${FORM_ID}-audience-hint`} className="mt-2 text-xs text-gray-500">{audience?.hint}</p>
            )}
          </fieldset>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Button variant="subtle" onClick={reset} disabled={saving || (!dirty && !formError && !Object.values(errors).some(Boolean))}>
            Reset form
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post announcement'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function DeleteDialog({ announcement, busy, onCancel, onConfirm }) {
  return (
    <Modal title="Delete this announcement?" titleId="delete-announcement-title" onClose={onCancel} busy={busy} dismissOnBackdrop>
      <p className="px-5 py-5 text-sm text-gray-500 sm:px-6">
        <span className="font-medium text-gray-800">{announcement.title}</span> will be deleted permanently.
        This can’t be undone.
      </p>
      <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="secondary" autoFocus onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete announcement'}</Button>
      </div>
    </Modal>
  );
}

/* ======================================================================
   Feed (cards are memoised so unrelated state changes don't re-render them)
   ====================================================================== */

const AnnouncementCard = memo(function AnnouncementCard({ announcement: a, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const content = a.content ?? '';
  const isLong = content.length > PREVIEW_CHARS;
  const text = isLong && !expanded ? `${content.slice(0, PREVIEW_CHARS).trimEnd()}…` : content;

  return (
    <li className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h3 className="break-words text-base font-semibold text-gray-900">{a.title}</h3>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${AUDIENCE_STYLES[a.target_role] || AUDIENCE_STYLES.all}`}>
          {AUDIENCE_LABELS[a.target_role] || a.target_role}
        </span>
      </div>

      <p className="mt-2 max-w-3xl whitespace-pre-line break-words text-sm leading-6 text-gray-600">{text}</p>
      {isLong && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 rounded text-sm font-medium text-indigo-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <time dateTime={a.created_at} className="text-xs text-gray-400">{formatDate(a.created_at)}</time>
        <Button size="sm" variant="subtleDanger" onClick={() => onDelete(a)} aria-label={`Delete announcement: ${a.title}`}>
          <TrashIcon width={16} height={16} />
          Delete
        </Button>
      </div>
    </li>
  );
});

function FeedSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading announcements">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5">
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          <div className="mt-3 h-3 w-full rounded bg-gray-100" />
          <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
          <div className="mt-5 h-3 w-24 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

/* ======================================================================
   Page
   ====================================================================== */

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const requestId = useRef(0);

  const notify = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const openForm = useCallback(() => setShowForm(true), []);
  const closeForm = useCallback(() => setShowForm(false), []);
  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  const load = useCallback(async (page = 1) => {
    const id = ++requestId.current; // ignore out-of-order responses
    setLoading(true);
    setLoadFailed(false);
    try {
      const res = await api.get(endpoints.announcements.base, { params: { page, limit: PAGE_SIZE } });
      if (id !== requestId.current) return;
      setAnnouncements(res.data.data.announcements);
      setPagination(res.data.data.pagination);
    } catch {
      if (id === requestId.current) setLoadFailed(true);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  // Throws on failure so the form can show the errors; the form stays open.
  const postAnnouncement = async (payload) => {
    await api.post(endpoints.announcements.base, payload);
    setShowForm(false);
    notify('Announcement posted and notifications sent.');
    load(1);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`${endpoints.announcements.base}/${deleteTarget.id}`);
      setDeleteTarget(null);
      notify('Announcement deleted.');
      // If that was the last item on this page, step back one page.
      load(announcements.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page);
    } catch (err) {
      notify(parseApiError(err).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const hasTotal = typeof pagination.total === 'number';

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Announcements</h1>
            <p className="mt-1 max-w-xl text-sm text-gray-500 sm:text-base">
              Share placement updates with students, recruiters, or both.
              {hasTotal && !loading && <span className="text-gray-400"> {pagination.total} posted.</span>}
            </p>
          </div>
          <Button onClick={openForm} className="w-full shadow-sm sm:w-auto">
            <PlusIcon width={16} height={16} />
            New announcement
          </Button>
        </header>

        <section aria-busy={loading} aria-label="Posted announcements">
          {loading ? (
            <FeedSkeleton />
          ) : loadFailed ? (
            <StateMessage
              role="alert"
              icon={AlertIcon}
              tone="danger"
              title="Couldn’t load announcements"
              message="Check your connection and try again."
              action={<Button variant="dark" onClick={() => load(1)}>Try again</Button>}
            />
          ) : announcements.length === 0 ? (
            <StateMessage
              icon={MegaphoneIcon}
              title="No announcements yet"
              message="Post your first update to notify students and recruiters."
              action={
                <Button onClick={openForm}>
                  <PlusIcon width={16} height={16} />
                  New announcement
                </Button>
              }
            />
          ) : (
            <ul className="space-y-3">
              {announcements.map((a) => (
                <AnnouncementCard key={a.id} announcement={a} onDelete={setDeleteTarget} />
              ))}
            </ul>
          )}
        </section>

        {!loading && !loadFailed && pagination.total_pages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
          </div>
        )}
      </div>

      {showForm && <ComposeModal onClose={closeForm} onSubmit={postAnnouncement} />}
      {deleteTarget && (
        <DeleteDialog announcement={deleteTarget} busy={deleting} onCancel={closeDelete} onConfirm={confirmDelete} />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}