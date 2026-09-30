import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Badge from '../../components/Badge.jsx';
import Pagination from '../../components/Pagination.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(endpoints.admin.students, { params: { page, limit: 10, search: search || undefined } });
      setStudents(res.data.data.students);
      setPagination(res.data.data.pagination);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1); }, [load]);

  const toggleStatus = async (userId, current) => {
    const status = current === 'active' ? 'inactive' : 'active';
    await api.put(`${endpoints.admin.students}/${userId}`, { status });
    load(pagination.page);
  };

  const remove = async (userId) => {
    if (!confirm('Remove this student account? This cannot be undone.')) return;
    await api.delete(`${endpoints.admin.students}/${userId}`);
    load(pagination.page);
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Students</h1>
      <p className="text-gray-500 mb-6">View and manage all registered students.</p>

      <input
        className="input max-w-sm mb-6"
        placeholder="Search by name, roll number, or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <LoadingSpinner />
      ) : students.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No students found.</div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Roll No.</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">CGPA</th>
                <th className="pb-3 font-medium">Placed</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="py-3">
                    <p className="font-medium text-gray-800">{s.full_name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                  </td>
                  <td className="py-3 text-gray-500">{s.roll_number}</td>
                  <td className="py-3 text-gray-500">{s.department_name || '—'}</td>
                  <td className="py-3 text-gray-500">{s.cgpa}</td>
                  <td className="py-3">{s.is_placed ? <span className="badge bg-green-100 text-green-700">Placed</span> : <span className="badge bg-gray-100 text-gray-500">Not Placed</span>}</td>
                  <td className="py-3"><Badge status={s.account_status} /></td>
                  <td className="py-3 text-right space-x-3">
                    <button onClick={() => toggleStatus(s.user_id, s.account_status)} className="text-primary-600 hover:underline">
                      {s.account_status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => remove(s.user_id)} className="text-red-500 hover:underline">Remove</button>
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
