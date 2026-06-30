package com.smartstudent.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "roll_no", nullable = false, unique = true, length = 20)
    private String rollNo;

    @Column(nullable = false, length = 120)
    private String name;

    private LocalDate dob;

    @Column(name = "blood_group", length = 5)
    private String bloodGroup;

    @Column(length = 15)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(length = 20)
    private String batch;

    private Short semester;

    @Column(length = 1)
    private String section;

    @Column(name = "parent_name", length = 120)
    private String parentName;

    @Column(name = "parent_phone", length = 15)
    private String parentPhone;

    @Column(name = "profile_photo", length = 300)
    private String profilePhoto;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
