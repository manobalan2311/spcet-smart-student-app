package com.smartstudent.repository;

import com.smartstudent.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByCode(String code);
    Optional<Department> findByCodeIgnoreCase(String code);
    Optional<Department> findByNameIgnoreCase(String name);
}