import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import StatCard from '../../components/StatCard.jsx';
import api from '../../api/axios.js';
import endpoints from '../../api/endpoints.js';

const STATUS_COLORS = {
  applied: '#3b82f6', shortlisted: '#f59e0b', interview: '#a855f7', selected: '#22c55e', rejected: '#ef4444',
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await api.get(endpoints.admin.analytics);
      setData(res.data.data);
      setLoading(false);
    })();
  }, []);

  if (loading || !data) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  const { totals, status_breakdown, department_placements, monthly_trend, cgpa_stats } = data;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Placement Analytics</h1>
      <p className="text-gray-500 mb-6">Insights into placement performance across the college.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Overall Placement Rate" value={`${totals.placement_rate}%`} icon="📈" accent="primary" />
        <StatCard label="Avg CGPA (All)" value={Number(cgpa_stats.avg_cgpa_all || 0).toFixed(2)} icon="🎓" accent="purple" />
        <StatCard label="Avg CGPA (Placed)" value={Number(cgpa_stats.avg_cgpa_placed || 0).toFixed(2)} icon="🏆" accent="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Applications by Status</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={status_breakdown}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={(entry) => `${entry.status}: ${entry.count}`}
              >
                {status_breakdown.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Placements by Department</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={department_placements}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_students" fill="#c7d7fe" name="Total Students" />
              <Bar dataKey="placed_students" fill="#4a46e6" name="Placed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Application Trend (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={monthly_trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="applications" stroke="#4a46e6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
}
