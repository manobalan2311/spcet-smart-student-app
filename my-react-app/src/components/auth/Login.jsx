import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import {
  FiUser, FiLock, FiLogIn, FiBookOpen, FiAlertCircle,
  FiMail, FiCalendar, FiLayers, FiBook, FiCheckCircle,
  FiEye, FiEyeOff, FiUserPlus, FiHash, FiArrowLeft, FiKey,
} from 'react-icons/fi';
import './Login.css';

const ROLES = [
  { value: 'STUDENT',    label: 'Student',            color: '#1a237e' },
  { value: 'PROFESSOR',  label: 'Professor / HOD',    color: '#00695c' },
  { value: 'MANAGEMENT', label: 'College Management', color: '#4a148c' },
];

// Roles available on the registration form. HOD is offered separately here so
// new department heads can create an account directly.
const REGISTER_ROLES = [
  { value: 'STUDENT',    label: 'Student',            color: '#1a237e' },
  { value: 'PROFESSOR',  label: 'Professor',          color: '#00695c' },
  { value: 'HOD',        label: 'HOD',                color: '#4527a0' },
  { value: 'MANAGEMENT', label: 'College Management', color: '#4a148c' },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical & Electronics Engineering',
  'Information Technology',
  'Biotechnology',
  'Chemical Engineering',
];

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Subjects offered per department (used by the professor/HOD subject picker)
const SUBJECTS_BY_DEPARTMENT = {
  'Computer Science & Engineering': [
    'Data Structures', 'Database Management', 'Operating Systems',
    'Computer Networks', 'Software Engineering', 'Theory of Computation',
  ],
  'Electronics & Communication Engineering': [
    'Digital Electronics', 'Signals & Systems', 'Analog Circuits',
    'Microprocessors', 'Communication Systems', 'VLSI Design',
  ],
  'Mechanical Engineering': [
    'Thermodynamics', 'Fluid Mechanics', 'Machine Design',
    'Manufacturing Technology', 'Heat Transfer', 'Engineering Mechanics',
  ],
  'Civil Engineering': [
    'Structural Analysis', 'Surveying', 'Geotechnical Engineering',
    'Concrete Technology', 'Transportation Engineering', 'Hydraulics',
  ],
  'Electrical & Electronics Engineering': [
    'Electrical Machines', 'Power Systems', 'Control Systems',
    'Power Electronics', 'Electromagnetic Fields', 'Circuit Theory',
  ],
  'Information Technology': [
    'Web Technologies', 'Data Structures', 'Database Systems',
    'Computer Networks', 'Cloud Computing', 'Information Security',
  ],
  'Biotechnology': [
    'Biochemistry', 'Microbiology', 'Genetics',
    'Molecular Biology', 'Bioprocess Engineering', 'Immunology',
  ],
  'Chemical Engineering': [
    'Chemical Reaction Engineering', 'Thermodynamics', 'Mass Transfer',
    'Process Control', 'Fluid Mechanics', 'Heat Transfer',
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function validate(fields) {
  const errs = {};
  if (!fields.email.trim())          errs.email      = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                     errs.email      = 'Enter a valid email.';
  if (!fields.password)              errs.password   = 'Password is required.';
  else if (fields.password.length < 6) errs.password = 'Min 6 characters.';
  return errs;
}

function validateRegister(fields) {
  const errs = validate(fields);
  if (!fields.name.trim())           errs.name       = 'Full name is required.';
  if (!fields.dob)                   errs.dob        = 'Date of birth is required.';
  if (fields.role !== 'MANAGEMENT' && !fields.department)
                                     errs.department = 'Select a department.';
  if (fields.role === 'STUDENT' && !fields.registerNumber.trim())
                                     errs.registerNumber = 'Registration number is required.';
  if (fields.role === 'STUDENT' && !fields.semester)
                                     errs.semester   = 'Select your semester.';
  if (fields.role === 'PROFESSOR' && (!fields.subjects || fields.subjects.length === 0))
                                     errs.subjects   = 'Select at least one subject.';
  if (fields.password !== fields.confirmPassword)
                                     errs.confirmPassword = 'Passwords do not match.';
  return errs;
}

function RegisterField({ label, icon, fieldKey, type = 'text', placeholder, value, error, onChange, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children || (
        <div className="input-icon-wrap">
          <span className="input-icon">{icon}</span>
          <input
            type={type}
            className={`form-control input-with-icon${error ? ' input-error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
          />
        </div>
      )}
      {error && (
        <span className="field-error"><FiAlertCircle size={12} /> {error}</span>
      )}
    </div>
  );
}

// ─── Subject multi-select (chips) ─────────────────────────────────────────────
function SubjectMultiSelect({ department, selected, onChange }) {
  const options = SUBJECTS_BY_DEPARTMENT[department] || [];

  if (!department) {
    return <p className="subject-hint">Select a department first to choose subjects.</p>;
  }
  if (!options.length) {
    return <p className="subject-hint">No subjects listed for this department.</p>;
  }

  const toggle = (subj) => {
    onChange(
      selected.includes(subj)
        ? selected.filter((s) => s !== subj)
        : [...selected, subj]
    );
  };

  return (
    <div className="subject-multiselect">
      {options.map((subj) => {
        const active = selected.includes(subj);
        return (
          <button
            type="button"
            key={subj}
            className={`subject-chip${active ? ' active' : ''}`}
            onClick={() => toggle(subj)}
          >
            {active ? <FiCheckCircle size={13} /> : <FiBook size={13} />} {subj}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'

  return (
    <div className="login-page">
      {/* Left brand panel */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo"><FiBookOpen size={48} /></div>
          <h1>SPCET Smart Student App</h1>
          <p>Integrated Academic Management System</p>
          <ul className="brand-features">
            <li>Student Profiles &amp; Academic Records</li>
            <li>Internal &amp; Semester Marks Tracking</li>
            <li>AI-Powered Study Assistant</li>
            <li>Resume Builder &amp; Skill Games</li>
            <li>Fees &amp; Timetable Management</li>
            <li>HOD &amp; College Management Portal</li>
          </ul>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-form-panel">
        {mode === 'login' && (
          <LoginForm
            onSwitch={() => setMode('register')}
            onForgot={() => setMode('forgot')}
          />
        )}
        {mode === 'register' && <RegisterForm onSwitch={() => setMode('login')} />}
        {mode === 'forgot' && <ForgotPasswordForm onBack={() => setMode('login')} />}
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onSwitch, onForgot }) {
  const { login } = useAuth();
  const [role, setRole]         = useState('STUDENT');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [department, setDepartment] = useState('');
  const [subjects, setSubjects]     = useState([]);
  const [accountType, setAccountType] = useState('PROFESSOR');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const userData = await login({
        email,
        password,
        role,
        accountType: role === 'PROFESSOR' ? accountType : undefined,
        department: department || undefined,
        subjects: role === 'PROFESSOR' ? subjects : undefined,
      });
      window.location.hash =
        userData.role === 'STUDENT'
          ? '#/student/dashboard'
          : userData.role === 'HOD' || userData.isHod
            ? '#/hod/dashboard'
            : userData.role === 'PROFESSOR'
              ? '#/professor/dashboard'
              : '#/management/dashboard';
    } catch (err) {
      setError(
        err?.response?.data?.message
          || (err?.request ? 'Backend server is not reachable. Start Spring backend on port 8080.' : null)
          || 'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selected = ROLES.find((r) => r.value === role);

  return (
    <div className="login-card">
      <h2>Welcome Back</h2>
      <p className="login-subtitle">Sign in to your portal</p>

      {/* Role selector */}
      <div className="role-selector">
        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            className={`role-btn ${role === r.value ? 'active' : ''}`}
            style={role === r.value ? { borderColor: r.color, color: r.color, background: r.color + '10' } : {}}
            onClick={() => { setRole(r.value); setError(''); setDepartment(''); setSubjects([]); setAccountType('PROFESSOR'); }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {role === 'PROFESSOR' && (
          <div className="form-group">
            <label className="form-label">Login As</label>
            <div className="input-icon-wrap">
              <FiUser className="input-icon" style={{ top: '50%' }} />
              <select
                className="form-control input-with-icon"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="PROFESSOR">Professor</option>
                <option value="HOD">Head of Department (HOD)</option>
              </select>
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-icon-wrap">
            <FiMail className="input-icon" />
            <input
              type="email"
              className="form-control input-with-icon"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-icon-wrap">
            <FiLock className="input-icon" />
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control input-with-icon input-with-right-icon"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="pwd-toggle"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="forgot-row">
          <button type="button" className="forgot-link" onClick={onForgot}>
            Forgot password?
          </button>
        </div>

        {/* Department & subjects – only for professors / HOD */}
        {role === 'PROFESSOR' && (
          <>
            <div className="form-group">
              <label className="form-label">Department <span className="optional-tag">(optional)</span></label>
              <div className="input-icon-wrap">
                <FiBook className="input-icon" style={{ top: '50%' }} />
                <select
                  className="form-control input-with-icon"
                  value={department}
                  onChange={(e) => { setDepartment(e.target.value); setSubjects([]); }}
                >
                  <option value="">— Select Department —</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subjects <span className="optional-tag">(optional)</span></label>
              <SubjectMultiSelect
                department={department}
                selected={subjects}
                onChange={setSubjects}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading
            ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
            : <><FiLogIn /> Sign In as {selected?.label}</>
          }
        </button>
      </form>

      <div className="auth-switch">
        <span>Don't have an account?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitch}>
          <FiUserPlus /> Create Account
        </button>
      </div>

      <p className="demo-hint">
        <strong>Note:</strong> Sign in using registered email and password.
      </p>
    </div>
  );
}

// ─── Forgot Password Form ─────────────────────────────────────────────────────
function ForgotPasswordForm({ onBack }) {
  const [email, setEmail]                 = useState('');
  const [dob, setDob]                     = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirm]     = useState('');
  const [showPwd, setShowPwd]             = useState(false);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState(false);
  const [loading, setLoading]             = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email.'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await authAPI.resetPassword({
        email: email.trim().toLowerCase(),
        dob: dob || undefined,
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message
          || (err?.request ? 'Backend server is not reachable.' : null)
          || 'Could not reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🔓</div>
        <h2 style={{ color: 'var(--success)', marginBottom: 8 }}>Password Reset!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Your password has been updated. You can now sign in with your new password.
        </p>
        <button className="btn btn-primary btn-full btn-lg" onClick={onBack}>
          <FiLogIn /> Back to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="login-card">
      <h2>Reset Password</h2>
      <p className="login-subtitle">Enter your details to set a new password</p>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>
          <FiAlertCircle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div className="input-icon-wrap">
            <FiMail className="input-icon" />
            <input
              type="email"
              className="form-control input-with-icon"
              placeholder="you@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Date of Birth <span className="optional-tag">(for verification, if registered)</span>
          </label>
          <div className="input-icon-wrap">
            <FiCalendar className="input-icon" />
            <input
              type="date"
              className="form-control input-with-icon"
              max={new Date().toISOString().slice(0, 10)}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <div className="input-icon-wrap">
            <FiKey className="input-icon" />
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control input-with-icon input-with-right-icon"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="pwd-toggle"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? 'Hide password' : 'Show password'}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <div className="input-icon-wrap">
            <FiLock className="input-icon" />
            <input
              type={showPwd ? 'text' : 'password'}
              className="form-control input-with-icon"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading
            ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
            : <><FiKey /> Reset Password</>
          }
        </button>
      </form>

      <div className="auth-switch">
        <button type="button" className="auth-switch-btn" onClick={onBack}>
          <FiArrowLeft /> Back to Sign In
        </button>
      </div>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }) {
  const [role, setRole]   = useState('STUDENT');
  const [form, setForm]   = useState({
    name: '', email: '', registerNumber: '', password: '', confirmPassword: '',
    dob: '', department: '', semester: '', role: 'STUDENT', subjects: [],
  });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const c = { ...e }; delete c[key]; return c; });
  };

  const handleRoleChange = (r) => {
    setRole(r);
    set('role', r);
    set('semester', '');
    set('subjects', []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegister({ ...form, role });
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        registerNumber: role === 'STUDENT' ? form.registerNumber.trim() : null,
        password: form.password,
        role,
        dob: form.dob,
        department: form.department,
        semester: form.semester ? Number(form.semester) : null,
        subjects: (role === 'PROFESSOR' || role === 'HOD') ? form.subjects : null,
      });
      setSuccess(true);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err?.response?.data?.message
          || (err?.request ? 'Backend server is not reachable. Start Spring backend on port 8080.' : null)
          || 'Could not create account. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ color: 'var(--success)', marginBottom: 8 }}>Account Created!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Welcome, <strong>{form.name}</strong>! Your account has been created successfully.
          You can now sign in.
        </p>
        <div className="alert alert-success" style={{ marginBottom: 20, textAlign: 'left' }}>
          <FiCheckCircle />
          <div>
            <div><strong>Email:</strong> {form.email}</div>
            {form.registerNumber && <div><strong>Registration No:</strong> {form.registerNumber}</div>}
            <div><strong>Role:</strong> {role}</div>
            {role !== 'MANAGEMENT' && form.department && <div><strong>Department:</strong> {form.department}</div>}
            {form.semester && <div><strong>Semester:</strong> {form.semester}</div>}
          </div>
        </div>
        <button className="btn btn-primary btn-full btn-lg" onClick={onSwitch}>
          <FiLogIn /> Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="login-card register-card">
      <h2>Create Account</h2>
      <p className="login-subtitle">Register for your portal</p>

      {/* Role selector */}
      <div className="role-selector">
        {REGISTER_ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            className={`role-btn ${role === r.value ? 'active' : ''}`}
            style={role === r.value ? { borderColor: r.color, color: r.color, background: r.color + '10' } : {}}
            onClick={() => handleRoleChange(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {errors.form && (
          <div className="alert alert-danger" style={{ marginBottom: 12 }}>
            <FiAlertCircle /> {errors.form}
          </div>
        )}

        {/* Full Name */}
        <RegisterField
          label="Full Name"
          icon={<FiUser />}
          fieldKey="name"
          placeholder="e.g. Arun Kumar"
          value={form.name}
          error={errors.name}
          onChange={set}
        />

        {/* Email */}
        <RegisterField
          label="Email Address"
          icon={<FiMail />}
          fieldKey="email"
          type="email"
          placeholder="you@college.edu"
          value={form.email}
          error={errors.email}
          onChange={set}
        />

        {/* Registration Number – only for students */}
        {role === 'STUDENT' && (
          <RegisterField
            label="Registration Number"
            icon={<FiHash />}
            fieldKey="registerNumber"
            placeholder="e.g. CS21001"
            value={form.registerNumber}
            error={errors.registerNumber}
            onChange={set}
          />
        )}

        {/* Date of Birth */}
        <div className="form-group">
          <label className="form-label">Date of Birth</label>
          <div className="input-icon-wrap">
            <FiCalendar className="input-icon" />
            <input
              type="date"
              className={`form-control input-with-icon${errors.dob ? ' input-error' : ''}`}
              max={new Date().toISOString().slice(0, 10)}
              value={form.dob}
              onChange={(e) => set('dob', e.target.value)}
            />
          </div>
          {errors.dob && <span className="field-error"><FiAlertCircle size={12} /> {errors.dob}</span>}
        </div>

        {/* Department */}
        {role !== 'MANAGEMENT' && (
        <div className="form-group">
          <label className="form-label">Department</label>
          <div className="input-icon-wrap">
            <FiBook className="input-icon" style={{ top: '50%' }} />
            <select
              className={`form-control input-with-icon${errors.department ? ' input-error' : ''}`}
              value={form.department}
              onChange={(e) => {
                setForm((f) => ({ ...f, department: e.target.value, subjects: [] }));
                setErrors((er) => { const c = { ...er }; delete c.department; delete c.subjects; return c; });
              }}
            >
              <option value="">— Select Department —</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {errors.department && <span className="field-error"><FiAlertCircle size={12} /> {errors.department}</span>}
        </div>
        )}

        {/* Subjects – only for professors / HOD */}
        {(role === 'PROFESSOR' || role === 'HOD') && (
          <div className="form-group">
            <label className="form-label">Subjects You Teach{role === 'HOD' ? ' (optional)' : ''}</label>
            <SubjectMultiSelect
              department={form.department}
              selected={form.subjects}
              onChange={(subs) => set('subjects', subs)}
            />
            {errors.subjects && <span className="field-error"><FiAlertCircle size={12} /> {errors.subjects}</span>}
          </div>
        )}

        {/* Semester – only for students */}
        {role === 'STUDENT' && (
          <div className="form-group">
            <label className="form-label">Current Semester</label>
            <div className="input-icon-wrap">
              <FiLayers className="input-icon" />
              <select
                className={`form-control input-with-icon${errors.semester ? ' input-error' : ''}`}
                value={form.semester}
                onChange={(e) => set('semester', e.target.value)}
              >
                <option value="">— Select Semester —</option>
                {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            {errors.semester && <span className="field-error"><FiAlertCircle size={12} /> {errors.semester}</span>}
          </div>
        )}

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="input-icon-wrap">
            <FiLock className="input-icon" />
            <input
              type={showPwd ? 'text' : 'password'}
              className={`form-control input-with-icon input-with-right-icon${errors.password ? ' input-error' : ''}`}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowPwd((v) => !v)} aria-label="Toggle password">
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <span className="field-error"><FiAlertCircle size={12} /> {errors.password}</span>}
          {/* Strength bar */}
          {form.password && <PasswordStrength pwd={form.password} />}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label">Confirm Password</label>
          <div className="input-icon-wrap">
            <FiLock className="input-icon" />
            <input
              type={showConfirm ? 'text' : 'password'}
              className={`form-control input-with-icon input-with-right-icon${errors.confirmPassword ? ' input-error' : ''}`}
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" className="pwd-toggle" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password">
              {showConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.confirmPassword && <span className="field-error"><FiAlertCircle size={12} /> {errors.confirmPassword}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full btn-lg"
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading
            ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
            : <><FiUserPlus /> Create Account</>
          }
        </button>
      </form>

      <div className="auth-switch">
        <span>Already have an account?</span>
        <button type="button" className="auth-switch-btn" onClick={onSwitch}>
          <FiLogIn /> Sign In
        </button>
      </div>
    </div>
  );
}

// ─── Password strength indicator ─────────────────────────────────────────────
function PasswordStrength({ pwd }) {
  const checks = [
    pwd.length >= 6,
    /[A-Z]/.test(pwd),
    /[0-9]/.test(pwd),
    /[^A-Za-z0-9]/.test(pwd),
  ];
  const score  = checks.filter(Boolean).length;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#c62828', '#f57f17', '#0288d1', '#2e7d32'];

  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < score ? colors[score - 1] : '#e0e0e0',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', color: colors[score - 1] || '#9e9e9e', fontWeight: 600 }}>
        {score > 0 ? labels[score - 1] : ''}
      </span>
    </div>
  );
}
