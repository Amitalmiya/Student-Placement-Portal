import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'


import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import JobBrowse from './pages/student/JobBrowse'
import JobDetail from './pages/student/JobDetail'
import MyApplications from './pages/student/MyApplications'

import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import CompanyProfile from './pages/recruiter/CompanyProfile'
import PostJob from './pages/recruiter/PostJob'
import MyJobs from './pages/recruiter/MyJobs'
import Applicants from './pages/recruiter/Applicants'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageStudents from './pages/admin/ManageStudents'
import ManageRecruiters from './pages/admin/ManageRecruiters'
import ManageDepartments from './pages/admin/ManageDepartments'
import ManageJobs from './pages/admin/ManageJobs'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import Analytics from './pages/admin/Analytics'

import AnnouncementsView from './pages/shared/AnnouncementsView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
      <Route path="/student/jobs" element={<ProtectedRoute allowedRoles={['student']}><JobBrowse /></ProtectedRoute>} />
      <Route path="/student/jobs/:id" element={<ProtectedRoute allowedRoles={['student']}><JobDetail /></ProtectedRoute>} />
      <Route path="/student/applications" element={<ProtectedRoute allowedRoles={['student']}><MyApplications /></ProtectedRoute>} />
      <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={['student']}><AnnouncementsView /></ProtectedRoute>} />

      {/* Recruiter routes */}
      <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
      <Route path="/recruiter/profile" element={<ProtectedRoute allowedRoles={['recruiter']}><CompanyProfile /></ProtectedRoute>} />
      <Route path="/recruiter/jobs" element={<ProtectedRoute allowedRoles={['recruiter']}><MyJobs /></ProtectedRoute>} />
      <Route path="/recruiter/post-job" element={<ProtectedRoute allowedRoles={['recruiter']}><PostJob /></ProtectedRoute>} />
      <Route path="/recruiter/post-job/:id" element={<ProtectedRoute allowedRoles={['recruiter']}><PostJob /></ProtectedRoute>} />
      <Route path="/recruiter/jobs/:jobId/applicants" element={<ProtectedRoute allowedRoles={['recruiter']}><Applicants /></ProtectedRoute>} />
      <Route path="/recruiter/applicants" element={<ProtectedRoute allowedRoles={['recruiter']}><Applicants /></ProtectedRoute>} />
      <Route path="/recruiter/announcements" element={<ProtectedRoute allowedRoles={['recruiter']}><AnnouncementsView /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/recruiters" element={<ProtectedRoute allowedRoles={['admin']}><ManageRecruiters /></ProtectedRoute>} />
      <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['admin']}><ManageDepartments /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><ManageJobs /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><Analytics /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App