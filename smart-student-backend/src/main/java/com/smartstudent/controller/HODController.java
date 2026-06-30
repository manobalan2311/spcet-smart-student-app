package com.smartstudent.controller;

import com.smartstudent.model.Attendance;
import com.smartstudent.model.Professor;
import com.smartstudent.model.Student;
import com.smartstudent.model.Subject;
import com.smartstudent.repository.AttendanceRepository;
import com.smartstudent.repository.ProfessorRepository;
import com.smartstudent.repository.StudentRepository;
import com.smartstudent.repository.SubjectRepository;
import com.smartstudent.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/hod")
@PreAuthorize("hasAnyRole('HOD','MANAGEMENT')")
public class HODController {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final ProfessorRepository professorRepository;
    private final UserRepository userRepository;

    public HODController(
        AttendanceRepository attendanceRepository,
        StudentRepository studentRepository,
        SubjectRepository subjectRepository,
        ProfessorRepository professorRepository,
        UserRepository userRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.professorRepository = professorRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(studentRepository.findAll());
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<?> getStudentDetail(@PathVariable Long id) {
        return studentRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /** Newly created account details in table-friendly format */
    @GetMapping("/accounts")
    public ResponseEntity<?> getAccountDetails() {
        return ResponseEntity.ok(userRepository.findAccountDetails());
    }

    /** Get attendance rows, with optional filters */
    @GetMapping("/attendance")
    public ResponseEntity<?> getAttendance(
        @RequestParam(required = false) String date,
        @RequestParam(required = false) Long subjectId,
        @RequestParam(required = false) Long departmentId,
        @RequestParam(required = false) Short semester,
        @RequestParam(required = false) String section
    ) {
        List<Attendance> base = (date == null || date.isBlank())
            ? attendanceRepository.findAll()
            : (subjectId == null
                ? attendanceRepository.findByDate(LocalDate.parse(date))
                : attendanceRepository.findByDateAndSubjectId(LocalDate.parse(date), subjectId));

        Stream<Attendance> stream = base.stream();

        if (departmentId != null) {
            stream = stream.filter(a ->
                a.getStudent() != null
                    && a.getStudent().getDepartment() != null
                    && departmentId.equals(a.getStudent().getDepartment().getId()));
        }

        if (semester != null) {
            stream = stream.filter(a ->
                a.getStudent() != null
                    && a.getStudent().getSemester() != null
                    && semester.equals(a.getStudent().getSemester()));
        }

        if (section != null && !section.isBlank()) {
            String normalized = section.trim().toUpperCase();
            stream = stream.filter(a ->
                a.getStudent() != null
                    && a.getStudent().getSection() != null
                    && normalized.equals(a.getStudent().getSection().toUpperCase()));
        }

        List<Map<String, Object>> response = stream
            .sorted(Comparator
                .comparing((Attendance a) -> a.getDate() == null ? LocalDate.MIN : a.getDate())
                .thenComparing(a -> a.getPeriodNumber() == null ? 0 : a.getPeriodNumber())
                .thenComparing(a -> a.getStudent() == null ? "" : a.getStudent().getRollNo()))
            .map(a -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", a.getId());
                row.put("studentId", a.getStudent().getId());
                row.put("studentName", a.getStudent().getName());
                row.put("rollNo", a.getStudent().getRollNo());
                row.put("subjectId", a.getSubject().getId());
                row.put("date", a.getDate());
                row.put("periodNumber", a.getPeriodNumber());
                row.put("status", a.getStatus().name());
                row.put("semester", a.getStudent().getSemester());
                row.put("section", a.getStudent().getSection());
                return row;
            })
            .toList();

        return ResponseEntity.ok(response);
    }

    /** Create or update one attendance row */
    @PostMapping("/attendance")
    public ResponseEntity<?> saveAttendance(@Valid @RequestBody AttendanceUpsertRequest req) {
        Student student = studentRepository.findById(req.studentId())
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Subject subject = subjectRepository.findById(req.subjectId())
            .orElseThrow(() -> new IllegalArgumentException("Subject not found"));

        Attendance attendance = attendanceRepository
            .findByStudentIdAndSubjectIdAndDateAndPeriodNumber(
                req.studentId(),
                req.subjectId(),
                req.date(),
                req.periodNumber()
            )
            .orElseGet(() -> Attendance.builder()
                .student(student)
                .subject(subject)
                .date(req.date())
                .periodNumber(req.periodNumber())
                .build());

        attendance.setStatus(req.status());

        if (req.markedByProfessorId() != null) {
            Professor markedBy = professorRepository.findById(req.markedByProfessorId())
                .orElseThrow(() -> new IllegalArgumentException("Professor not found"));
            attendance.setMarkedBy(markedBy);
        }

        Attendance saved = attendanceRepository.save(attendance);
        return ResponseEntity.ok(Map.of(
            "message", "Attendance saved",
            "id", saved.getId(),
            "studentId", saved.getStudent().getId(),
            "subjectId", saved.getSubject().getId(),
            "date", saved.getDate(),
            "periodNumber", saved.getPeriodNumber(),
            "status", saved.getStatus().name()
        ));
    }

    /** Students with attendance below 75% */
    @GetMapping("/students/low-attendance")
    public ResponseEntity<?> getLowAttendanceStudents() {
        return ResponseEntity.ok(studentRepository.findLowAttendanceStudents(75.0));
    }

    /** Students with average IA below 50% */
    @GetMapping("/students/low-marks")
    public ResponseEntity<?> getLowMarksStudents() {
        return ResponseEntity.ok(studentRepository.findLowMarksStudents(50.0));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDeptStats() {
        long totalStudents     = studentRepository.count();
        long lowAttStudents    = studentRepository.findLowAttendanceStudents(75.0).size();
        long lowMarksStudents  = studentRepository.findLowMarksStudents(50.0).size();
        return ResponseEntity.ok(java.util.Map.of(
            "totalStudents",    totalStudents,
            "lowAttendance",    lowAttStudents,
            "lowMarks",         lowMarksStudents
        ));
    }

    public record AttendanceUpsertRequest(
        @NotNull Long studentId,
        @NotNull Long subjectId,
        @NotNull LocalDate date,
        @NotNull Short periodNumber,
        @NotNull Attendance.Status status,
        Long markedByProfessorId
    ) {
    }
}
