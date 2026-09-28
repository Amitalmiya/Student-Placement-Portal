import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import StatCard from '../../components/StatCard.jsx';
import Badge from '../../components/Badge.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, appsRes, jobsRes] = await Promise.all([
          api.get(endpoints.students.profile),
          api.get(endpoints.applications.base, { params: { limit: 5 } }),
          api.get(endpoints.jobs.base, { params: { limit: 5 } }),
        ]);
        setProfile(profileRes.data.data);
        setApplications(appsRes.data.data.applications);
        setJobs(jobsRes.data.data.jobs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const profileCompletion = profile
    ? Math.round(
        (['full_name', 'phone', 'department_id', 'cgpa', 'address'].filter((f) => profile[f]).length / 5) * 60 +
          (profile.skills?.length > 0 ? 20 : 0) +
          (profile.resumes?.length > 0 ? 20 : 0)
      )
    : 0;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
      </h1>
      <p className="text-gray-500 mb-6">Here's what's happening with your placement journey.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="CGPA" value={profile?.cgpa ?? '—'} icon="🎓" accent="primary" />
        <StatCard label="Backlogs" value={profile?.backlogs ?? 0} icon="📚" accent="amber" />
        <StatCard label="Applications" value={applications.length} icon="📋" accent="purple" />
        <StatCard label="Profile Complete" value={`${profileCompletion}%`} icon="✅" accent="green" />
      </div>

      {profileCompletion < 100 && (
        <div className="card mb-8 flex items-center justify-between bg-amber-50 border-amber-100">
          <div>
            <p className="font-medium text-amber-800">Your profile is {profileCompletion}% complete</p>
            <p className="text-sm text-amber-700">Complete your profile to improve job eligibility matches.</p>
          </div>
          <Link to="/student/profile" className="btn-primary shrink-0">Complete Profile</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/student/applications" className="text-sm text-primary-600 hover:underline">View all</Link>
          </div>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No applications yet. Start applying!</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {applications.map((a) => (
                <li key={a.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.job_title}</p>
                    <p className="text-xs text-gray-500">{a.company_name}</p>
                  </div>
                  <Badge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Latest Job Openings</h2>
            <Link to="/student/jobs" className="text-sm text-primary-600 hover:underline">Browse all</Link>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No jobs available right now.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {jobs.map((j) => (
                <li key={j.id} className="py-3 flex items-center justify-between">
                  <div>
                    <Link to={`/student/jobs/${j.id}`} className="font-medium text-gray-800 text-sm hover:text-primary-600">
                      {j.title}
                    </Link>
                    <p className="text-xs text-gray-500">{j.company_name} · {j.location || 'Remote'}</p>
                  </div>
                  {j.is_eligible ? (
                    <span className="badge bg-green-100 text-green-700">Eligible</span>
                  ) : (
                    <span className="badge bg-gray-100 text-gray-500">Not eligible</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
