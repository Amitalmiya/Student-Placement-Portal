import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const AUDIENCES = [
  { value: 'all', label: 'Everyone', hint: 'Visible to students and recruiters.' },
  { value: 'student', label: 'Students', hint: 'Only students will be notified.' },
  { value: 'recruiter', label: 'Recruiters', hint: 'Only recruiters will be notified.' },
];

const AUDIENCE_STYLES = {
  all: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  student: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  recruiter: 'bg-amber-50 text-amber-700 ring-amber-200',
};

const AUDIENCE_LABELS = { all: 'Everyone', student: 'Students', recruiter: 'Recruiters' };

const FIELD =
  'block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-sm transition focus:border-indigo-500 focus:outline-none ' +
  'focus:ring-4 focus:ring-indigo-500/15';

const formatDate = (value) =>
  new Date(value).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all' });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.announcements.base, { params: { page, limit: 10 } });
      setAnnouncements(res.data.data.announcements);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post(endpoints.announcements.base, form);
      setForm({ title: '', content: '', target_role: 'all' });
      setMsg({ type: 'success', text: 'Announcement posted and notifications sent.' });
      load(1);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to post announcement.' });
    } finally {
      setPosting(false);
    }
  };

  const remove = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`${endpoints.announcements.base}/${id}`);
      setConfirmId(null);
      setMsg({ type: 'success', text: 'Announcement deleted.' });
      // If the last item on a later page was removed, step back one page.
      const nextPage =
        announcements.length === 1 && pagination.page > 1 ? pagination.page - 1 : pagination.page;
      await load(nextPage);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to delete announcement.' });
    } finally {
      setDeletingId(null);
    }
  };

  const audience = AUDIENCES.find((a) => a.value === form.target_role);

  return (
    <DashboardLayout>
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Announcements
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Share placement updates with students, recruiters, or both. Everyone in the chosen
            audience is notified when you post.
          </p>
        </header>

        <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />

        <div className="mt-4 grid grid-cols-1 items-start gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Composer */}
          <section
            aria-labelledby="compose-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:col-span-2"
          >
            <h2 id="compose-heading" className="text-base font-semibold text-slate-900">
              New announcement
            </h2>

            <form onSubmit={handlePost} className="mt-5 space-y-5">
              <div>
                <label htmlFor="ann-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="ann-title"
                  required
                  className={FIELD}
                  placeholder="e.g. Campus drive registrations are open"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <label htmlFor="ann-content" className="block text-sm font-medium text-slate-700">
                    Message
                  </label>
                  <span className="text-xs tabular-nums text-slate-400">{form.content.length} characters</span>
                </div>
                <textarea
                  id="ann-content"
                  required
                  rows={5}
                  className={`${FIELD} resize-y`}
                  placeholder="Write the details people need to act on."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <fieldset>
                <legend className="mb-1.5 text-sm font-medium text-slate-700">Send to</legend>
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                  {AUDIENCES.map((a) => (
                    <label key={a.value} className="relative">
                      <input
                        type="radio"
                        name="target_role"
                        value={a.value}
                        checked={form.target_role === a.value}
                        onChange={() => setForm({ ...form, target_role: a.value })}
                        className="peer sr-only"
                      />
                      <span className="block cursor-pointer rounded-lg px-2 py-2 text-center text-sm font-medium text-slate-600 transition hover:text-slate-900 peer-checked:bg-white peer-checked:text-indigo-700 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500">
                        {a.label}
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-500">{audience?.hint}</p>
              </fieldset>

              <button
                type="submit"
                disabled={posting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {posting && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.3" strokeWidth="4" />
                    <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )}
                {posting ? 'Posting...' : 'Post announcement'}
              </button>
            </form>
          </section>

          {/* Feed */}
          <section aria-labelledby="feed-heading" className="lg:col-span-3">
            <h2 id="feed-heading" className="mb-3 text-base font-semibold text-slate-900">
              Posted announcements
            </h2>

            {loading ? (
              <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-16">
                <LoadingSpinner />
              </div>
            ) : announcements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
                    <path d="M16 8.5a5 5 0 0 1 0 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-900">No announcements yet</p>
                <p className="mt-1 text-sm text-slate-500">Write your first update using the form.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {announcements.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <h3 className="break-words text-base font-semibold text-slate-900">{a.title}</h3>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              AUDIENCE_STYLES[a.target_role] || AUDIENCE_STYLES.all
                            }`}
                          >
                            {AUDIENCE_LABELS[a.target_role] || a.target_role}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                          {a.content}
                        </p>
                        <p className="mt-3 text-xs text-slate-400">
                          <time dateTime={a.created_at}>{formatDate(a.created_at)}</time>
                        </p>
                      </div>

                      <div className="shrink-0">
                        {confirmId === a.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              disabled={deletingId === a.id}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(a.id)}
                              disabled={deletingId === a.id}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-60"
                            >
                              {deletingId === a.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmId(a.id)}
                            aria-label={`Delete announcement: ${a.title}`}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6">
              <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}