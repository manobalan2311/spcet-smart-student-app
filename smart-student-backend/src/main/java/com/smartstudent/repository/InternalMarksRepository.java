package com.smartstudent.repository;

import com.smartstudent.model.InternalMarks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InternalMarksRepository extends JpaRepository<InternalMarks, Long> {
    List<InternalMarks> findByStudentId(Long studentId);
    List<InternalMarks> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    Optional<InternalMarks> findByStudentIdAndSubjectIdAndIaNumber(Long studentId, Long subjectId, Short iaNumber);
    List<InternalMarks> findBySubjectIdAndIaNumber(Long subjectId, Short iaNumber);
}
