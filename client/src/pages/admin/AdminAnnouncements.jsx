import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all' });
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
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

  useEffect(() => { load(1); }, [load]);

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
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
    if (!confirm('Delete this announcement?')) return;
    await api.delete(`${endpoints.announcements.base}/${id}`);
    load(pagination.page);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Announcements</h1>
      <p className="text-gray-500 mb-6">Broadcast updates to students and/or recruiters.</p>

      <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />

      <form onSubmit={handlePost} className="card space-y-4 max-w-2xl mb-8">
        <div>
          <label className="label">Title</label>
          <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea required rows={4} className="input" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>
        <div>
          <label className="label">Audience</label>
          <select className="input max-w-xs" value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}>
            <option value="all">Everyone</option>
            <option value="student">Students Only</option>
            <option value="recruiter">Recruiters Only</option>
          </select>
        </div>
        <button disabled={posting} className="btn-primary">{posting ? 'Posting...' : 'Post Announcement'}</button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <span className="badge bg-gray-100 text-gray-600 capitalize">{a.target_role}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{a.content}</p>
                <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => remove(a.id)} className="text-red-500 text-sm hover:underline shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
    </DashboardLayout>
  );
}
