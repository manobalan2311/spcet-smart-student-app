package com.smartstudent.repository;

import com.smartstudent.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /** Notifications relevant to a student (all, department, section, or direct) */
    @Query("""
        SELECT n FROM Notification n WHERE
          n.recipientType = 'ALL'
          OR (n.recipientType = 'DEPARTMENT' AND n.recipientRef = :deptCode)
          OR (n.recipientType = 'SECTION'    AND n.recipientRef = :section)
          OR (n.recipientType = 'STUDENT'    AND n.recipientRef = :rollNo)
        ORDER BY n.createdAt DESC
        """)
    List<Notification> findForStudent(
        @Param("deptCode") String deptCode,
        @Param("section")  String section,
        @Param("rollNo")   String rollNo
    );

    List<Notification> findBySenderIdOrderByCreatedAtDesc(Long senderId);
}
