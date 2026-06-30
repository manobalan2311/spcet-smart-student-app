package com.smartstudent.controller;

import com.smartstudent.model.*;
import com.smartstudent.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProfessorController {

    private final InternalMarksRepository internalMarksRepository;
    private final NotificationRepository  notificationRepository;
    private final StudentRepository       studentRepository;
    private final ProfessorRepository     professorRepository;
    private final DepartmentRepository    departmentRepository;
    private final SubjectRepository       subjectRepository;
    private final UserRepository          userRepository;
    private final PasswordEncoder         passwordEncoder;

    public ProfessorController(
        InternalMarksRepository internalMarksRepository,
        NotificationRepository  notificationRepository,
        StudentRepository       studentRepository,
        ProfessorRepository     professorRepository,
        DepartmentRepository    departmentRepository,
        SubjectRepository       subjectRepository,
        UserRepository          userRepository,
        PasswordEncoder         passwordEncoder
    ) {
        this.internalMarksRepository = internalMarksRepository;
        this.notificationRepository  = notificationRepository;
        this.studentRepository       = studentRepository;
        this.professorRepository     = professorRepository;
        this.departmentRepository    = departmentRepository;
        this.subjectRepository       = subjectRepository;
        this.userRepository          = userRepository;
        this.passwordEncoder         = passwordEncoder;
    }

    /** Add / update a single student's IA mark */
    @PostMapping("/internal-marks")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD')")
    public ResponseEntity<?> addInternalMarks(@Valid @RequestBody InternalMarkRequest req) {
        Student student  = studentRepository.findById(req.studentId())
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Subject subject  = subjectRepository.findById(req.subjectId())
            .orElseThrow(() -> new IllegalArgumentException("Subject not found"));
        Professor prof   = professorRepository.findById(req.professorId())
            .orElseThrow(() -> new IllegalArgumentException("Professor not found"));

        InternalMarks mark = internalMarksRepository
            .findByStudentIdAndSubjectIdAndIaNumber(req.studentId(), req.subjectId(), req.iaNumber())
            .orElseGet(() -> InternalMarks.builder()
                .student(student)
                .subject(subject)
                .addedBy(prof)
                .build());

        mark.setSubject(subject);
        mark.setMarks(req.marks());
        mark.setIaNumber(req.iaNumber());
        InternalMarks saved = internalMarksRepository.save(mark);

        Map<String, Object> dto = new java.util.LinkedHashMap<>();
        dto.put("id", saved.getId());
        dto.put("studentId", student.getId());
        dto.put("subjectId", subject.getId());
        dto.put("iaNumber", saved.getIaNumber());
        dto.put("marks", saved.getMarks());
        dto.put("maxMarks", saved.getMaxMarks());
        return ResponseEntity.ok(dto);
    }

    /** List subjects available to a professor (scoped to their department) */
    @GetMapping("/professors/{professorId}/subjects")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD')")
    public ResponseEntity<?> getProfessorSubjects(@PathVariable Long professorId) {
        Professor prof = professorRepository.findById(professorId)
            .orElseThrow(() -> new IllegalArgumentException("Professor not found"));
        Department dept = prof.getDepartment();

        List<Subject> subjects = subjectRepository.findByDepartmentId(dept.getId());
        if (subjects.isEmpty()) {
            subjects = provisionDefaultSubjects(dept);
        }

        List<Map<String, Object>> dtos = subjects.stream().map(s -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("code", s.getCode());
            m.put("name", s.getName());
            m.put("semester", s.getSemester());
            return m;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    /** Seed a default set of subjects for a department that has none yet */
    private List<Subject> provisionDefaultSubjects(Department dept) {
        String[] names = {
            "Data Structures & Algorithms",
            "Database Management Systems",
            "Operating Systems",
            "Computer Networks",
            "Software Engineering",
            "Web Technologies"
        };
        List<Subject> created = new java.util.ArrayList<>();
        for (int i = 0; i < names.length; i++) {
            Subject subject = Subject.builder()
                .code(dept.getCode() + "-" + (i + 1))
                .name(names[i])
                .department(dept)
                .semester((short) 6)
                .credits((short) 3)
                .build();
            created.add(subjectRepository.save(subject));
        }
        return created;
    }

    /** Get a professor's profile */
    @GetMapping("/professors/{id}/profile")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD','MANAGEMENT')")
    public ResponseEntity<?> getProfessorProfile(@PathVariable Long id) {
        return professorRepository.findById(id).map(prof -> {
            Map<String, Object> dto = new java.util.LinkedHashMap<>();
            dto.put("id", prof.getId());
            dto.put("name", prof.getName());
            dto.put("employeeId", prof.getEmployeeId());
            dto.put("email", prof.getUser() != null ? prof.getUser().getEmail() : null);
            dto.put("phone", prof.getPhone());
            dto.put("department", prof.getDepartment() != null ? prof.getDepartment().getName() : null);
            dto.put("designation", prof.getDesignation());
            dto.put("qualification", prof.getQualification());
            dto.put("profilePhoto", prof.getProfilePhoto());
            return ResponseEntity.ok((Object) dto);
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Update a professor's own profile */
    @PutMapping("/professors/{id}/profile")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD')")
    public ResponseEntity<?> updateProfessorProfile(
        @PathVariable Long id,
        @RequestBody ProfessorProfileUpdate req
    ) {
        return professorRepository.findById(id).map(prof -> {
            if (req.name() != null && !req.name().isBlank()) {
                prof.setName(req.name().trim());
            }
            prof.setPhone(req.phone());
            prof.setDesignation(req.designation());
            prof.setQualification(req.qualification());
            professorRepository.save(prof);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Send a notification to students */
    @PostMapping("/notifications")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD','MANAGEMENT')")
    public ResponseEntity<?> sendNotification(
        @Valid @RequestBody NotificationRequest req,
        @RequestAttribute("userId") Long userId
    ) {
        User sender = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        Notification notif = Notification.builder()
            .sender(sender)
            .senderRole(Notification.SenderRole.PROFESSOR)
            .recipientType(Notification.RecipientType.valueOf(req.recipientType().toUpperCase()))
            .recipientRef(req.recipientRef())
            .title(req.title())
            .message(req.message())
            .notifType(Notification.NotifType.valueOf(req.notifType().toUpperCase()))
            .build();

        return ResponseEntity.ok(notificationRepository.save(notif));
    }

    /** List students for teacher portal */
    @GetMapping("/professors/students")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD')")
    public ResponseEntity<?> getStudentsForTeacherPortal(
        @RequestParam Long departmentId,
        @RequestParam(required = false) Short semester,
        @RequestParam(required = false) String section
    ) {
        List<Student> students;
        if (semester != null && section != null && !section.isBlank()) {
            students = studentRepository.findByDepartmentIdAndSemesterAndSection(
                departmentId,
                semester,
                section.toUpperCase()
            );
        } else {
            students = studentRepository.findByDepartmentId(departmentId);
        }

        List<Map<String, Object>> dtos = students.stream().map(this::toStudentDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /** Map a Student entity to a safe DTO with full personal details (no passwordHash) */
    private Map<String, Object> toStudentDto(Student s) {
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("rollNo", s.getRollNo());
        m.put("name", s.getName());
        m.put("email", s.getUser() != null ? s.getUser().getEmail() : null);
        m.put("phone", s.getPhone());
        m.put("dob", s.getDob());
        m.put("bloodGroup", s.getBloodGroup());
        m.put("address", s.getAddress());
        m.put("department", s.getDepartment() != null ? s.getDepartment().getName() : null);
        m.put("departmentId", s.getDepartment() != null ? s.getDepartment().getId() : null);
        m.put("batch", s.getBatch());
        m.put("semester", s.getSemester());
        m.put("section", s.getSection());
        m.put("parentName", s.getParentName());
        m.put("parentPhone", s.getParentPhone());
        m.put("profilePhoto", s.getProfilePhoto());
        return m;
    }

    /** Create student from teacher portal */
    @PostMapping("/professors/students")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD')")
    public ResponseEntity<?> createStudentFromTeacherPortal(@Valid @RequestBody CreateStudentRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }
        if (studentRepository.findByRollNo(req.rollNo()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Roll number already exists"));
        }

        Department department = departmentRepository.findById(req.departmentId())
            .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        String rawPassword = (req.password() == null || req.password().isBlank())
            ? req.rollNo() + "@123"
            : req.password();

        User studentUser = User.builder()
            .email(req.email())
            .passwordHash(passwordEncoder.encode(rawPassword))
            .role(User.Role.STUDENT)
            .isHod(false)
            .isActive(true)
            .build();
        User savedUser = userRepository.save(studentUser);

        Student student = Student.builder()
            .user(savedUser)
            .rollNo(req.rollNo())
            .name(req.name())
            .dob(req.dob())
            .bloodGroup(req.bloodGroup())
            .phone(req.phone())
            .address(req.address())
            .department(department)
            .batch(req.batch())
            .semester(req.semester())
            .section(req.section() == null ? null : req.section().toUpperCase())
            .parentName(req.parentName())
            .parentPhone(req.parentPhone())
            .profilePhoto(req.profilePhoto())
            .build();

        Student savedStudent = studentRepository.save(student);
        return ResponseEntity.ok(Map.of(
            "message", "Student created successfully",
            "student", toStudentDto(savedStudent),
            "defaultPassword", rawPassword
        ));
    }

    /** Update student from teacher portal */
    @PutMapping("/professors/students/{studentId}")
    @PreAuthorize("hasAnyRole('PROFESSOR','HOD')")
    public ResponseEntity<?> updateStudentFromTeacherPortal(
        @PathVariable Long studentId,
        @Valid @RequestBody UpdateStudentRequest req
    ) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (req.rollNo() != null && !req.rollNo().isBlank()) {
            studentRepository.findByRollNo(req.rollNo()).ifPresent(existing -> {
                if (!existing.getId().equals(studentId)) {
                    throw new IllegalArgumentException("Roll number already exists");
                }
            });
            student.setRollNo(req.rollNo());
        }

        Department department = departmentRepository.findById(req.departmentId())
            .orElseThrow(() -> new IllegalArgumentException("Department not found"));

        student.setName(req.name());
        student.setDob(req.dob());
        student.setBloodGroup(req.bloodGroup());
        student.setPhone(req.phone());
        student.setAddress(req.address());
        student.setDepartment(department);
        student.setBatch(req.batch());
        student.setSemester(req.semester());
        student.setSection(req.section() == null ? null : req.section().toUpperCase());
        student.setParentName(req.parentName());
        student.setParentPhone(req.parentPhone());
        student.setProfilePhoto(req.profilePhoto());

        return ResponseEntity.ok(Map.of(
            "message", "Student updated successfully",
            "student", toStudentDto(studentRepository.save(student))
        ));
    }

    // ── Request records ─────────────────────────────────────────
    public record InternalMarkRequest(
        @NotNull Long studentId,
        @NotNull Long subjectId,
        @NotNull Long professorId,
        @NotNull @Min(1) @Max(3) Short iaNumber,
        @NotNull @DecimalMin("0") @DecimalMax("20") Double marks
    ) {}

    public record ProfessorProfileUpdate(
        String name,
        String phone,
        String designation,
        String qualification
    ) {}

    public record NotificationRequest(
        @NotBlank String recipientType,
        String recipientRef,
        @NotBlank String title,
        @NotBlank String message,
        String notifType
    ) {}

    public record CreateStudentRequest(
        @NotBlank String email,
        String password,
        @NotBlank String rollNo,
        @NotBlank String name,
        LocalDate dob,
        String bloodGroup,
        String phone,
        String address,
        @NotNull Long departmentId,
        String batch,
        @NotNull @Min(1) @Max(12) Short semester,
        String section,
        String parentName,
        String parentPhone,
        String profilePhoto
    ) {}

    public record UpdateStudentRequest(
        String rollNo,
        @NotBlank String name,
        LocalDate dob,
        String bloodGroup,
        String phone,
        String address,
        @NotNull Long departmentId,
        String batch,
        @NotNull @Min(1) @Max(12) Short semester,
        String section,
        String parentName,
        String parentPhone,
        String profilePhoto
    ) {}
}
