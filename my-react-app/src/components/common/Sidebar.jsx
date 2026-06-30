import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FiHome, FiUser, FiBook, FiBarChart2, FiCalendar,
  FiCpu, FiFileText, FiZap, FiDollarSign, FiCheckSquare,
  FiBell, FiEdit3, FiUsers, FiClipboard, FiAward,
  FiPieChart, FiLogOut, FiShield, FiTrendingDown,
  FiSun, FiMoon,
} from 'react-icons/fi';
import './Sidebar.css';

const STUDENT_LINKS = [
  { to: '/student/dashboard',  label: 'Dashboard',      icon: <FiHome /> },
  { to: '/student/profile',    label: 'My Profile',      icon: <FiUser /> },
  { to: '/student/notes',      label: 'Subject Notes',   icon: <FiBook /> },
  { to: '/student/internal-marks', label: 'Internal Marks', icon: <FiBarChart2 /> },
  { to: '/student/semester-marks', label: 'Semester Marks', icon: <FiAward /> },
  { to: '/student/timetable',  label: 'Timetable',       icon: <FiCalendar /> },
  { to: '/student/ai-assistant', label: 'AI Assistant',  icon: <FiCpu /> },
  { to: '/student/resume',     label: 'Resume Builder',  icon: <FiFileText /> },
  { to: '/student/skill-games', label: 'Skill Games',   icon: <FiZap /> },
  { to: '/student/fees',       label: 'Fees Payment',    icon: <FiDollarSign /> },
  { to: '/student/quiz',       label: 'Quiz',            icon: <FiCheckSquare /> },
  { to: '/student/notifications', label: 'Notifications', icon: <FiBell /> },
];

const PROFESSOR_LINKS = [
  { to: '/professor/dashboard',     label: 'Dashboard',        icon: <FiHome /> },
  { to: '/professor/profile',       label: 'My Profile',       icon: <FiUser /> },
  { to: '/professor/internal-marks',label: 'Add Internal Marks',icon: <FiEdit3 /> },
  { to: '/professor/semester-marks',label: 'Semester Marks',    icon: <FiAward /> },
  { to: '/professor/students',      label: 'Student List',      icon: <FiUsers /> },
  { to: '/professor/notifications', label: 'Send Notification', icon: <FiBell /> },
];

const HOD_LINKS = [
  { to: '/hod/dashboard',         label: 'Dashboard',          icon: <FiHome /> },
  { to: '/hod/students',          label: 'Student Management', icon: <FiUsers /> },
  { to: '/hod/professors',        label: 'Professor Panel',    icon: <FiClipboard /> },
  { to: '/hod/attendance',        label: 'Attendance Mgmt',    icon: <FiCalendar /> },
  { to: '/hod/statistics',        label: 'Performance Stats',  icon: <FiBarChart2 /> },
  { to: '/hod/low-attendance',    label: 'Low Attendance',     icon: <FiTrendingDown /> },
  { to: '/hod/low-marks',         label: 'Low Marks Students', icon: <FiBarChart2 /> },
  { to: '/hod/notifications',     label: 'Notifications',      icon: <FiBell /> },
];

const MANAGEMENT_LINKS = [
  { to: '/management/dashboard',  label: 'Dashboard',       icon: <FiHome /> },
  { to: '/management/students',   label: 'All Students',    icon: <FiUsers /> },
  { to: '/management/fees',       label: 'Fees Overview',   icon: <FiDollarSign /> },
  { to: '/management/reports',    label: 'Reports',         icon: <FiPieChart /> },
  { to: '/management/notifications', label: 'Broadcast',   icon: <FiBell /> },
];

const ROLE_META = {
  STUDENT:    { links: STUDENT_LINKS,    label: 'Student Portal',     color: '#1a237e' },
  PROFESSOR:  { links: PROFESSOR_LINKS,  label: 'Professor Portal',   color: '#00695c' },
  HOD:        { links: HOD_LINKS,        label: 'HOD Portal',         color: '#4527a0' },
  MANAGEMENT: { links: MANAGEMENT_LINKS, label: 'Management Portal',  color: '#4a148c' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  if (!user) return null;

  const roleKey =
    user.role === 'PROFESSOR' && user.isHod ? 'HOD' : user.role;
  const meta = ROLE_META[roleKey] || ROLE_META.STUDENT;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo"><FiShield size={22} /></div>
        <div>
          <div className="sidebar-brand-name">SPCET Smart Student</div>
          <div className="sidebar-portal-label">{meta.label}</div>
        </div>
      </div>

      {/* User chip */}
      <div className="sidebar-user">
        <div className="sidebar-avatar">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-role">{roleKey}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {meta.links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-link-icon">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Dark mode toggle */}
      <button className="sidebar-theme-toggle" onClick={toggle} title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        <span className="sidebar-theme-icon">
          {dark ? <FiSun size={15} /> : <FiMoon size={15} />}
        </span>
        <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        <span className={`sidebar-theme-pill ${dark ? 'on' : ''}`} />
      </button>

      {/* Logout */}
      <button className="sidebar-logout" onClick={logout}>
        <FiLogOut /> Sign Out
      </button>
    </aside>
  );
}
