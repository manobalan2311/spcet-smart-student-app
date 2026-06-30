import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import './components/common/Sidebar.css';
import Login from './components/auth/Login';

import StudentDashboard from './components/student/Dashboard';
import StudentProfile from './components/student/Profile';
import Notes from './components/student/Notes';
import InternalMarks from './components/student/InternalMarks';
import SemesterMarks from './components/student/SemesterMarks';
import Timetable from './components/student/Timetable';
import AIAssistant from './components/student/AIAssistant';
import ResumeBuilder from './components/student/ResumeBuilder';
import SkillGames from './components/student/SkillGames';
import FeesPayment from './components/student/FeesPayment';
import Quiz from './components/student/Quiz';
import StudentNotifications from './components/student/Notifications';

import ProfessorDashboard from './components/professor/Dashboard';
import ProfessorProfile from './components/professor/Profile';
import AddInternalMarks from './components/professor/AddInternalMarks';
import ProfessorSemesterMarks from './components/professor/SemesterMarks';
import SendNotification from './components/professor/SendNotification';
import StudentList from './components/professor/StudentList';

import HODDashboard from './components/hod/Dashboard';
import StudentManagement from './components/hod/StudentManagement';
import AttendanceManagement from './components/hod/AttendanceManagement';
import LowPerformers from './components/hod/LowPerformers';
import Statistics from './components/hod/Statistics';

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function StudentRoutes() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <Layout>
        <Routes>
          <Route path="dashboard"        element={<StudentDashboard />} />
          <Route path="profile"          element={<StudentProfile />} />
          <Route path="notes"            element={<Notes />} />
          <Route path="internal-marks"   element={<InternalMarks />} />
          <Route path="semester-marks"   element={<SemesterMarks />} />
          <Route path="timetable"        element={<Timetable />} />
          <Route path="ai-assistant"     element={<AIAssistant />} />
          <Route path="resume"           element={<ResumeBuilder />} />
          <Route path="skill-games"      element={<SkillGames />} />
          <Route path="fees"             element={<FeesPayment />} />
          <Route path="quiz"             element={<Quiz />} />
          <Route path="notifications"    element={<StudentNotifications />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function ProfessorRoutes() {
  return (
    <ProtectedRoute allowedRoles={['PROFESSOR']}>
      <Layout>
        <Routes>
          <Route path="dashboard"        element={<ProfessorDashboard />} />
          <Route path="profile"          element={<ProfessorProfile />} />
          <Route path="internal-marks"   element={<AddInternalMarks />} />
          <Route path="semester-marks"   element={<ProfessorSemesterMarks />} />
          <Route path="students"         element={<StudentList />} />
          <Route path="notifications"    element={<SendNotification />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function HODRoutes() {
  return (
    <ProtectedRoute allowedRoles={['HOD', 'PROFESSOR']}>
      <Layout>
        <Routes>
          <Route path="dashboard"        element={<HODDashboard />} />
          <Route path="students"         element={<StudentManagement />} />
          <Route path="professors"       element={<StudentManagement />} />
          <Route path="attendance"       element={<AttendanceManagement />} />
          <Route path="statistics"       element={<Statistics />} />
          <Route path="low-attendance"   element={<LowPerformers />} />
          <Route path="low-marks"        element={<LowPerformers />} />
          <Route path="notifications"    element={<SendNotification />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

function ManagementRoutes() {
  return (
    <ProtectedRoute allowedRoles={['MANAGEMENT']}>
      <Layout>
        <Routes>
          <Route path="dashboard"        element={<HODDashboard />} />
          <Route path="students"         element={<StudentManagement />} />
          <Route path="fees"             element={<AttendanceManagement />} />
          <Route path="reports"          element={<LowPerformers />} />
          <Route path="notifications"    element={<SendNotification />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login"        element={<Login />} />
          <Route path="/student/*"    element={<StudentRoutes />} />
          <Route path="/professor/*"  element={<ProfessorRoutes />} />
          <Route path="/hod/*"        element={<HODRoutes />} />
          <Route path="/management/*" element={<ManagementRoutes />} />
          <Route path="/unauthorized" element={
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
              <h1 style={{ color:'#c62828' }}>403 - Access Denied</h1>
              <p>You do not have permission to view this page.</p>
              <a href="#/login" style={{ color:'#1a237e', fontWeight:700 }}>Back to Login</a>
            </div>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}