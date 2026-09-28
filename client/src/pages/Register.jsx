import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import api from '../api/axios.js';
import endpoints from '../api/endpoints.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Public-ish lookup; departments endpoint requires auth in this build,
    // so we degrade gracefully if it fails (student can still type dept later).
    api.get(endpoints.departments.base).then((res) => setDepartments(res.data.data)).catch(() => {});
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await register({ ...form, role });
      setSuccess(res.message);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Join as a student or recruiter</p>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-5">
            {['student', 'recruiter'].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize ${
                  role === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <Alert type="error" message={error} onClose={() => setError('')} />
          <Alert type="success" message={success} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input required className="input" onChange={update('full_name')} />
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" required className="input" onChange={update('email')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" required minLength={6} className="input" onChange={update('password')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" onChange={update('phone')} />
            </div>

            {role === 'student' && (
              <>
                <div>
                  <label className="label">Roll Number</label>
                  <input required className="input" onChange={update('roll_number')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Department</label>
                    <select className="input" onChange={update('department_id')} defaultValue="">
                      <option value="">Select</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Batch Year</label>
                    <input type="number" className="input" placeholder="2026" onChange={update('batch_year')} />
                  </div>
                </div>
              </>
            )}

            {role === 'recruiter' && (
              <div>
                <label className="label">Company Name</label>
                <input required className="input" onChange={update('company_name')} />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
