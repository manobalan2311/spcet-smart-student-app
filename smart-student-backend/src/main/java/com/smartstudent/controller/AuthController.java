package com.smartstudent.controller;

import com.smartstudent.model.Department;
import com.smartstudent.model.Professor;
import com.smartstudent.model.Student;
import com.smartstudent.model.User;
import com.smartstudent.repository.DepartmentRepository;
import com.smartstudent.repository.ProfessorRepository;
import com.smartstudent.repository.StudentRepository;
import com.smartstudent.repository.UserRepository;
import com.smartstudent.security.JwtUtil;
import com.smartstudent.service.JsonBackupService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ProfessorRepository professorRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final JsonBackupService jsonBackupService;

    public AuthController(
        UserRepository userRepository,
        StudentRepository studentRepository,
        ProfessorRepository professorRepository,
        DepartmentRepository departmentRepository,
        PasswordEncoder passwordEncoder,
        JwtUtil jwtUtil,
        JsonBackupService jsonBackupService
    ) {
        this.userRepository  = userRepository;
        this.studentRepository = studentRepository;
        this.professorRepository = professorRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil         = jwtUtil;
        this.jsonBackupService = jsonBackupService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!user.isActive()) {
            return ResponseEntity.status(403).body(Map.of("message", "Account is deactivated"));
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        Map<String, Object> profile = buildProfile(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.isHod());

        jsonBackupService.saveLoginSession(
            user.getEmail(),
            user.getRole().name(),
            String.valueOf(profile.getOrDefault("name", user.getEmail())));

        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", profile
        ));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.status(409).body(Map.of("message", "Email already exists"));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role"));
        }

        LocalDate dob;
        try {
            dob = LocalDate.parse(request.dob());
        } catch (DateTimeParseException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid date format for dob"));
        }

        User user = User.builder()
            .email(email)
            .passwordHash(passwordEncoder.encode(request.password()))
            .role(role)
            .isHod(false)
            .isActive(true)
            .build();

        User saved = userRepository.save(user);

        if (role == User.Role.STUDENT || role == User.Role.PROFESSOR) {
            Department department = resolveOrCreateDepartment(request.department());

            if (role == User.Role.STUDENT) {
                short sem = (request.semester() == null || request.semester() < 1)
                    ? 1
                    : request.semester().shortValue();
                String rollNo = "STU" + String.format("%06d", saved.getId());

                Student student = Student.builder()
                    .user(saved)
                    .rollNo(rollNo)
                    .name(request.name().trim())
                    .dob(dob)
                    .department(department)
                    .semester(sem)
                    .section("A")
                    .build();
                studentRepository.save(student);

                jsonBackupService.saveRegistration(
                    email, "STUDENT", student.getName(), student.getRollNo(),
                    department.getName(), student.getSemester(), request.dob());
                jsonBackupService.saveStudentProfile(student, email);
            } else {
                String employeeId = "EMP" + String.format("%06d", saved.getId());

                Professor professor = Professor.builder()
                    .user(saved)
                    .employeeId(employeeId)
                    .name(request.name().trim())
                    .department(department)
                    .designation("Professor")
                    .build();
                professorRepository.save(professor);

                jsonBackupService.saveRegistration(
                    email, role.name(), professor.getName(), employeeId,
                    department.getName(), null, request.dob());
            }
        }

        Map<String, Object> profile = buildProfile(saved);

        return ResponseEntity.ok(Map.of(
            "message", "Account created successfully",
            "user", profile
        ));
    }

    private Map<String, Object> buildProfile(User user) {
        Map<String, Object> base = new java.util.LinkedHashMap<>();
        base.put("id", user.getId());
        base.put("email", user.getEmail());
        base.put("role", user.getRole().name());
        base.put("isHod", user.isHod());

        if (user.getRole() == User.Role.STUDENT) {
            studentRepository.findByUserId(user.getId()).ifPresent(student -> {
                base.put("studentId", student.getId());
                base.put("name", student.getName());
                base.put("rollNo", student.getRollNo());
                base.put("department", student.getDepartment() != null ? student.getDepartment().getCode() : null);
                base.put("semester", student.getSemester());
            });
        } else if (user.getRole() == User.Role.PROFESSOR) {
            professorRepository.findByUserId(user.getId()).ifPresent(prof -> {
                base.put("professorId", prof.getId());
                base.put("name", prof.getName());
                base.put("department", prof.getDepartment() != null ? prof.getDepartment().getCode() : null);
                base.put("departmentId", prof.getDepartment() != null ? prof.getDepartment().getId() : null);
            });
        } else {
            base.put("name", user.getEmail());
        }

        return base;
    }

    private Department resolveOrCreateDepartment(String departmentInput) {
        String raw = departmentInput == null ? "" : departmentInput.trim();
        if (raw.isBlank()) {
            throw new IllegalArgumentException("Department is required");
        }

        return departmentRepository.findByNameIgnoreCase(raw)
            .or(() -> departmentRepository.findByCodeIgnoreCase(raw))
            .orElseGet(() -> {
                String baseCode = raw.replaceAll("[^A-Za-z ]", "")
                    .trim()
                    .replaceAll("\\s+", " ")
                    .toUpperCase();
                String[] parts = baseCode.split(" ");
                String initials = new StringBuilder()
                    .append(parts.length > 0 && !parts[0].isBlank() ? parts[0].charAt(0) : 'D')
                    .append(parts.length > 1 && !parts[1].isBlank() ? parts[1].charAt(0) : 'P')
                    .append(parts.length > 2 && !parts[2].isBlank() ? parts[2].charAt(0) : 'T')
                    .toString();

                String code = initials;
                int suffix = 1;
                while (departmentRepository.findByCodeIgnoreCase(code).isPresent()) {
                    suffix++;
                    code = initials + suffix;
                }

                Department department = Department.builder()
                    .name(raw)
                    .code(code)
                    .build();

                return departmentRepository.save(department);
            });
    }

    // DTOs as records (Java 16+)
    public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password
    ) {}

    public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6) String password,
        @NotBlank String role,
        @NotBlank String dob,
        @NotBlank String department,
        Integer semester
    ) {}
}
