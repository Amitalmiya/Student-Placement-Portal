import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import Alert from '../../components/Alert.jsx';
import Badge from '../../components/Badge.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [applied, setApplied] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [jobRes, eligRes] = await Promise.all([
        api.get(`${endpoints.jobs.base}/${id}`),
        api.get(`${endpoints.jobs.base}/${id}/eligibility`),
      ]);
      setJob(jobRes.data.data);
      setEligibility(eligRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleApply = async () => {
    setApplying(true);
    setMsg({ type: '', text: '' });
    try {
      await api.post(endpoints.applications.base, { job_id: Number(id), cover_letter: coverLetter });
      setMsg({ type: 'success', text: 'Application submitted successfully!' });
      setApplied(true);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to apply.' });
    } finally {
      setApplying(false);
    }
  };

  if (loading || !job) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Link to="/student/jobs" className="text-sm text-primary-600 hover:underline mb-4 inline-block">&larr; Back to jobs</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <Badge status={job.status} />
            </div>
            <p className="text-gray-500 mb-4">{job.company_name} · {job.location || 'Remote'} · <span className="capitalize">{job.job_type}</span></p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Salary</p>
                <p className="font-semibold">{job.salary_min ? `₹${Number(job.salary_min).toLocaleString()} - ₹${Number(job.salary_max).toLocaleString()}` : 'Not disclosed'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Openings</p>
                <p className="font-semibold">{job.openings}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Min CGPA</p>
                <p className="font-semibold">{job.min_cgpa}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Deadline</p>
                <p className="font-semibold">{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'Open'}</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">Job Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line mb-5">{job.description}</p>

            <h3 className="font-semibold text-gray-800 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2 mb-5">
              {(job.required_skills || []).map((s) => <span key={s.id} className="badge bg-primary-50 text-primary-700">{s.name}</span>)}
              {(job.required_skills || []).length === 0 && <p className="text-sm text-gray-400">No specific skills listed.</p>}
            </div>

            <h3 className="font-semibold text-gray-800 mb-2">Eligible Departments</h3>
            <div className="flex flex-wrap gap-2">
              {(job.eligible_departments || []).map((d) => <span key={d.id} className="badge bg-gray-100 text-gray-600">{d.name}</span>)}
              {(job.eligible_departments || []).length === 0 && <p className="text-sm text-gray-400">Open to all departments.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Eligibility Check</h3>
            {eligibility && (
              <ul className="space-y-2 text-sm">
                <EligRow label="CGPA" passed={eligibility.checks.cgpa.passed} detail={`You: ${eligibility.checks.cgpa.actual} / Req: ${eligibility.checks.cgpa.required}`} />
                <EligRow label="Backlogs" passed={eligibility.checks.backlogs.passed} detail={`You: ${eligibility.checks.backlogs.actual} / Max: ${eligibility.checks.backlogs.max_allowed}`} />
                <EligRow label="Department" passed={eligibility.checks.department.passed} />
                <EligRow label="Skills" passed={eligibility.checks.skills.passed} detail={`Matched ${eligibility.checks.skills.matched_count} skill(s)`} />
              </ul>
            )}
            <div className={`mt-4 rounded-lg p-3 text-sm font-medium text-center ${eligibility?.is_eligible ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {eligibility?.is_eligible ? 'You are eligible to apply' : 'You do not meet all criteria'}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Apply Now</h3>
            <Alert type={msg.type} message={msg.text} />
            {job.application_status || applied ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-2">You've already applied to this job.</p>
                <Badge status={job.application_status || 'applied'} />
              </div>
            ) : (
              <>
                <textarea
                  className="input mb-3"
                  rows={4}
                  placeholder="Optional cover letter..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <button
                  onClick={handleApply}
                  disabled={applying || !eligibility?.is_eligible}
                  className="btn-primary w-full"
                >
                  {applying ? 'Submitting...' : 'Apply Now'}
                </button>
                {!eligibility?.is_eligible && (
                  <p className="text-xs text-gray-400 mt-2 text-center">Complete eligibility criteria to apply.</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function EligRow({ label, passed, detail }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`text-xs font-medium ${passed ? 'text-green-600' : 'text-red-500'}`}>
        {passed ? '✓' : '✗'} {detail}
      </span>
    </li>
  );
}
