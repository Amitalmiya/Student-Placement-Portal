import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function AnnouncementsView() {
  const [announcements, setAnnouncements] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Announcements</h1>
      <p className="text-gray-500 mb-6">Updates from the placement office.</p>

      {loading ? (
        <LoadingSpinner />
      ) : announcements.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No announcements yet.</div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{a.title}</h3>
                <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{a.content}</p>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
    </DashboardLayout>
  );
}
