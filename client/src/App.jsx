import './App.css'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import ProtectedRoute from './components/ProtectedRoute'
import StudentDashboard from './pages/student/StudentDashboard'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFound from './pages/NotFound'
import ManageStudents from './pages/admin/ManageStudents'
import ManageRecruiters from './pages/admin/ManageRecruiters'
import ManageDepartments from './pages/admin/ManageDepartments'
import ManageJobs from './pages/admin/ManageJobs'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import Analytics from './pages/admin/Analytics'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>}/>

      {/* Recruiter routes */}
      <Route path="/recruiter" element={<ProtectedRoute allowedRoles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>}/>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}/>
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