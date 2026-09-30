import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function CompanyProfile() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      const res = await api.get(endpoints.recruiters.profile);
      setForm(res.data.data);
      setLoading(false);
    })();
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(endpoints.recruiters.profile, form);
      setMsg({ type: 'success', text: 'Company profile updated successfully.' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Company Profile</h1>
      <p className="text-gray-500 mb-6">This information is visible to students browsing your job posts.</p>

      <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />

      <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
        <div>
          <label className="label">Company Name</label>
          <input required className="input" value={form.company_name || ''} onChange={update('company_name')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.company_website || ''} onChange={update('company_website')} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry || ''} onChange={update('industry')} />
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input className="input" value={form.contact_person || ''} onChange={update('contact_person')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone || ''} onChange={update('phone')} />
          </div>
        </div>
        <div>
          <label className="label">Company Description</label>
          <textarea rows={4} className="input" value={form.company_description || ''} onChange={update('company_description')} />
        </div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </DashboardLayout>
  );
}
