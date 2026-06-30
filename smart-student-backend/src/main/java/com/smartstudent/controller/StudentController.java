package com.smartstudent.controller;

import com.smartstudent.model.*;
import com.smartstudent.repository.*;
import com.smartstudent.service.JsonBackupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final InternalMarksRepository internalMarksRepository;
    private final NotificationRepository notificationRepository;
    private final JsonBackupService jsonBackupService;

    public StudentController(
        StudentRepository studentRepository,
        InternalMarksRepository internalMarksRepository,
        NotificationRepository notificationRepository,
        JsonBackupService jsonBackupService
    ) {
        this.studentRepository       = studentRepository;
        this.internalMarksRepository = internalMarksRepository;
        this.notificationRepository  = notificationRepository;
        this.jsonBackupService       = jsonBackupService;
    }

    @GetMapping("/{id}/profile")
    @PreAuthorize("hasAnyRole('STUDENT','HOD','MANAGEMENT')")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return studentRepository.findById(id).map(student -> {
            Map<String, Object> dto = new java.util.LinkedHashMap<>();
            dto.put("id", student.getId());
            dto.put("name", student.getName());
            dto.put("rollNo", student.getRollNo());
            dto.put("email", student.getUser() != null ? student.getUser().getEmail() : null);
            dto.put("dob", student.getDob());
            dto.put("bloodGroup", student.getBloodGroup());
            dto.put("phone", student.getPhone());
            dto.put("address", student.getAddress());
            dto.put("department", student.getDepartment() != null ? student.getDepartment().getName() : null);
            dto.put("batch", student.getBatch());
            dto.put("semester", student.getSemester());
            dto.put("section", student.getSection());
            dto.put("parentName", student.getParentName());
            dto.put("parentPhone", student.getParentPhone());
            dto.put("profilePhoto", student.getProfilePhoto());
            return ResponseEntity.ok((Object) dto);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Student updatedData) {
        return studentRepository.findById(id).map(student -> {
            if (updatedData.getName() != null && !updatedData.getName().isBlank()) {
                student.setName(updatedData.getName().trim());
            }
            if (updatedData.getDob() != null) {
                student.setDob(updatedData.getDob());
            }
            student.setBloodGroup(updatedData.getBloodGroup());
            student.setPhone(updatedData.getPhone());
            student.setAddress(updatedData.getAddress());
            student.setParentName(updatedData.getParentName());
            student.setParentPhone(updatedData.getParentPhone());
            studentRepository.save(student);
            jsonBackupService.saveStudentProfile(
                student, student.getUser() != null ? student.getUser().getEmail() : null);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{studentId}/internal-marks")
    @PreAuthorize("hasAnyRole('STUDENT','PROFESSOR','HOD','MANAGEMENT')")
    public ResponseEntity<List<Map<String, Object>>> getInternalMarks(@PathVariable Long studentId) {
        List<Map<String, Object>> dtos = internalMarksRepository.findByStudentId(studentId).stream()
            .map(mark -> {
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("id", mark.getId());
                m.put("subjectId", mark.getSubject() != null ? mark.getSubject().getId() : null);
                m.put("subjectCode", mark.getSubject() != null ? mark.getSubject().getCode() : null);
                m.put("subjectName", mark.getSubject() != null ? mark.getSubject().getName() : null);
                m.put("iaNumber", mark.getIaNumber());
                m.put("marks", mark.getMarks());
                m.put("maxMarks", mark.getMaxMarks());
                return m;
            })
            .toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{studentId}/notifications")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getNotifications(@PathVariable Long studentId) {
        return studentRepository.findById(studentId).map(student -> {
            String deptCode = student.getDepartment().getCode();
            String section  = student.getSection();
            String rollNo   = student.getRollNo();
            List<Notification> notifs = notificationRepository
                .findForStudent(deptCode, section, rollNo);
            return ResponseEntity.ok(notifs);
        }).orElse(ResponseEntity.notFound().build());
    }
}
