import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

export default function RecruiterDashboard() {
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, jobsRes, appsRes] = await Promise.all([
          api.get(endpoints.recruiters.profile),
          api.get(endpoints.jobs.base, { params: { limit: 5 } }),
          api.get(endpoints.applications.base, { params: { limit: 5 } }),
        ]);
        setProfile(profileRes.data.data);
        setJobs(jobsRes.data.data.jobs);
        setApplications(appsRes.data.data.applications);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const openJobs = jobs.filter((j) => j.status === 'open').length;
  const totalApplicants = jobs.reduce((sum, j) => sum + Number(j.applicant_count || 0), 0);
  const selected = applications.filter((a) => a.status === 'selected').length;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {profile?.company_name} 👋</h1>
      <p className="text-gray-500 mb-6">
        {profile?.is_verified ? 'Your company profile is verified.' : 'Your account is pending admin verification.'}
      </p>

      {!profile?.is_verified && (
        <div className="card mb-6 bg-amber-50 border-amber-100 text-amber-800 text-sm">
          Your recruiter account is awaiting verification by the placement office. Some actions may be limited until approved.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Jobs Posted" value={jobs.length} icon="💼" accent="primary" />
        <StatCard label="Open Positions" value={openJobs} icon="📢" accent="green" />
        <StatCard label="Total Applicants" value={totalApplicants} icon="🧑‍🎓" accent="purple" />
        <StatCard label="Candidates Selected" value={selected} icon="🏆" accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your Recent Job Posts</h2>
            <Link to="/recruiter/jobs" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">You haven't posted any jobs yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {jobs.map((j) => (
                <li key={j.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{j.title}</p>
                    <p className="text-xs text-gray-500">{j.applicant_count} applicant(s)</p>
                  </div>
                  <Badge status={j.status} />
                </li>
              ))}
            </ul>
          )}
          <Link to="/recruiter/post-job" className="btn-primary w-full mt-4 justify-center">+ Post a New Job</Link>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Applicants</h2>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No applicants yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {applications.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.student_name}</p>
                    <p className="text-xs text-gray-500">{a.job_title} · CGPA {a.cgpa}</p>
                  </div>
                  <Badge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
