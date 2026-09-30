import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.jobs.base, {
        params: { page, limit: 10, search: search || undefined, status: status || undefined },
      });
      setJobs(res.data.data.jobs);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(1); }, [load]);

  const remove = async (jobId) => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    await api.delete(`${endpoints.jobs.base}/${jobId}`);
    load(pagination.page);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Jobs</h1>
      <p className="text-gray-500 mb-6">Oversight of every job posted across all recruiters.</p>

      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input max-w-sm" placeholder="Search jobs..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input max-w-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No jobs found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Applicants</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="py-3 font-medium text-gray-800">{j.title}</td>
                  <td className="py-3 text-gray-500">{j.company_name}</td>
                  <td className="py-3 text-gray-500">{j.applicant_count}</td>
                  <td className="py-3"><Badge status={j.status} /></td>
                  <td className="py-3 text-right">
                    <button onClick={() => remove(j.id)} className="text-red-500 hover:underline">Delete</button>
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
