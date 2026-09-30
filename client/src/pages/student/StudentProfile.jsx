import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const TABS = ['Profile', 'Skills', 'Education', 'Resume'];

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [tab, setTab] = useState('Profile');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadProfile = async () => {
    const res = await api.get(endpoints.students.profile);
    setProfile(res.data.data);
  };

  useEffect(() => {
    (async () => {
      try {
        const [deptRes] = await Promise.all([api.get(endpoints.departments.base), loadProfile()]);
        setDepartments(deptRes.data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !profile) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">My Profile</h1>
      <p className="text-gray-500 mb-6">Keep your profile updated to get matched with the right jobs.</p>

      <Alert type={msg.type} message={msg.text} onClose={() => setMsg({ type: '', text: '' })} />

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Profile' && (
        <ProfileTab profile={profile} departments={departments} onSaved={(m) => { setMsg(m); loadProfile(); }} />
      )}
      {tab === 'Skills' && (
        <SkillsTab profile={profile} onChange={(m) => { setMsg(m); loadProfile(); }} />
      )}
      {tab === 'Education' && (
        <EducationTab profile={profile} onChange={(m) => { setMsg(m); loadProfile(); }} />
      )}
      {tab === 'Resume' && (
        <ResumeTab profile={profile} onChange={(m) => { setMsg(m); loadProfile(); }} />
      )}
    </DashboardLayout>
  );
}

function ProfileTab({ profile, departments, onSaved }) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    dob: profile.dob || '',
    gender: profile.gender || '',
    department_id: profile.department_id || '',
    batch_year: profile.batch_year || '',
    cgpa: profile.cgpa || '',
    backlogs: profile.backlogs || 0,
    address: profile.address || '',
    linkedin_url: profile.linkedin_url || '',
    github_url: profile.github_url || '',
  });
  const [saving, setSaving] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(endpoints.students.profile, form);
      onSaved({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      onSaved({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-5 max-w-3xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input required className="input" value={form.full_name} onChange={update('full_name')} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={update('phone')} />
        </div>
        <div>
          <label className="label">Date of Birth</label>
          <input type="date" className="input" value={form.dob || ''} onChange={update('dob')} />
        </div>
        <div>
          <label className="label">Gender</label>
          <select className="input" value={form.gender || ''} onChange={update('gender')}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="label">Department</label>
          <select className="input" value={form.department_id || ''} onChange={update('department_id')}>
            <option value="">Select</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Batch Year</label>
          <input type="number" className="input" value={form.batch_year || ''} onChange={update('batch_year')} />
        </div>
        <div>
          <label className="label">CGPA (0-10)</label>
          <input type="number" step="0.01" min="0" max="10" className="input" value={form.cgpa} onChange={update('cgpa')} />
        </div>
        <div>
          <label className="label">Active Backlogs</label>
          <input type="number" min="0" className="input" value={form.backlogs} onChange={update('backlogs')} />
        </div>
        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" value={form.linkedin_url || ''} onChange={update('linkedin_url')} />
        </div>
        <div>
          <label className="label">GitHub URL</label>
          <input className="input" value={form.github_url || ''} onChange={update('github_url')} />
        </div>
      </div>
      <div>
        <label className="label">Address</label>
        <textarea className="input" rows={2} value={form.address || ''} onChange={update('address')} />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function SkillsTab({ profile, onChange }) {
  const [skillName, setSkillName] = useState('');
  const [proficiency, setProficiency] = useState('intermediate');
  const [busy, setBusy] = useState(false);

  const addSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    setBusy(true);
    try {
      await api.post(endpoints.students.skills, { skill_name: skillName.trim(), proficiency });
      setSkillName('');
      onChange({ type: 'success', text: 'Skill added.' });
    } catch (err) {
      onChange({ type: 'error', text: err.response?.data?.message || 'Failed to add skill.' });
    } finally {
      setBusy(false);
    }
  };

  const removeSkill = async (skillId) => {
    await api.delete(`${endpoints.students.skills}/${skillId}`);
    onChange({ type: 'success', text: 'Skill removed.' });
  };

  return (
    <div className="card max-w-3xl">
      <form onSubmit={addSkill} className="flex flex-wrap gap-3 items-end mb-6">
        <div className="flex-1 min-w-[180px]">
          <label className="label">Skill name</label>
          <input className="input" placeholder="e.g. React" value={skillName} onChange={(e) => setSkillName(e.target.value)} />
        </div>
        <div>
          <label className="label">Proficiency</label>
          <select className="input" value={proficiency} onChange={(e) => setProficiency(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <button disabled={busy} className="btn-primary">Add Skill</button>
      </form>

      <div className="flex flex-wrap gap-2">
        {(profile.skills || []).length === 0 && <p className="text-sm text-gray-400">No skills added yet.</p>}
        {(profile.skills || []).map((s) => (
          <span key={s.id} className="badge bg-primary-50 text-primary-700 gap-2 pr-1.5">
            {s.name} <span className="text-primary-400 capitalize">· {s.proficiency}</span>
            <button onClick={() => removeSkill(s.id)} className="ml-1 text-primary-400 hover:text-red-500">&times;</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function EducationTab({ profile, onChange }) {
  const [form, setForm] = useState({ level: 'undergraduate', institution: '', board_or_university: '', field_of_study: '', start_year: '', end_year: '', score: '', score_type: 'percentage' });
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const addEducation = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post(endpoints.students.education, form);
      setForm({ level: 'undergraduate', institution: '', board_or_university: '', field_of_study: '', start_year: '', end_year: '', score: '', score_type: 'percentage' });
      onChange({ type: 'success', text: 'Education record added.' });
    } catch (err) {
      onChange({ type: 'error', text: err.response?.data?.message || 'Failed to add record.' });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`${endpoints.students.education}/${id}`);
    onChange({ type: 'success', text: 'Education record removed.' });
  };

  return (
    <div className="card max-w-3xl">
      <form onSubmit={addEducation} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="label">Level</label>
          <select className="input" value={form.level} onChange={update('level')}>
            <option value="10th">10th</option>
            <option value="12th">12th</option>
            <option value="diploma">Diploma</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>
        <div>
          <label className="label">Institution</label>
          <input required className="input" value={form.institution} onChange={update('institution')} />
        </div>
        <div>
          <label className="label">Board / University</label>
          <input className="input" value={form.board_or_university} onChange={update('board_or_university')} />
        </div>
        <div>
          <label className="label">Field of Study</label>
          <input className="input" value={form.field_of_study} onChange={update('field_of_study')} />
        </div>
        <div>
          <label className="label">Start Year</label>
          <input type="number" className="input" value={form.start_year} onChange={update('start_year')} />
        </div>
        <div>
          <label className="label">End Year</label>
          <input type="number" className="input" value={form.end_year} onChange={update('end_year')} />
        </div>
        <div>
          <label className="label">Score</label>
          <input type="number" step="0.01" className="input" value={form.score} onChange={update('score')} />
        </div>
        <div>
          <label className="label">Score Type</label>
          <select className="input" value={form.score_type} onChange={update('score_type')}>
            <option value="percentage">Percentage</option>
            <option value="cgpa">CGPA</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button disabled={busy} className="btn-primary">Add Record</button>
        </div>
      </form>

      <div className="space-y-3">
        {(profile.education || []).length === 0 && <p className="text-sm text-gray-400">No education records yet.</p>}
        {(profile.education || []).map((e) => (
          <div key={e.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
            <div>
              <p className="font-medium text-sm text-gray-800 capitalize">{e.level} · {e.institution}</p>
              <p className="text-xs text-gray-500">
                {e.field_of_study && `${e.field_of_study} · `}{e.start_year || '—'} to {e.end_year || '—'} · Score: {e.score ?? '—'} {e.score_type}
              </p>
            </div>
            <button onClick={() => remove(e.id)} className="text-red-500 text-sm hover:underline">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResumeTab({ profile, onChange }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      await api.post(endpoints.students.resumes, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null);
      onChange({ type: 'success', text: 'Resume uploaded successfully.' });
    } catch (err) {
      onChange({ type: 'error', text: err.response?.data?.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id) => {
    await api.delete(`${endpoints.students.resumes}/${id}`);
    onChange({ type: 'success', text: 'Resume deleted.' });
  };

  return (
    <div className="card max-w-3xl">
      <form onSubmit={upload} className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="label">Upload Resume (PDF, DOC, DOCX — max 5MB)</label>
          <input type="file" accept=".pdf,.doc,.docx" className="input" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button disabled={uploading || !file} className="btn-primary">{uploading ? 'Uploading...' : 'Upload'}</button>
      </form>

      <div className="space-y-2">
        {(profile.resumes || []).length === 0 && <p className="text-sm text-gray-400">No resumes uploaded yet.</p>}
        {(profile.resumes || []).map((r) => (
          <div key={r.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
            <div>
              <p className="font-medium text-sm text-gray-800">{r.file_name} {r.is_primary ? <span className="badge bg-green-100 text-green-700 ml-2">Primary</span> : null}</p>
              <p className="text-xs text-gray-500">Uploaded {new Date(r.uploaded_at).toLocaleDateString()}</p>
            </div>
            <button onClick={() => remove(r.id)} className="text-red-500 text-sm hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
