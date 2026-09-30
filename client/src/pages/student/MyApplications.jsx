import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import Modal from '../../components/Modal.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const STAGES = ['applied', 'shortlisted', 'interview', 'selected', 'rejected'];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [historyApp, setHistoryApp] = useState(null);
  const [history, setHistory] = useState([]);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.applications.base, { params: { page, limit: 10, status: status || undefined } });
      setApplications(res.data.data.applications);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(1); }, [load]);

  const openHistory = async (app) => {
    setHistoryApp(app);
    const res = await api.get(`${endpoints.applications.base}/${app.id}/history`);
    setHistory(res.data.data);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Applications</h1>
      <p className="text-gray-500 mb-6">Track the status of every job you've applied to.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setStatus('')} className={`btn ${status === '' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All</button>
        {STAGES.map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`btn capitalize ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : applications.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No applications found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Job</th>
                <th className="pb-3 font-medium">Company</th>
                <th className="pb-3 font-medium">Applied On</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {applications.map((a) => (
                <tr key={a.id}>
                  <td className="py-3">
                    <Link to={`/student/jobs/${a.job_id}`} className="font-medium text-gray-800 hover:text-primary-600">{a.job_title}</Link>
                  </td>
                  <td className="py-3 text-gray-500">{a.company_name}</td>
                  <td className="py-3 text-gray-500">{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td className="py-3"><Badge status={a.status} /></td>
                  <td className="py-3">
                    <button onClick={() => openHistory(a)} className="text-primary-600 text-xs hover:underline">View Timeline</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.total_pages} onChange={load} />

      <Modal open={!!historyApp} onClose={() => setHistoryApp(null)} title={historyApp ? `Timeline: ${historyApp.job_title}` : ''}>
        <ol className="relative border-l border-gray-200 ml-2">
          {history.map((h) => (
            <li key={h.id} className="mb-6 ml-4">
              <div className="absolute w-2.5 h-2.5 bg-primary-500 rounded-full -left-[5px] mt-1.5" />
              <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleString()}</p>
              <p className="text-sm font-medium capitalize text-gray-800">{h.status}</p>
              {h.remarks && <p className="text-xs text-gray-500 mt-0.5">{h.remarks}</p>}
            </li>
          ))}
        </ol>
      </Modal>
    </DashboardLayout>
  );
}
