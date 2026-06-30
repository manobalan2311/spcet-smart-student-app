package com.smartstudent.repository;

import com.smartstudent.model.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query(value = """
        SELECT
          u.id                         AS userId,
          u.email                      AS email,
          u.role                       AS role,
          u.is_hod                     AS isHod,
          u.is_active                  AS isActive,
          u.created_at                 AS createdAt,
          COALESCE(s.name, p.name, '') AS fullName,
          s.roll_no                    AS rollNo,
          p.employee_id                AS employeeId,
          d.name                       AS departmentName,
          d.code                       AS departmentCode,
          s.semester                   AS semester,
          s.section                    AS section
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN professors p ON p.user_id = u.id
        LEFT JOIN departments d ON d.id = COALESCE(s.department_id, p.department_id)
        ORDER BY u.created_at DESC
        """, nativeQuery = true)
    List<AccountDetailsView> findAccountDetails();

    interface AccountDetailsView {
        Long getUserId();
        String getEmail();
        String getRole();
        Boolean getIsHod();
        Boolean getIsActive();
        LocalDateTime getCreatedAt();
        String getFullName();
        String getRollNo();
        String getEmployeeId();
        String getDepartmentName();
        String getDepartmentCode();
        Short getSemester();
        String getSection();
    }
}
