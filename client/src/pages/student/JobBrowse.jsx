import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function JobBrowse() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [filters, setFilters] = useState({ search: '', job_type: '', location: '' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.jobs.base, {
        params: { page, limit: 9, ...filters },
      });
      setJobs(res.data.data.jobs);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(1); }, [load]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Jobs</h1>
      <p className="text-gray-500 mb-6">Find opportunities that match your profile.</p>

      <div className="card mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <input
          className="input sm:col-span-2"
          placeholder="Search by title, company, description..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select className="input" value={filters.job_type} onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}>
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="internship">Internship</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>
        <input
          className="input"
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No jobs match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Link key={job.id} to={`/student/jobs/${job.id}`} className="card hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                {job.is_eligible ? (
                  <span className="badge bg-green-100 text-green-700 shrink-0">Eligible</span>
                ) : (
                  <span className="badge bg-gray-100 text-gray-500 shrink-0">Not eligible</span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3">{job.company_name} · {job.location || 'Remote'}</p>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{job.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(job.required_skills || []).slice(0, 3).map((s) => (
                  <span key={s.id} className="badge bg-gray-100 text-gray-600">{s.name}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                <span className="capitalize">{job.job_type}</span>
                <span>{job.applicant_count} applicant{job.applicant_count === 1 ? '' : 's'}</span>
              </div>
              {job.application_status && (
                <div className="mt-2">
                  <span className="badge bg-primary-50 text-primary-700 capitalize">You: {job.application_status}</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />
    </DashboardLayout>
  );
}
