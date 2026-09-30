import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const EMPTY_FORM = {
  title: '', description: '', job_type: 'full-time', location: '',
  salary_min: '', salary_max: '', min_cgpa: 0, max_backlogs: 0,
  openings: 1, application_deadline: '', status: 'open',
  department_ids: [], skill_ids: [],
};

export default function PostJob() {
  const { id } = useParams(); // present when editing
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [departments, setDepartments] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const [deptRes, skillRes] = await Promise.all([
          api.get(endpoints.departments.base),
          api.get(endpoints.skills.list),
        ]);
        setDepartments(deptRes.data.data);
        setSkills(skillRes.data.data);

        if (id) {
          const jobRes = await api.get(`${endpoints.jobs.base}/${id}`);
          const job = jobRes.data.data;
          setForm({
            ...job,
            department_ids: (job.eligible_departments || []).map((d) => d.id),
            skill_ids: (job.required_skills || []).map((s) => s.id),
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleMulti = (field, value) => {
    setForm((f) => {
      const current = f[field] || [];
      const exists = current.includes(value);
      return { ...f, [field]: exists ? current.filter((v) => v !== value) : [...current, value] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      if (id) {
        await api.put(`${endpoints.jobs.base}/${id}`, form);
        setMsg({ type: 'success', text: 'Job updated successfully.' });
      } else {
        await api.post(endpoints.jobs.base, form);
        setMsg({ type: 'success', text: 'Job posted successfully.' });
      }
      setTimeout(() => navigate('/recruiter/jobs'), 1000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save job.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{id ? 'Edit Job' : 'Post a New Job'}</h1>
      <p className="text-gray-500 mb-6">Fill in the details below. Eligibility rules apply automatically to student applications.</p>

      <Alert type={msg.type} message={msg.text} />

      <form onSubmit={handleSubmit} className="card space-y-5 max-w-3xl">
        <div>
          <label className="label">Job Title</label>
          <input required className="input" value={form.title} onChange={update('title')} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea required rows={5} className="input" value={form.description} onChange={update('description')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Job Type</label>
            <select className="input" value={form.job_type} onChange={update('job_type')}>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location || ''} onChange={update('location')} />
          </div>
          <div>
            <label className="label">Salary Min (₹/yr)</label>
            <input type="number" className="input" value={form.salary_min || ''} onChange={update('salary_min')} />
          </div>
          <div>
            <label className="label">Salary Max (₹/yr)</label>
            <input type="number" className="input" value={form.salary_max || ''} onChange={update('salary_max')} />
          </div>
          <div>
            <label className="label">Openings</label>
            <input type="number" min="1" className="input" value={form.openings} onChange={update('openings')} />
          </div>
          <div>
            <label className="label">Application Deadline</label>
            <input type="date" className="input" value={form.application_deadline || ''} onChange={update('application_deadline')} />
          </div>
        </div>

        <h3 className="font-semibold text-gray-800 pt-2 border-t border-gray-100">Eligibility Criteria</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Minimum CGPA</label>
            <input type="number" step="0.01" min="0" max="10" className="input" value={form.min_cgpa} onChange={update('min_cgpa')} />
          </div>
          <div>
            <label className="label">Max Allowed Backlogs</label>
            <input type="number" min="0" className="input" value={form.max_backlogs} onChange={update('max_backlogs')} />
          </div>
        </div>

        <div>
          <label className="label">Eligible Departments (leave empty for all)</label>
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => (
              <button
                type="button"
                key={d.id}
                onClick={() => toggleMulti('department_ids', d.id)}
                className={`badge cursor-pointer ${form.department_ids.includes(d.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Required Skills (leave empty for any)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {skills.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleMulti('skill_ids', s.id)}
                className={`badge cursor-pointer ${form.skill_ids.includes(s.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Status</label>
          <select className="input max-w-xs" value={form.status} onChange={update('status')}>
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : id ? 'Update Job' : 'Post Job'}</button>
      </form>
    </DashboardLayout>
  );
}
