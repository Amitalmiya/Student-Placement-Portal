import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function ManageDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = async () => {
    const res = await api.get(endpoints.departments.base);
    setDepartments(res.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoints.departments.base, form);
      setForm({ name: '', code: '' });
      setMsg({ type: 'success', text: 'Department added.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to add department.' });
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this department? Students assigned to it will be unassigned.')) return;
    await api.delete(`${endpoints.departments.base}/${id}`);
    load();
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Departments</h1>
      <p className="text-gray-500 mb-6">Departments used for student profiles and job eligibility.</p>

      <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />

      <form onSubmit={handleAdd} className="card flex flex-wrap items-end gap-3 mb-6 max-w-xl">
        <div className="flex-1 min-w-[160px]">
          <label className="label">Department Name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="w-32">
          <label className="label">Code</label>
          <input required className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        </div>
        <button className="btn-primary">Add</button>
      </form>

      <div className="card max-w-xl">
        <ul className="divide-y divide-gray-100">
          {departments.map((d) => (
            <li key={d.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{d.name}</p>
                <p className="text-xs text-gray-500">{d.code}</p>
              </div>
              <button onClick={() => remove(d.id)} className="text-red-500 text-sm hover:underline">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </DashboardLayout>
  );
}
