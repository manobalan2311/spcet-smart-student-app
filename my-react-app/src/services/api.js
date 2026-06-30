// ════════════════════════════════════════════════════════════════════════════
// OFFLINE MOCK BACKEND
// ────────────────────────────────────────────────────────────────────────────
// This module fully replaces the Spring Boot backend. All data is persisted in
// the browser's localStorage so the app works without any server running and
// survives page reloads. Every method returns an axios-style { data } response.
// To wipe all data and re-seed, clear localStorage key "ssa_mock_db".
// ════════════════════════════════════════════════════════════════════════════

const DB_KEY = 'ssa_mock_db';

// Bump this whenever the seed data below changes so existing browsers
// automatically rebuild their local database on next load.
const DB_VERSION = 3;

// ─── Persistence helpers ──────────────────────────────────────────────────────
function seedDb() {
  const departments = [
    { id: 1, code: 'CSE',   name: 'Computer Science & Engineering' },
    { id: 2, code: 'ECE',   name: 'Electronics & Communication Engineering' },
    { id: 3, code: 'MECH',  name: 'Mechanical Engineering' },
    { id: 4, code: 'CIVIL', name: 'Civil Engineering' },
    { id: 5, code: 'EEE',   name: 'Electrical & Electronics Engineering' },
    { id: 6, code: 'IT',    name: 'Information Technology' },
    { id: 7, code: 'BT',    name: 'Biotechnology' },
    { id: 8, code: 'CHEM',  name: 'Chemical Engineering' },
  ];

  const subjects = [
    { id: 1, code: 'CS301', name: 'Data Structures',      departmentId: 1, semester: 3, maxMarks: 20 },
    { id: 2, code: 'CS302', name: 'Database Management',   departmentId: 1, semester: 3, maxMarks: 20 },
    { id: 3, code: 'CS303', name: 'Operating Systems',     departmentId: 1, semester: 3, maxMarks: 20 },
    { id: 4, code: 'CS304', name: 'Computer Networks',     departmentId: 1, semester: 3, maxMarks: 20 },
    { id: 5, code: 'CS305', name: 'Software Engineering',  departmentId: 1, semester: 3, maxMarks: 20 },
    { id: 6, code: 'CS306', name: 'Theory of Computation', departmentId: 1, semester: 3, maxMarks: 20 },
  ];

  const users = [
    { id: 1, email: 'student@college.edu', password: 'student123', role: 'STUDENT',    isHod: false, isActive: true },
    { id: 2, email: 'prof@college.edu',    password: 'prof123',    role: 'PROFESSOR',  isHod: false, isActive: true },
    { id: 3, email: 'hod@college.edu',     password: 'hod123',     role: 'PROFESSOR',  isHod: true,  isActive: true },
    { id: 4, email: 'admin@college.edu',   password: 'admin123',   role: 'MANAGEMENT', isHod: false, isActive: true },
    { id: 5, email: 'priya@college.edu',   password: 'student123', role: 'STUDENT',    isHod: false, isActive: true },
    { id: 6, email: 'rahul@college.edu',   password: 'student123', role: 'STUDENT',    isHod: false, isActive: true },
    // ── Real CSE class roster (login email = registered email, password = <RollNo>@123) ──
    { id: 7,  email: 'manobalancse2023@gmail.com',       password: '112723104018@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 8,  email: 'chrisrobinsoncse2023@gmail.com',   password: '112723104006@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 9,  email: 'nandhininandhu20050401@gmail.com', password: '112723104027@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 10, email: 'atchaya2095@gmail.com',            password: '112723104004@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 11, email: 'sanjanacse2023@gmail.com',         password: '112723104039@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 12, email: 'samudideva1234@gmail.com',         password: '112723104038@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 13, email: 'gomathiph7@gmail.com',             password: '112723104008@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 14, email: 'itz.janani17@gmail.com',           password: '112723104013@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 15, email: 'monicacse2023@gmail.com',          password: '112723104024@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 16, email: 'mdazyanva2005@gmail.com',          password: '112723104020@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 17, email: 'sadhanaarul25@gmail.com',          password: '112723104036@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 18, email: 'senorinshafe2006@gmail.com',       password: '112723104040@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 19, email: 'letter7200@gmail.com',             password: '112723104017@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 20, email: 'sadhanarajendran2005@gmail.com',   password: '112723104037@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 21, email: 'pavithran143.pappu@gmail.com',     password: '112723104033@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 22, email: 'pt.parthan.2005@gmail.com',        password: '112723104032@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 23, email: 'kamalakamala0811@gmail.com',       password: '112723104999@123', role: 'STUDENT', isHod: false, isActive: true },
    { id: 24, email: 'varsharajmohan236@gmail.com',      password: '112723104049@123', role: 'STUDENT', isHod: false, isActive: true },
  ];

  const students = [
    {
      id: 1, userId: 1, rollNo: '112723104003', name: 'Aravind', email: 'student@college.edu',
      phone: '9876543210', dob: '2003-04-12', bloodGroup: 'B+', address: '12 Gandhi St, Chennai',
      departmentId: 1, batch: '2021-2025', semester: 3, section: 'A',
      parentName: 'Sundarajan', parentPhone: '9876500000', scholarship: 'Nil', profilePhoto: null,
    },
    {
      id: 2, userId: 7, rollNo: '112723104018', name: 'Manobalan P', email: 'manobalancse2023@gmail.com',
      phone: '9962482601', dob: '2005-11-23', bloodGroup: 'B+', address: 'No. 8 Kundalakesi Street, MGR Nagar, Chennai 600078',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'R. Punniamoorthy', parentPhone: '9940083397', scholarship: 'Nil', profilePhoto: null,
    },
    {
      id: 3, userId: 8, rollNo: '112723104006', name: 'Chris Robinson S', email: 'chrisrobinsoncse2023@gmail.com',
      phone: '9176351480', dob: '2006-08-13', bloodGroup: 'O+', address: 'No.5, 6 Cross, Periyar Street, Gandhi Nagar, Avadi',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Samson', parentPhone: '7395929502', scholarship: 'No', profilePhoto: null,
    },
    {
      id: 4, userId: 9, rollNo: '112723104027', name: 'Nandhini R', email: 'nandhininandhu20050401@gmail.com',
      phone: '7010846490', dob: '2005-01-04', bloodGroup: 'O+', address: '79/36 Nethaji Street, Lakshmipuram, Kolathur, Chennai',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Saraswathi R', parentPhone: '7338921575', scholarship: 'MBC Scholarship', profilePhoto: null,
    },
    {
      id: 5, userId: 10, rollNo: '112723104004', name: 'Atchaya S', email: 'atchaya2095@gmail.com',
      phone: '9442605562', dob: '2005-09-20', bloodGroup: 'B+', address: 'No:80, 4th Cross Street, Sri Ram Nagar, Prakash Nagar Main Road, Thirunindravur 602024',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Sasikumar', parentPhone: '7708608978', scholarship: 'BC Scholarship', profilePhoto: null,
    },
    {
      id: 6, userId: 11, rollNo: '112723104039', name: 'Sanjana K', email: 'sanjanacse2023@gmail.com',
      phone: '6374887937', dob: '2005-07-25', bloodGroup: 'B+', address: 'No.59 C, 7th Avenue, Banu Nagar, Ambattur, Chennai 53',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Radhalakshmi R M', parentPhone: '8754401150', scholarship: 'MBC', profilePhoto: null,
    },
    {
      id: 7, userId: 12, rollNo: '112723104038', name: 'Samudi', email: 'samudideva1234@gmail.com',
      phone: '9042122126', dob: '2006-04-08', bloodGroup: 'A+', address: '122/2 Pallathur, Natrampalli, Tirupattur',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Devaraji', parentPhone: '9894898642', scholarship: 'MBC', profilePhoto: null,
    },
    {
      id: 8, userId: 13, rollNo: '112723104008', name: 'Gomathi P H', email: 'gomathiph7@gmail.com',
      phone: '7358463138', dob: '2005-09-17', bloodGroup: 'O+', address: 'No 28, G Block, North Rajaji Street, Pushpa Nagar, Nungambakkam, Chennai 34',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Hari P', parentPhone: '9710907482', scholarship: 'MBC', profilePhoto: null,
    },
    {
      id: 9, userId: 14, rollNo: '112723104013', name: 'Janani V', email: 'itz.janani17@gmail.com',
      phone: '8778025769', dob: '2006-05-17', bloodGroup: 'O+', address: 'No 71/1, 160th Street, 6th Block, Muthamizh Nagar',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Vairamani V', parentPhone: '9080581271', scholarship: 'BC', profilePhoto: null,
    },
    {
      id: 10, userId: 15, rollNo: '112723104024', name: 'Monica G', email: 'monicacse2023@gmail.com',
      phone: '9952979233', dob: '2006-06-04', bloodGroup: 'A-', address: 'No 31, Gandhiji Nagar, near Vasantha Hospital, Othavadai, Thiruvottiyur, Chennai 19',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'K. Giri / Manimegalai G', parentPhone: '9677350778', scholarship: 'MBC', profilePhoto: null,
    },
    {
      id: 11, userId: 16, rollNo: '112723104020', name: 'MD Azyan V', email: 'mdazyanva2005@gmail.com',
      phone: '09080453220', dob: '2005-09-01', bloodGroup: 'O+', address: 'Arunadhaya Apartment, Egmore, Chennai',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Riyaz Ahmed V', parentPhone: '9894990642', scholarship: 'BC', profilePhoto: null,
    },
    {
      id: 12, userId: 17, rollNo: '112723104036', name: 'Sadhana Arul', email: 'sadhanaarul25@gmail.com',
      phone: '9150995788', dob: '2006-05-25', bloodGroup: 'B+', address: 'No 12/17, Dr. Ambedkar Nagar, Thiruvottiyur',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'M. Arul Dass', parentPhone: '9003053011', scholarship: 'MBC', profilePhoto: null,
    },
    {
      id: 13, userId: 18, rollNo: '112723104040', name: 'Senorin Shafe S', email: 'senorinshafe2006@gmail.com',
      phone: '7868800973', dob: '2006-07-28', bloodGroup: 'B+', address: 'No.7, B Block, Anand Flats, Subramanium Road, Perambur, Chennai 11',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Vinny Freeda R', parentPhone: '9486967375', scholarship: 'Nil', profilePhoto: null,
    },
    {
      id: 14, userId: 19, rollNo: '112723104017', name: 'Mahalashmi V', email: 'letter7200@gmail.com',
      phone: '9566162125', dob: '2005-11-27', bloodGroup: 'O+', address: '35/11 Mel Vanniyar Street, Sholinghur, Sholinghur Taluk, Ranipet 631102',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Gunapooshanam V', parentPhone: '9952105782', scholarship: 'Pudhumai Penn Scheme', profilePhoto: null,
    },
    {
      id: 15, userId: 20, rollNo: '112723104037', name: 'Sadhana R', email: 'sadhanarajendran2005@gmail.com',
      phone: '7845171223', dob: '2005-07-16', bloodGroup: 'B+', address: '1/68 East Street, Vikramam, Thanjavur District',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Rajendran R', parentPhone: '9600846688', scholarship: 'BC', profilePhoto: null,
    },
    {
      id: 16, userId: 21, rollNo: '112723104033', name: 'Pavithran', email: 'pavithran143.pappu@gmail.com',
      phone: '9345608411', dob: '2006-01-31', bloodGroup: 'B+', address: '176, Valluvar Street, Viruthampet, Vellore',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Bharathidass', parentPhone: '9156352423', scholarship: 'Nil', profilePhoto: null,
    },
    {
      id: 17, userId: 22, rollNo: '112723104032', name: 'Parthan PT', email: 'pt.parthan.2005@gmail.com',
      phone: '9444109167', dob: '2005-10-06', bloodGroup: 'B+', address: '140/B Vijayaragavachari Street, Vijayalakshmipuram, Ambattur, Chennai 600053',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: '', parentPhone: '6369444187', scholarship: 'BC', profilePhoto: null,
    },
    {
      id: 18, userId: 23, rollNo: '112723104999', name: 'V. E. Kamala', email: 'kamalakamala0811@gmail.com',
      phone: '9626168476', dob: '2006-07-11', bloodGroup: 'O+', address: '3/663, C. P. Kovil Street, Vanganoor',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'V. E. Ekambaram', parentPhone: '8870549654', scholarship: 'PPS', profilePhoto: null,
    },
    {
      id: 19, userId: 24, rollNo: '112723104049', name: 'Varsha R', email: 'varsharajmohan236@gmail.com',
      phone: '9342113128', dob: '2006-06-23', bloodGroup: 'O+', address: 'No.23, Cross Road, Chennai 81',
      departmentId: 1, batch: '2023-2027', semester: 6, section: 'A',
      parentName: 'Kavitha', parentPhone: '7010329709', scholarship: 'FG', profilePhoto: null,
    },
  ];

  const professors = [
    {
      id: 1, userId: 2, employeeId: 'EMP000002', name: 'Dr. Lakshmi Narayanan', email: 'prof@college.edu',
      phone: '9090909090', departmentId: 1, designation: 'Professor', qualification: 'Ph.D Computer Science', profilePhoto: null,
      subjectIds: [1, 2, 3, 4, 5, 6],
    },
    {
      id: 2, userId: 3, employeeId: 'EMP000003', name: 'Dr. Ramesh Babu', email: 'hod@college.edu',
      phone: '9090909091', departmentId: 1, designation: 'Head of Department', qualification: 'Ph.D Computer Science', profilePhoto: null,
      subjectIds: [1, 2, 3, 4, 5, 6],
    },
  ];

  const internalMarks = [
    { id: 1, studentId: 1, subjectId: 1, professorId: 1, iaNumber: 1, marks: 17, maxMarks: 20 },
    { id: 2, studentId: 1, subjectId: 1, professorId: 1, iaNumber: 2, marks: 18, maxMarks: 20 },
    { id: 3, studentId: 1, subjectId: 2, professorId: 1, iaNumber: 1, marks: 15, maxMarks: 20 },
    { id: 4, studentId: 1, subjectId: 3, professorId: 1, iaNumber: 1, marks: 19, maxMarks: 20 },
  ];

  return {
    version: DB_VERSION,
    seq: { user: 24, student: 19, professor: 2, subject: 6, internalMark: 4, notification: 0 },
    departments,
    subjects,
    users,
    students,
    professors,
    internalMarks,
    notifications: [],
    resumes: {},
    fees: {},
  };
}

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Re-seed automatically when the stored data predates the current seed.
      if (parsed && parsed.version === DB_VERSION) return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  const fresh = seedDb();
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function nextId(db, key) {
  db.seq[key] = (db.seq[key] || 0) + 1;
  return db.seq[key];
}

// ─── Response helpers (mimic axios) ────────────────────────────────────────────
function ok(data) {
  return Promise.resolve({ data, status: 200 });
}

function fail(message, status = 400) {
  const err = new Error(message);
  err.response = { data: { message }, status };
  return Promise.reject(err);
}

// ─── Domain helpers ────────────────────────────────────────────────────────────
function deptById(db, id) {
  return db.departments.find((d) => String(d.id) === String(id)) || null;
}

function resolveDepartment(db, input) {
  const raw = (input == null ? '' : String(input)).trim();
  if (!raw) return null;
  const found =
    db.departments.find((d) => d.name.toLowerCase() === raw.toLowerCase()) ||
    db.departments.find((d) => d.code.toLowerCase() === raw.toLowerCase());
  if (found) return found;
  const code = raw.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase() || 'GEN';
  const dept = { id: nextId(db, 'department') || db.departments.length + 1, code, name: raw };
  db.departments.push(dept);
  return dept;
}

function provisionSubjects(db, departmentId, semester = 3) {
  let subs = db.subjects.filter((s) => String(s.departmentId) === String(departmentId));
  if (subs.length) return subs;
  const defaults = [
    'Core Subject I', 'Core Subject II', 'Core Subject III',
    'Elective I', 'Elective II', 'Laboratory',
  ];
  subs = defaults.map((name) => {
    const id = nextId(db, 'subject');
    return { id, code: `SUB${String(id).padStart(3, '0')}`, name, departmentId: Number(departmentId), semester, maxMarks: 20 };
  });
  db.subjects.push(...subs);
  saveDb(db);
  return subs;
}

// Ensure named subjects exist in a department (create missing) and return them.
function ensureSubjects(db, departmentId, names) {
  const result = [];
  for (const raw of names || []) {
    const name = String(raw).trim();
    if (!name) continue;
    let sub = db.subjects.find(
      (s) => String(s.departmentId) === String(departmentId)
        && s.name.toLowerCase() === name.toLowerCase(),
    );
    if (!sub) {
      const id = nextId(db, 'subject');
      sub = { id, code: `SUB${String(id).padStart(3, '0')}`, name, departmentId: Number(departmentId), semester: 3, maxMarks: 20 };
      db.subjects.push(sub);
    }
    result.push(sub);
  }
  return result;
}

function buildUserProfile(db, user) {
  const base = {
    id: user.id,
    email: user.email,
    role: user.role,
    isHod: !!user.isHod,
    name: user.email,
  };
  if (user.role === 'STUDENT') {
    const s = db.students.find((x) => x.userId === user.id);
    if (s) {
      const dept = deptById(db, s.departmentId);
      base.studentId = s.id;
      base.name = s.name;
      base.rollNo = s.rollNo;
      base.department = dept ? dept.code : null;
      base.departmentId = s.departmentId;
      base.semester = s.semester;
    }
  } else if (user.role === 'PROFESSOR') {
    const p = db.professors.find((x) => x.userId === user.id);
    if (p) {
      const dept = deptById(db, p.departmentId);
      base.professorId = p.id;
      base.name = p.name;
      base.department = dept ? dept.code : null;
      base.departmentId = p.departmentId;
      if (Array.isArray(p.subjectIds) && p.subjectIds.length) {
        base.subjects = p.subjectIds
          .map((id) => db.subjects.find((s) => s.id === id))
          .filter(Boolean)
          .map((s) => s.name);
      }
    }
  }
  return base;
}

function studentDto(db, s) {
  const dept = deptById(db, s.departmentId);
  return {
    id: s.id,
    rollNo: s.rollNo,
    name: s.name,
    email: s.email,
    phone: s.phone || '',
    dob: s.dob || '',
    bloodGroup: s.bloodGroup || '',
    address: s.address || '',
    department: dept ? dept.code : '',
    departmentId: s.departmentId,
    batch: s.batch || '',
    semester: s.semester,
    section: s.section || 'A',
    parentName: s.parentName || '',
    parentPhone: s.parentPhone || '',
    scholarship: s.scholarship || '',
    profilePhoto: s.profilePhoto || null,
  };
}

// Deterministic academic metrics (attendance % and CGPA) derived from the
// student's register number, so values stay stable across reloads. Used by the
// HOD performance-statistics feature.
function hashCode(str) {
  let h = 0;
  const text = String(str || '');
  for (let i = 0; i < text.length; i += 1) {
    h = (h * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deriveMetrics(student) {
  const seed = hashCode(student.rollNo || student.id);
  const attendance = 58 + (seed % 42);                 // 58–99 %
  const cgpa = Number((5.4 + ((seed >> 3) % 43) / 10).toFixed(1)); // 5.4–9.6
  return { attendance, cgpa };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => {
    const db = loadDb();
    const email = String(data?.email || '').trim().toLowerCase();
    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user) return fail('Invalid email or password', 401);
    if (!user.isActive) return fail('Account is deactivated', 403);
    if (user.password !== data?.password) return fail('Invalid email or password', 401);
    if (user.role === 'PROFESSOR' && data?.accountType === 'HOD' && !user.isHod) {
      return fail('This account is not registered as an HOD.', 403);
    }
    if (user.role === 'PROFESSOR' && Array.isArray(data?.subjects) && data.subjects.length) {
      const p = db.professors.find((x) => x.userId === user.id);
      if (p) {
        const subs = ensureSubjects(db, p.departmentId, data.subjects);
        p.subjectIds = subs.map((s) => s.id);
        saveDb(db);
      }
    }
    const profile = buildUserProfile(db, user);
    if (user.role === 'PROFESSOR' && data?.accountType) {
      profile.role = data.accountType === 'HOD' ? 'HOD' : 'PROFESSOR';
      profile.isHod = data.accountType === 'HOD';
    }
    const token = 'mock.' + btoa(`${user.email}:${user.role}`) + '.token';
    return ok({ token, user: profile });
  },

  register: (data) => {
    const db = loadDb();
    const email = String(data?.email || '').trim().toLowerCase();
    if (!email) return fail('Email is required', 400);
    if (db.users.some((u) => u.email.toLowerCase() === email)) {
      return fail('Email already exists', 409);
    }
    const requestedRole = String(data?.role || 'STUDENT').toUpperCase();
    if (!['STUDENT', 'PROFESSOR', 'HOD', 'MANAGEMENT'].includes(requestedRole)) {
      return fail('Invalid role', 400);
    }
    // An HOD account is stored as a PROFESSOR record flagged with isHod.
    const isHod = requestedRole === 'HOD';
    const role = isHod ? 'PROFESSOR' : requestedRole;

    const userId = nextId(db, 'user');
    db.users.push({ id: userId, email, password: data.password, role, isHod, isActive: true });

    if (role === 'STUDENT' || role === 'PROFESSOR') {
      const dept = resolveDepartment(db, data.department);
      if (!dept) { saveDb(db); return fail('Department is required', 400); }

      if (role === 'STUDENT') {
        const sid = nextId(db, 'student');
        const rollNo = (data.registerNumber && String(data.registerNumber).trim())
          || `STU${String(userId).padStart(6, '0')}`;
        db.students.push({
          id: sid, userId, rollNo, name: (data.name || '').trim(), email,
          phone: '', dob: data.dob || '', bloodGroup: '', address: '',
          departmentId: dept.id, batch: '', semester: Number(data.semester) || 1, section: 'A',
          parentName: '', parentPhone: '', profilePhoto: null,
        });
      } else {
        const subs = ensureSubjects(db, dept.id, Array.isArray(data.subjects) ? data.subjects : []);
        const pid = nextId(db, 'professor');
        db.professors.push({
          id: pid, userId, employeeId: `EMP${String(userId).padStart(6, '0')}`,
          name: (data.name || '').trim(), email, phone: '', departmentId: dept.id,
          designation: isHod ? 'Head of Department' : 'Professor', qualification: '', profilePhoto: null,
          subjectIds: subs.map((s) => s.id),
        });
      }
    }

    saveDb(db);
    const user = db.users.find((u) => u.id === userId);
    return ok({ message: 'Account created successfully', user: buildUserProfile(db, user) });
  },

  resetPassword: (data) => {
    const db = loadDb();
    const email = String(data?.email || '').trim().toLowerCase();
    const newPassword = String(data?.newPassword || '');
    if (!email) return fail('Email is required', 400);
    if (newPassword.length < 6) return fail('Password must be at least 6 characters', 400);

    const user = db.users.find((u) => u.email.toLowerCase() === email);
    if (!user) return fail('No account found with that email', 404);

    // Verify identity with the date of birth on file, when the account has one.
    const profile = db.students.find((s) => s.userId === user.id)
      || db.professors.find((p) => p.userId === user.id);
    const onFileDob = profile?.dob ? String(profile.dob) : '';
    if (onFileDob) {
      const providedDob = String(data?.dob || '');
      if (!providedDob) return fail('Date of birth is required to verify your identity', 400);
      if (providedDob !== onFileDob) return fail('Date of birth does not match our records', 401);
    }

    user.password = newPassword;
    saveDb(db);
    return ok({ message: 'Password reset successful. You can now sign in.' });
  },
};

// ─── Student ──────────────────────────────────────────────────────────────────
export const studentAPI = {
  getProfile: (id) => {
    const db = loadDb();
    const s = db.students.find((x) => String(x.id) === String(id));
    if (!s) return fail('Student not found', 404);
    const dept = deptById(db, s.departmentId);
    return ok({
      name: s.name, rollNo: s.rollNo, email: s.email, phone: s.phone || '',
      department: dept ? dept.name : '', semester: s.semester, batch: s.batch || '',
      section: s.section || 'A', dob: s.dob || '', bloodGroup: s.bloodGroup || '',
      address: s.address || '', parentName: s.parentName || '', parentPhone: s.parentPhone || '',
      profilePhoto: s.profilePhoto || null,
    });
  },

  updateProfile: (id, data) => {
    const db = loadDb();
    const s = db.students.find((x) => String(x.id) === String(id));
    if (!s) return fail('Student not found', 404);
    Object.assign(s, {
      name: data.name ?? s.name, dob: data.dob ?? s.dob, bloodGroup: data.bloodGroup ?? s.bloodGroup,
      phone: data.phone ?? s.phone, address: data.address ?? s.address,
      parentName: data.parentName ?? s.parentName, parentPhone: data.parentPhone ?? s.parentPhone,
    });
    saveDb(db);
    return ok({ message: 'Profile updated', ...studentDto(db, s) });
  },

  getNotes: () => ok([]),
  getNotesBySubject: () => ok([]),

  getInternalMarks: (studentId) => {
    const db = loadDb();
    const rows = db.internalMarks
      .filter((m) => String(m.studentId) === String(studentId))
      .map((m) => {
        const sub = db.subjects.find((s) => s.id === m.subjectId);
        return {
          subjectId: m.subjectId,
          subjectCode: sub ? sub.code : '',
          subjectName: sub ? sub.name : `Subject ${m.subjectId}`,
          maxMarks: m.maxMarks ?? (sub ? sub.maxMarks : 20),
          iaNumber: m.iaNumber,
          marks: m.marks,
        };
      });
    return ok(rows);
  },

  getSemesterMarks: () => ok([]),
  getTimetable: () => ok([]),

  getFees: (studentId) => {
    const db = loadDb();
    return ok(db.fees[studentId] || []);
  },
  payFee: (studentId, data) => {
    const db = loadDb();
    const list = db.fees[studentId] || (db.fees[studentId] = []);
    const record = { id: list.length + 1, ...data, status: 'PAID', paidOn: new Date().toISOString() };
    list.push(record);
    saveDb(db);
    return ok({ message: 'Payment recorded', ...record });
  },

  getQuiz: () => ok([]),
  submitQuiz: (data) => ok({ message: 'Quiz submitted', ...data }),

  getNotifications: (studentId) => {
    const db = loadDb();
    return ok(db.notifications.filter(
      (n) => n.audience === 'all' || String(n.studentId) === String(studentId),
    ));
  },

  getResume: (studentId) => {
    const db = loadDb();
    return ok(db.resumes[studentId] || null);
  },
  saveResume: (studentId, data) => {
    const db = loadDb();
    db.resumes[studentId] = data;
    saveDb(db);
    return ok({ message: 'Resume saved' });
  },
};

// ─── Professor ────────────────────────────────────────────────────────────────
export const professorAPI = {
  getProfile: (id) => {
    const db = loadDb();
    const p = db.professors.find((x) => String(x.id) === String(id));
    if (!p) return fail('Professor not found', 404);
    const dept = deptById(db, p.departmentId);
    return ok({
      name: p.name, employeeId: p.employeeId, email: p.email, phone: p.phone || '',
      department: dept ? dept.name : '', designation: p.designation || '',
      qualification: p.qualification || '', profilePhoto: p.profilePhoto || null,
    });
  },

  updateProfile: (id, data) => {
    const db = loadDb();
    const p = db.professors.find((x) => String(x.id) === String(id));
    if (!p) return fail('Professor not found', 404);
    Object.assign(p, {
      name: data.name ?? p.name, phone: data.phone ?? p.phone,
      designation: data.designation ?? p.designation, qualification: data.qualification ?? p.qualification,
    });
    saveDb(db);
    return ok({ message: 'Profile updated' });
  },

  getSubjects: (professorId) => {
    const db = loadDb();
    const p = db.professors.find((x) => String(x.id) === String(professorId));
    if (p && Array.isArray(p.subjectIds) && p.subjectIds.length) {
      const subs = p.subjectIds
        .map((id) => db.subjects.find((s) => s.id === id))
        .filter(Boolean);
      if (subs.length) return ok(subs.map((s) => ({ id: s.id, name: s.name, code: s.code })));
    }
    const deptId = p ? p.departmentId : 1;
    const subs = provisionSubjects(db, deptId);
    return ok(subs.map((s) => ({ id: s.id, name: s.name, code: s.code })));
  },

  getStudentsForPortal: (departmentId, semester, section) => {
    const db = loadDb();
    let list = db.students;
    if (departmentId != null && departmentId !== '') {
      list = list.filter((s) => String(s.departmentId) === String(departmentId));
    }
    if (semester != null && semester !== '') {
      list = list.filter((s) => String(s.semester) === String(semester));
    }
    if (section != null && section !== '') {
      list = list.filter((s) => String(s.section) === String(section));
    }
    return ok(list.map((s) => studentDto(db, s)));
  },

  createStudentFromPortal: (data) => {
    const db = loadDb();
    const email = String(data?.email || '').trim().toLowerCase();
    if (email && db.users.some((u) => u.email.toLowerCase() === email)) {
      return fail('Email already exists', 409);
    }
    const userId = nextId(db, 'user');
    const rollNo = (data.rollNo && String(data.rollNo).trim()) || `STU${String(userId).padStart(6, '0')}`;
    const defaultPassword = data.password && String(data.password).trim()
      ? String(data.password)
      : `${rollNo}@123`;
    db.users.push({ id: userId, email: email || `${rollNo.toLowerCase()}@college.edu`, password: defaultPassword, role: 'STUDENT', isHod: false, isActive: true });

    const sid = nextId(db, 'student');
    const student = {
      id: sid, userId, rollNo, name: (data.name || '').trim(), email: email || `${rollNo.toLowerCase()}@college.edu`,
      phone: data.phone || '', dob: data.dob || '', bloodGroup: data.bloodGroup || '', address: data.address || '',
      departmentId: Number(data.departmentId) || 1, batch: data.batch || '', semester: Number(data.semester) || 1,
      section: data.section || 'A', parentName: data.parentName || '', parentPhone: data.parentPhone || '', profilePhoto: null,
    };
    db.students.push(student);
    saveDb(db);
    return ok({ ...studentDto(db, student), defaultPassword });
  },

  updateStudentFromPortal: (studentId, data) => {
    const db = loadDb();
    const s = db.students.find((x) => String(x.id) === String(studentId));
    if (!s) return fail('Student not found', 404);
    Object.assign(s, {
      name: data.name ?? s.name, phone: data.phone ?? s.phone, dob: data.dob ?? s.dob,
      bloodGroup: data.bloodGroup ?? s.bloodGroup, address: data.address ?? s.address,
      semester: data.semester != null ? Number(data.semester) : s.semester,
      section: data.section ?? s.section, parentName: data.parentName ?? s.parentName,
      parentPhone: data.parentPhone ?? s.parentPhone,
      departmentId: data.departmentId != null ? Number(data.departmentId) : s.departmentId,
    });
    saveDb(db);
    return ok(studentDto(db, s));
  },

  getStudentsBySubject: (subjectId) => {
    const db = loadDb();
    const sub = db.subjects.find((s) => String(s.id) === String(subjectId));
    if (!sub) return ok([]);
    return ok(db.students.filter((s) => String(s.departmentId) === String(sub.departmentId)).map((s) => studentDto(db, s)));
  },

  addInternalMarks: (data) => {
    const db = loadDb();
    const existing = db.internalMarks.find(
      (m) => String(m.studentId) === String(data.studentId)
        && String(m.subjectId) === String(data.subjectId)
        && String(m.iaNumber) === String(data.iaNumber),
    );
    const sub = db.subjects.find((s) => String(s.id) === String(data.subjectId));
    const maxMarks = sub ? sub.maxMarks : 20;
    if (existing) {
      existing.marks = data.marks;
      existing.professorId = data.professorId ?? existing.professorId;
      saveDb(db);
      return ok({ ...existing });
    }
    const record = {
      id: nextId(db, 'internalMark'),
      studentId: Number(data.studentId), subjectId: Number(data.subjectId),
      professorId: data.professorId != null ? Number(data.professorId) : null,
      iaNumber: Number(data.iaNumber), marks: data.marks, maxMarks,
    };
    db.internalMarks.push(record);
    saveDb(db);
    return ok({ ...record });
  },

  updateInternalMarks: (id, data) => {
    const db = loadDb();
    const m = db.internalMarks.find((x) => String(x.id) === String(id));
    if (!m) return fail('Marks not found', 404);
    if (data.marks != null) m.marks = data.marks;
    saveDb(db);
    return ok({ ...m });
  },

  // Returns all internal marks as flat, human-readable rows suitable for
  // exporting to a JSON file. Optionally scoped to a single professor.
  getInternalMarksForExport: (professorId) => {
    const db = loadDb();
    const rows = db.internalMarks
      .filter((m) => professorId == null || String(m.professorId) === String(professorId))
      .map((m) => {
        const sub = db.subjects.find((s) => s.id === m.subjectId);
        const stu = db.students.find((s) => s.id === m.studentId);
        const dept = sub ? db.departments.find((d) => d.id === sub.departmentId) : null;
        return {
          id: m.id,
          rollNo: stu ? stu.rollNo : null,
          studentName: stu ? stu.name : `Student ${m.studentId}`,
          studentId: m.studentId,
          department: dept ? dept.name : null,
          subjectCode: sub ? sub.code : '',
          subjectName: sub ? sub.name : `Subject ${m.subjectId}`,
          subjectId: m.subjectId,
          iaNumber: m.iaNumber,
          marks: m.marks,
          maxMarks: m.maxMarks ?? (sub ? sub.maxMarks : 20),
          professorId: m.professorId,
        };
      })
      .sort((a, b) => (a.rollNo || '').localeCompare(b.rollNo || '') || a.iaNumber - b.iaNumber);
    return ok(rows);
  },

  sendSemesterMarks: (data) => ok({ message: 'Semester marks sent', ...data }),

  sendNotification: (data) => {
    const db = loadDb();
    const note = {
      id: nextId(db, 'notification'),
      title: data.title, message: data.message, type: data.type || 'info',
      audience: data.recipientType === 'student' ? 'student' : 'all',
      studentId: data.student || null, section: data.section || null,
      from: data.from || 'Professor', time: new Date().toISOString(), read: false,
    };
    db.notifications.push(note);
    saveDb(db);
    return ok({ message: 'Notification sent', ...note });
  },

  getNotificationsSent: () => {
    const db = loadDb();
    return ok(db.notifications);
  },
};

// ─── HOD ──────────────────────────────────────────────────────────────────────
export const hodAPI = {
  getAllStudents: () => {
    const db = loadDb();
    return ok(db.students.map((s) => studentDto(db, s)));
  },
  getStudentDetail: (id) => {
    const db = loadDb();
    const s = db.students.find((x) => String(x.id) === String(id));
    return s ? ok(studentDto(db, s)) : fail('Student not found', 404);
  },
  getAllProfessors: () => {
    const db = loadDb();
    return ok(db.professors.map((p) => {
      const dept = deptById(db, p.departmentId);
      return {
        id: p.id, name: p.name, employeeId: p.employeeId, email: p.email,
        phone: p.phone || '', department: dept ? dept.code : '', departmentId: p.departmentId,
        designation: p.designation || '', qualification: p.qualification || '',
      };
    }));
  },
  getProfessorDetail: (id) => {
    const db = loadDb();
    const p = db.professors.find((x) => String(x.id) === String(id));
    return p ? ok(p) : fail('Professor not found', 404);
  },
  getAttendance: () => ok([]),
  updateAttendance: (data) => ok({ message: 'Attendance saved', ...data }),
  getLowAttendanceStudents: () => ok([]),
  getLowMarksStudents: () => ok([]),
  getPerformanceStats: () => {
    const db = loadDb();
    const students = db.students.map((s) => ({ ...studentDto(db, s), ...deriveMetrics(s) }));
    const count = students.length || 1;
    const round1 = (n) => Number(n.toFixed(1));

    const highMarks = students
      .filter((s) => s.cgpa >= 8.5)
      .sort((a, b) => b.cgpa - a.cgpa);
    const lowMarks = students
      .filter((s) => s.cgpa < 7.0)
      .sort((a, b) => a.cgpa - b.cgpa);
    const highAttendance = students
      .filter((s) => s.attendance >= 90)
      .sort((a, b) => b.attendance - a.attendance);
    const lowAttendance = students
      .filter((s) => s.attendance < 75)
      .sort((a, b) => a.attendance - b.attendance);

    const summary = {
      totalStudents: students.length,
      avgCgpa: round1(students.reduce((sum, s) => sum + s.cgpa, 0) / count),
      avgAttendance: Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / count),
      highMarks: highMarks.length,
      lowMarks: lowMarks.length,
      highAttendance: highAttendance.length,
      lowAttendance: lowAttendance.length,
    };

    return ok({ summary, highMarks, lowMarks, highAttendance, lowAttendance });
  },
  getDepartmentStats: () => {
    const db = loadDb();
    return ok({
      students: db.students.length,
      professors: db.professors.length,
      lowAttendance: 0,
      lowMarks: 0,
    });
  },

  // College-wide internal marks (all professors) for JSON export.
  getInternalMarksForExport: () => professorAPI.getInternalMarksForExport(null),
};

// ─── Management ───────────────────────────────────────────────────────────────
export const managementAPI = {
  getDashboardStats: () => {
    const db = loadDb();
    return ok({
      students: db.students.length,
      professors: db.professors.length,
      departments: db.departments.length,
    });
  },
  getAllDepartments: () => {
    const db = loadDb();
    return ok(db.departments);
  },
  getFinancialReport: () => ok({ totalCollected: 0, pending: 0, records: [] }),
  broadcastNotification: (data) => {
    const db = loadDb();
    const note = {
      id: nextId(db, 'notification'),
      title: data.title, message: data.message, type: data.type || 'info',
      audience: 'all', from: data.from || 'Management', time: new Date().toISOString(), read: false,
    };
    db.notifications.push(note);
    saveDb(db);
    return ok({ message: 'Broadcast sent', ...note });
  },
};

// ─── AI Assistant ─────────────────────────────────────────────────────────────
// No external AI service in offline mode — components fall back to local demo answers.
export const aiAPI = {
  ask: () =>
    Promise.reject(new Error('AI service unavailable in offline mode')),
  getSkillGames: () => Promise.reject(new Error('Games service unavailable in offline mode')),
  getGameById: () => Promise.reject(new Error('Games service unavailable in offline mode')),
};
