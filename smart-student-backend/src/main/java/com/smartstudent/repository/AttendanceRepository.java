package com.smartstudent.repository;

import com.smartstudent.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentIdAndSubjectIdAndDateAndPeriodNumber(
        Long studentId,
        Long subjectId,
        LocalDate date,
        Short periodNumber
    );

    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByDateAndSubjectId(LocalDate date, Long subjectId);
}