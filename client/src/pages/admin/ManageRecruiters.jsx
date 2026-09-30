import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function ManageRecruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.admin.recruiters, { params: { page, limit: 10, search: search || undefined } });
      setRecruiters(res.data.data.recruiters);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const verify = async (userId, isVerified) => {
    await api.put(`${endpoints.admin.recruiters}/${userId}`, { is_verified: !isVerified });
    load(pagination.page);
  };

  const toggleStatus = async (userId, current) => {
    const status = current === 'active' ? 'inactive' : 'active';
    await api.put(`${endpoints.admin.recruiters}/${userId}`, { status });
    load(pagination.page);
  };

  const remove = async (userId) => {
    if (!confirm('Remove this recruiter account? This cannot be undone.')) return;
    await api.delete(`${endpoints.admin.recruiters}/${userId}`);
    load(pagination.page);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Recruiters</h1>
      <p className="text-gray-500 mb-6">Verify companies and manage recruiter accounts.</p>

      <input
        className="input max-w-sm mb-6"
        placeholder="Search by company or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <LoadingSpinner />
      ) : recruiters.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No recruiters found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Jobs Posted</th>
                <th className="pb-3 font-medium">Verified</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recruiters.map((r) => (
                <tr key={r.id}>
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{r.company_name}</p>
                    <p className="text-xs text-gray-500">{r.email}</p>
                  </td>
                  <td className="py-3 text-gray-500">{r.job_count}</td>
                  <td className="py-3">
                    {r.is_verified ? <span className="badge bg-green-100 text-green-700">Verified</span> : <span className="badge bg-amber-100 text-amber-700">Unverified</span>}
                  </td>
                  <td className="py-3"><Badge status={r.account_status} /></td>
                  <td className="py-3 text-right space-x-3">
                    <button onClick={() => verify(r.user_id, r.is_verified)} className="text-primary-600 hover:underline">
                      {r.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button onClick={() => toggleStatus(r.user_id, r.account_status)} className="text-primary-600 hover:underline">
                      {r.account_status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => remove(r.user_id)} className="text-red-500 hover:underline">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
    </DashboardLayout>
  );
}
