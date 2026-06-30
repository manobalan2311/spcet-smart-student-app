# SPCET Smart Student App

A full-stack college student management platform with role-based portals for **Students**, **Professors**, and **Heads of Department (HOD)**. The frontend is a React + Vite single-page application; the backend is a Spring Boot REST API secured with JWT.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Backend (Spring Boot)](#backend-spring-boot)
  - [Frontend (React + Vite)](#frontend-react--vite)
- [Configuration](#configuration)
- [API Overview](#api-overview)
- [Features by Role](#features-by-role)
- [Database](#database)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────────────┐         REST / JSON (JWT)        ┌──────────────────────────┐
│   my-react-app           │  ───────────────────────────▶   │  smart-student-backend    │
│   React 19 + Vite 8      │                                  │  Spring Boot 3.2.5 / Java 17│
│   http://localhost:5173  │  ◀───────────────────────────   │  http://localhost:8080     │
└─────────────────────────┘                                  └────────────┬──────────────┘
                                                                          │ JPA / Hibernate
                                                                          ▼
                                                              ┌──────────────────────────┐
                                                              │  H2 file database         │
                                                              │  ./data/smart_student_db  │
                                                              └──────────────────────────┘
```

---

## Tech Stack

### Frontend (`my-react-app`)
- React 19 with the React Compiler
- Vite 8 (dev server + build)
- React Router DOM 7
- Axios for HTTP
- React Icons
- ESLint

### Backend (`smart-student-backend`)
- Spring Boot 3.2.5 (Web, Data JPA, Security, Validation)
- Java 17
- JWT authentication (jjwt 0.12.5), BCrypt password hashing
- H2 embedded file database (MySQL compatibility mode)
- Lombok
- Maven (with `mvnw` wrapper)

---

## Project Structure

```
Project/
├── README.md                         ← this file
├── Smart_Student_Application_Report.docx
│
├── my-react-app/                     ← Frontend (React + Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── database/
│   │   └── schema.sql
│   └── src/
│       ├── main.jsx                  ← app entry
│       ├── App.jsx                   ← routes
│       ├── context/                  ← AuthContext, ThemeContext
│       ├── services/
│       │   └── api.js                ← Axios API layer
│       └── components/
│           ├── auth/                 ← Login
│           ├── common/               ← Sidebar, ProtectedRoute
│           ├── hod/                  ← HOD dashboard & management
│           ├── professor/            ← Professor portal
│           └── student/              ← Student portal
│
└── smart-student-backend/            ← Backend (Spring Boot)
    ├── pom.xml
    ├── mvnw / mvnw.cmd
    ├── data/                         ← H2 database & JSON backups
    └── src/main/
        ├── java/com/smartstudent/
        │   ├── SmartStudentApplication.java
        │   ├── config/               ← SecurityConfig
        │   ├── controller/           ← Auth, HOD, Professor, Student
        │   ├── model/                ← JPA entities
        │   ├── repository/           ← Spring Data repositories
        │   ├── security/             ← JWT filter & utilities
        │   └── service/              ← JsonBackupService
        └── resources/
            └── application.properties
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **JDK 17** (a full JDK, not just a JRE — see [Troubleshooting](#troubleshooting))

---

## Getting Started

Run the **backend** and **frontend** in two separate terminals.

### Backend (Spring Boot)

```powershell
cd smart-student-backend

# Ensure JAVA_HOME points to a JDK 17 (PowerShell example for Eclipse Adoptium):
$jdk = (Get-ChildItem "$env:LOCALAPPDATA\Programs\Eclipse Adoptium" -Directory |
        Where-Object { $_.Name -like 'jdk-17*' } | Select-Object -First 1).FullName
$env:JAVA_HOME = $jdk

.\mvnw.cmd spring-boot:run
```

The API starts on **http://localhost:8080**.

### Frontend (React + Vite)

```powershell
cd my-react-app
npm install
npm run dev
```

The app starts on **http://localhost:5173** and proxies API calls to the backend.

#### Frontend scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server (HMR)      |
| `npm run build`   | Production build to `dist/`          |
| `npm run preview` | Preview the production build locally |
| `npm run lint`    | Run ESLint                           |

---

## Configuration

Backend settings live in [smart-student-backend/src/main/resources/application.properties](smart-student-backend/src/main/resources/application.properties):

| Property                  | Default                                | Notes                                   |
| ------------------------- | -------------------------------------- | --------------------------------------- |
| `server.port`             | `8080`                                 | API port                                |
| `spring.datasource.url`   | `jdbc:h2:file:./data/smart_student_db` | H2 file DB (MySQL mode)                 |
| `spring.h2.console.path`  | `/h2-console`                          | H2 web console                          |
| `jwt.secret`              | _dev placeholder_                      | **Change for production**               |
| `jwt.expiration-ms`       | `86400000`                             | Token lifetime (24h)                    |
| `cors.allowed-origins`    | `http://localhost:5173`                | Allowed frontend origin                 |
| `upload.dir`              | `./uploads`                            | File upload directory                   |

> Replace `jwt.secret` with a strong 256-bit secret before deploying.

---

## API Overview

All endpoints are prefixed under `/api`. Authentication is via a JWT bearer token obtained from the login endpoint.

### Auth — `/api/auth`
| Method | Path        | Description              |
| ------ | ----------- | ------------------------ |
| POST   | `/login`    | Authenticate, returns JWT |
| POST   | `/register` | Register a new account    |

### Professor — `/api`
| Method | Path                                  | Description                          |
| ------ | ------------------------------------- | ------------------------------------ |
| POST   | `/internal-marks`                     | Save a student's internal marks      |
| GET    | `/professors/{professorId}/subjects`  | Subjects for the professor's dept    |
| GET    | `/professors/{id}/profile`            | Get professor profile                |
| PUT    | `/professors/{id}/profile`            | Update professor profile             |
| POST   | `/notifications`                      | Send a notification                  |
| GET    | `/professors/students`                | List students (enriched DTO)         |
| POST   | `/professors/students`                | Create a student (+ login account)   |
| PUT    | `/professors/students/{studentId}`    | Update a student                     |

### HOD — `/api/hod`
| Method | Path                       | Description                       |
| ------ | -------------------------- | --------------------------------- |
| GET    | `/students`                | List all students                 |
| GET    | `/students/{id}`           | Student details                   |
| GET    | `/accounts`                | Accounts overview                 |
| GET    | `/attendance`              | Attendance records                |
| POST   | `/attendance`              | Record attendance                 |
| GET    | `/students/low-attendance` | Low-attendance students           |
| GET    | `/students/low-marks`      | Low-performing students           |
| GET    | `/stats`                   | Dashboard statistics              |

### Student — `/api/students`
| Method | Path                       | Description                       |
| ------ | -------------------------- | --------------------------------- |
| GET    | `/{id}/internal-marks`     | Student's internal marks (DTO)    |
| GET    | `/{id}/profile`            | Student profile                   |

> See the controllers in [smart-student-backend/src/main/java/com/smartstudent/controller](smart-student-backend/src/main/java/com/smartstudent/controller) for the full, authoritative list.

---

## Features by Role

### Student
- Dashboard, profile, timetable
- Internal & semester marks
- Notes, notifications, fees payment
- Quiz, skill games, resume builder, AI assistant

### Professor
- Dashboard & profile
- Add internal marks, view semester marks
- Student list management (add/update)
- Send notifications

### HOD
- Department dashboard & statistics
- Student management
- Attendance management
- Low-performer / low-attendance tracking

---

## Database

- **Engine:** H2 in file mode at `smart-student-backend/data/smart_student_db` (MySQL compatibility mode).
- **Schema management:** `spring.jpa.hibernate.ddl-auto=update` — tables are created/updated automatically from JPA entities.
- **Console:** With the backend running, open **http://localhost:8080/h2-console** (JDBC URL `jdbc:h2:file:./data/smart_student_db`, user `sa`, no password).
- A reference SQL schema is also provided at [my-react-app/database/schema.sql](my-react-app/database/schema.sql).
- JSON backups are stored under `smart-student-backend/data/`.

---

## Troubleshooting

- **`mvnw` fails with a JRE error:** The system default Java may be a JRE. Set `JAVA_HOME` to a full **JDK 17** before running (see [Backend](#backend-spring-boot)).
- **PowerShell command chaining:** PowerShell 5.1 does not support `&&` — chain commands with `;`.
- **CORS / login errors from the frontend:** Ensure the backend is running on `:8080` and `cors.allowed-origins` matches the frontend origin (`http://localhost:5173`).
- **Stale UI after build:** Edit files under `src/` and `index.html`. The `dist/` folder is generated build output and should not be edited by hand.

---

## License

Internal / educational project. Add a license here if distributing.
