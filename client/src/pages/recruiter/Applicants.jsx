import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import Alert from '../../components/Alert.jsx';
import { API_BASE_URL } from '../../api/axios.js';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const STATUSES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];
const BACKEND_ROOT = API_BASE_URL.replace(/\/api$/, '');

export default function Applicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.applications.base, {
        params: { page, limit: 10, job_id: jobId || undefined, status: statusFilter || undefined },
      });
      setApplications(res.data.data.applications);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [jobId, statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`${endpoints.applications.base}/${applicationId}/status`, { status });
      setMsg({ type: 'success', text: `Application marked as ${status}.` });
      load(pagination.page);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update status.' });
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Applicants</h1>
      <p className="text-gray-500 mb-6">{jobId ? 'Applicants for this job posting.' : 'All applicants across your job posts.'}</p>

      <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatusFilter('')} className={`btn ${statusFilter === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`btn capitalize ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : applications.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No applicants found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Candidate</th>
                <th className="pb-3 font-medium">Job</th>
                <th className="pb-3 font-medium">CGPA</th>
                <th className="pb-3 font-medium">Resume</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{a.student_name}</p>
                    <p className="text-xs text-gray-500">{a.roll_number}</p>
                  </td>
                  <td className="py-3 text-gray-500">{a.job_title}</td>
                  <td className="py-3 text-gray-500">{a.cgpa}</td>
                  <td className="py-3">
                    {a.resume_path ? (
                      <a href={`${BACKEND_ROOT}/${a.resume_path}`} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">View</a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3"><Badge status={a.status} /></td>
                  <td className="py-3">
                    <select
                      className="input py-1.5 text-xs"
                      value={a.status}
                      onChange={(e) => updateStatus(a.id, e.target.value)}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
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
