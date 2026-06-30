-- ============================================================
-- Smart Student Application – MySQL Schema
-- Engine: InnoDB | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS smart_student_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smart_student_db;

-- ─── Departments ─────────────────────────────────────────────
CREATE TABLE departments (
  id          INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)     NOT NULL,
  code        VARCHAR(20)      NOT NULL UNIQUE,
  hod_id      INT UNSIGNED,       -- FK added after professors table
  created_at  TIMESTAMP        DEFAULT CURRENT_TIMESTAMP
);

-- ─── Users (shared auth table) ───────────────────────────────
-- role: STUDENT | PROFESSOR | MANAGEMENT
CREATE TABLE users (
  id            INT UNSIGNED     AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150)     NOT NULL UNIQUE,
  password_hash VARCHAR(255)     NOT NULL,   -- bcrypt
  role          ENUM('STUDENT','PROFESSOR','MANAGEMENT') NOT NULL,
  is_hod        TINYINT(1)       DEFAULT 0,
  is_active     TINYINT(1)       DEFAULT 1,
  created_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── Students ────────────────────────────────────────────────
CREATE TABLE students (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED   NOT NULL UNIQUE,
  roll_no         VARCHAR(20)    NOT NULL UNIQUE,
  name            VARCHAR(120)   NOT NULL,
  dob             DATE,
  blood_group     VARCHAR(5),
  phone           VARCHAR(15),
  address         TEXT,
  department_id   INT UNSIGNED   NOT NULL,
  batch           VARCHAR(20),
  semester        TINYINT UNSIGNED DEFAULT 1,
  section         CHAR(1),
  parent_name     VARCHAR(120),
  parent_phone    VARCHAR(15),
  profile_photo   VARCHAR(300),
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ─── Professors ───────────────────────────────────────────────
CREATE TABLE professors (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED   NOT NULL UNIQUE,
  employee_id     VARCHAR(20)    NOT NULL UNIQUE,
  name            VARCHAR(120)   NOT NULL,
  phone           VARCHAR(15),
  department_id   INT UNSIGNED   NOT NULL,
  designation     VARCHAR(80),
  qualification   VARCHAR(120),
  profile_photo   VARCHAR(300),
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

ALTER TABLE departments
  ADD CONSTRAINT fk_dept_hod FOREIGN KEY (hod_id) REFERENCES professors(id) ON DELETE SET NULL;

-- ─── Subjects ─────────────────────────────────────────────────
CREATE TABLE subjects (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(20)    NOT NULL UNIQUE,
  name            VARCHAR(150)   NOT NULL,
  department_id   INT UNSIGNED   NOT NULL,
  semester        TINYINT UNSIGNED NOT NULL,
  credits         TINYINT UNSIGNED DEFAULT 3,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ─── Professor–Subject assignments ───────────────────────────
CREATE TABLE professor_subjects (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  professor_id  INT UNSIGNED   NOT NULL,
  subject_id    INT UNSIGNED   NOT NULL,
  section       CHAR(1),
  academic_year VARCHAR(10),
  UNIQUE KEY uk_prof_sub_sec (professor_id, subject_id, section),
  FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id)   REFERENCES subjects(id)   ON DELETE CASCADE
);

-- ─── Notes ────────────────────────────────────────────────────
CREATE TABLE notes (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT UNSIGNED   NOT NULL,
  professor_id  INT UNSIGNED   NOT NULL,
  title         VARCHAR(200)   NOT NULL,
  file_path     VARCHAR(400),
  file_size     VARCHAR(20),
  file_type     VARCHAR(20),
  unit_number   TINYINT UNSIGNED,
  uploaded_at   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id)   REFERENCES subjects(id)   ON DELETE CASCADE,
  FOREIGN KEY (professor_id) REFERENCES professors(id)
);

-- ─── Internal Assessment Marks ────────────────────────────────
CREATE TABLE internal_marks (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED   NOT NULL,
  subject_id    INT UNSIGNED   NOT NULL,
  ia_number     TINYINT UNSIGNED NOT NULL,  -- 1, 2, or 3
  marks         DECIMAL(5,2)   NOT NULL CHECK (marks >= 0 AND marks <= 20),
  max_marks     DECIMAL(5,2)   DEFAULT 20,
  added_by      INT UNSIGNED   NOT NULL,    -- professor_id
  added_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_ia (student_id, subject_id, ia_number),
  FOREIGN KEY (student_id)  REFERENCES students(id)   ON DELETE CASCADE,
  FOREIGN KEY (subject_id)  REFERENCES subjects(id)   ON DELETE CASCADE,
  FOREIGN KEY (added_by)    REFERENCES professors(id)
);

-- ─── Semester Marks ───────────────────────────────────────────
CREATE TABLE semester_marks (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  student_id      INT UNSIGNED   NOT NULL,
  subject_id      INT UNSIGNED   NOT NULL,
  semester        TINYINT UNSIGNED NOT NULL,
  internal_marks  DECIMAL(5,2),
  external_marks  DECIMAL(5,2),
  total_marks     DECIMAL(5,2) GENERATED ALWAYS AS (internal_marks + external_marks) STORED,
  max_marks       DECIMAL(5,2)   DEFAULT 150,
  result          ENUM('PASS','FAIL','ABSENT','WITHHELD') DEFAULT 'PASS',
  published_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sem_mark (student_id, subject_id, semester),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- ─── Timetable ────────────────────────────────────────────────
CREATE TABLE timetable (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  department_id INT UNSIGNED   NOT NULL,
  semester      TINYINT UNSIGNED NOT NULL,
  section       CHAR(1),
  day_of_week   ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  period_number TINYINT UNSIGNED NOT NULL,
  start_time    TIME           NOT NULL,
  end_time      TIME           NOT NULL,
  subject_id    INT UNSIGNED,
  professor_id  INT UNSIGNED,
  room          VARCHAR(30),
  is_lab        TINYINT(1)     DEFAULT 0,
  effective_from DATE,
  effective_to   DATE,
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (subject_id)    REFERENCES subjects(id),
  FOREIGN KEY (professor_id)  REFERENCES professors(id)
);

-- ─── Attendance ───────────────────────────────────────────────
CREATE TABLE attendance (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED   NOT NULL,
  subject_id    INT UNSIGNED   NOT NULL,
  date          DATE           NOT NULL,
  period_number TINYINT UNSIGNED,
  status        ENUM('PRESENT','ABSENT','OD','MEDICAL') DEFAULT 'ABSENT',
  marked_by     INT UNSIGNED,   -- professor_id or hod
  marked_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_att (student_id, subject_id, date, period_number),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by)  REFERENCES professors(id)
);

-- ─── Fees ─────────────────────────────────────────────────────
CREATE TABLE fee_types (
  id          INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)   NOT NULL,
  amount      DECIMAL(10,2)  NOT NULL,
  semester    TINYINT UNSIGNED,   -- NULL = annual
  description TEXT
);

CREATE TABLE student_fees (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED   NOT NULL,
  fee_type_id   INT UNSIGNED   NOT NULL,
  amount_due    DECIMAL(10,2)  NOT NULL,
  amount_paid   DECIMAL(10,2)  DEFAULT 0,
  due_date      DATE,
  paid_date     DATE,
  payment_method VARCHAR(50),
  transaction_ref VARCHAR(100),
  receipt_no    VARCHAR(50)    UNIQUE,
  status        ENUM('PENDING','PAID','PARTIAL','WAIVED') DEFAULT 'PENDING',
  academic_year VARCHAR(10),
  FOREIGN KEY (student_id)  REFERENCES students(id)   ON DELETE CASCADE,
  FOREIGN KEY (fee_type_id) REFERENCES fee_types(id)
);

-- ─── Notifications ────────────────────────────────────────────
CREATE TABLE notifications (
  id              INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  sender_id       INT UNSIGNED   NOT NULL,   -- user_id
  sender_role     ENUM('PROFESSOR','HOD','MANAGEMENT') NOT NULL,
  recipient_type  ENUM('ALL','DEPARTMENT','SECTION','STUDENT') NOT NULL,
  recipient_ref   VARCHAR(50),   -- roll_no, section, dept code, or NULL for all
  title           VARCHAR(200)   NOT NULL,
  message         TEXT           NOT NULL,
  notif_type      ENUM('INFO','WARNING','SUCCESS','DANGER') DEFAULT 'INFO',
  created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE notification_reads (
  notification_id INT UNSIGNED   NOT NULL,
  student_id      INT UNSIGNED   NOT NULL,
  read_at         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (notification_id, student_id),
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id)      REFERENCES students(id)      ON DELETE CASCADE
);

-- ─── Resume ───────────────────────────────────────────────────
CREATE TABLE student_resumes (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED   NOT NULL UNIQUE,
  resume_json   JSON           NOT NULL,
  last_updated  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- ─── Quiz ─────────────────────────────────────────────────────
CREATE TABLE quizzes (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  subject_id    INT UNSIGNED   NOT NULL,
  title         VARCHAR(200)   NOT NULL,
  time_per_q    TINYINT UNSIGNED DEFAULT 15,   -- seconds
  created_by    INT UNSIGNED   NOT NULL,         -- professor_id
  created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES professors(id)
);

CREATE TABLE quiz_questions (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  quiz_id       INT UNSIGNED   NOT NULL,
  question      TEXT           NOT NULL,
  option_a      VARCHAR(300)   NOT NULL,
  option_b      VARCHAR(300)   NOT NULL,
  option_c      VARCHAR(300)   NOT NULL,
  option_d      VARCHAR(300)   NOT NULL,
  correct_opt   TINYINT UNSIGNED NOT NULL CHECK (correct_opt BETWEEN 0 AND 3),
  explanation   TEXT,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE quiz_attempts (
  id            INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  student_id    INT UNSIGNED   NOT NULL,
  quiz_id       INT UNSIGNED   NOT NULL,
  score         TINYINT UNSIGNED,
  total         TINYINT UNSIGNED,
  answers_json  JSON,           -- [{questionId, selected}]
  attempted_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (quiz_id)    REFERENCES quizzes(id)  ON DELETE CASCADE
);

-- ─── Useful views ─────────────────────────────────────────────
CREATE OR REPLACE VIEW v_student_attendance_pct AS
SELECT
  a.student_id,
  a.subject_id,
  COUNT(*) AS total_classes,
  SUM(CASE WHEN a.status IN ('PRESENT','OD') THEN 1 ELSE 0 END) AS attended,
  ROUND(
    SUM(CASE WHEN a.status IN ('PRESENT','OD') THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
  ) AS attendance_pct
FROM attendance a
GROUP BY a.student_id, a.subject_id;

CREATE OR REPLACE VIEW v_student_ia_total AS
SELECT
  im.student_id,
  im.subject_id,
  SUM(im.marks)    AS total_ia,
  SUM(im.max_marks) AS total_max,
  ROUND(SUM(im.marks) / SUM(im.max_marks) * 100, 2) AS ia_pct
FROM internal_marks im
GROUP BY im.student_id, im.subject_id;

CREATE OR REPLACE VIEW v_account_details AS
SELECT
  u.id                             AS user_id,
  u.email                          AS email,
  u.role                           AS role,
  u.is_hod                         AS is_hod,
  u.is_active                      AS is_active,
  u.created_at                     AS created_at,
  u.updated_at                     AS updated_at,
  COALESCE(s.name, p.name, '')     AS full_name,
  s.roll_no                        AS roll_no,
  p.employee_id                    AS employee_id,
  d.name                           AS department_name,
  d.code                           AS department_code,
  s.semester                       AS semester,
  s.section                        AS section
FROM users u
LEFT JOIN students s ON s.user_id = u.id
LEFT JOIN professors p ON p.user_id = u.id
LEFT JOIN departments d ON d.id = COALESCE(s.department_id, p.department_id);

-- ─── Seed data ────────────────────────────────────────────────
INSERT INTO departments (name, code) VALUES
  ('Computer Science & Engineering', 'CSE'),
  ('Electronics & Communication',    'ECE'),
  ('Mechanical Engineering',         'MECH');

INSERT INTO users (email, password_hash, role) VALUES
  ('student@demo.com',   '$2a$12$demoHashStudent',  'STUDENT'),
  ('manobalancse2023@gmail.com','Manobalan@018',  'STUDENT'),
  ('professor@demo.com', '$2a$12$demoHashProf',     'PROFESSOR'),
  ('hod@demo.com',       '$2a$12$demoHashHOD',      'PROFESSOR'),
  ('mgmt@demo.com',      '$2a$12$demoHashMgmt',     'MANAGEMENT');

UPDATE users SET is_hod = 1 WHERE email = 'hod@demo.com';

INSERT INTO fee_types (name, amount, semester, description) VALUES
  ('Tuition Fee',    45000.00, NULL, 'Annual tuition fee'),
  ('Exam Fee',        2500.00, NULL, 'Semester examination fee'),
  ('Library Fee',     1000.00, NULL, 'Annual library usage fee'),
  ('Laboratory Fee',  3000.00, NULL, 'Lab consumables and maintenance'),
  ('Bus Fee',         1800.00, NULL, 'Monthly transport fee');
