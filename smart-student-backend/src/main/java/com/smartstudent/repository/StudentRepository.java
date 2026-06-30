package com.smartstudent.repository;

import com.smartstudent.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(Long userId);
    Optional<Student> findByRollNo(String rollNo);
    List<Student> findByDepartmentId(Long departmentId);

    List<Student> findByDepartmentIdAndSemesterAndSection(
        Long departmentId, Short semester, String section);

    @Query(value = """
        SELECT s.* FROM students s
        JOIN attendance a ON s.id = a.student_id
        GROUP BY s.id
        HAVING ROUND(
            SUM(CASE WHEN a.status IN ('PRESENT', 'OD') THEN 1 ELSE 0 END) * 100.0 / COUNT(*),
            2
        ) < :threshold
        """, nativeQuery = true)
    List<Student> findLowAttendanceStudents(@Param("threshold") double threshold);

    // Using native query for low marks based on average IA
    @Query(value = """
        SELECT s.* FROM students s
        JOIN internal_marks im ON s.id = im.student_id
        GROUP BY s.id
        HAVING AVG(im.marks / im.max_marks * 100) < :threshold
        """, nativeQuery = true)
    List<Student> findLowMarksStudents(@Param("threshold") double threshold);
}
