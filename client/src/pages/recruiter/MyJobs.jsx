import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.jobs.base, { params: { page, limit: 10 } });
      setJobs(res.data.data.jobs);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (jobId) => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    await api.delete(`${endpoints.jobs.base}/${jobId}`);
    load(pagination.page);
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Job Posts</h1>
          <p className="text-gray-500">Manage all jobs you've posted.</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary">+ Post a Job</Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">You haven't posted any jobs yet.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Applicants</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Deadline</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="py-3 font-medium text-gray-800">{j.title}</td>
                  <td className="py-3 text-gray-500 capitalize">{j.job_type}</td>
                  <td className="py-3">
                    <Link to={`/recruiter/jobs/${j.id}/applicants`} className="text-primary-600 hover:underline">
                      {j.applicant_count} applicant(s)
                    </Link>
                  </td>
                  <td className="py-3"><Badge status={j.status} /></td>
                  <td className="py-3 text-gray-500">{j.application_deadline ? new Date(j.application_deadline).toLocaleDateString() : '—'}</td>
                  <td className="py-3 text-right space-x-3">
                    <Link to={`/recruiter/post-job/${j.id}`} className="text-primary-600 hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(j.id)} className="text-red-500 hover:underline">Delete</button>
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
